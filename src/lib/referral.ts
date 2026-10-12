import prisma from './prisma';

/**
 * Attaches a referral to a new user upon registration
 */
export async function attachReferral({
  refereeId,
  referralCode,
  ipAddress,
}: {
  refereeId: string;
  referralCode: string;
  ipAddress?: string;
}) {
  if (!referralCode) return null;

  const cleanCode = referralCode.trim().toUpperCase();
  const referrer = await prisma.user.findUnique({
    where: { referralCode: cleanCode },
  });

  if (!referrer) return null;

  // Anti-fraud: Cannot refer yourself
  if (referrer.id === refereeId) {
    return null;
  }

  // Check if referral link already recorded
  const existing = await prisma.referral.findUnique({
    where: { refereeId },
  });

  if (existing) {
    return existing;
  }

  // Link the referee to referrer
  await prisma.user.update({
    where: { id: refereeId },
    data: { referredById: referrer.id },
  });

  const referral = await prisma.referral.create({
    data: {
      referrerId: referrer.id,
      refereeId,
      status: 'PENDING',
      bonusEntryAwarded: false,
      ipAddress,
    },
  });

  return referral;
}

/**
 * Validates and converts referral upon the referee making their first eligible draw entry.
 * Awards EXACTLY ONE bonus entry to the referrer for the qualifying draw.
 */
export async function processReferralConversion({
  refereeId,
  drawId,
}: {
  refereeId: string;
  drawId: string;
}) {
  // Use a database transaction to ensure atomicity and idempotency
  return await prisma.$transaction(async (tx) => {
    const referral = await tx.referral.findUnique({
      where: { refereeId },
      include: {
        referrer: true,
        referee: true,
      },
    });

    if (!referral) return null;

    // Check if bonus already awarded
    if (referral.bonusEntryAwarded || referral.status === 'VERIFIED') {
      return referral;
    }

    // Anti-fraud check: Prevent self-referral
    if (referral.referrerId === refereeId) {
      await tx.referral.update({
        where: { id: referral.id },
        data: {
          status: 'FRAUDULENT',
          fraudFlags: 'SELF_REFERRAL_DETECTED',
        },
      });
      return null;
    }

    const draw = await tx.draw.findUnique({
      where: { id: drawId },
    });

    if (!draw || draw.status !== 'ACTIVE') {
      return null;
    }

    // Generate unique bonus entry number
    const uniqueBonusNumber = `10KK-BONUS-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    // 1. Create exactly one bonus entry for the referrer
    const bonusEntry = await tx.drawEntry.create({
      data: {
        entryNumber: uniqueBonusNumber,
        userId: referral.referrerId,
        drawId,
        entryType: 'REFERRAL_BONUS',
        status: 'ACTIVE',
        referralId: referral.id,
        notes: `Bonus entry earned from verified referral of ${referral.referee.fullName} (${referral.referee.phone})`,
      },
    });

    // 2. Mark referral as VERIFIED and record bonus issuance
    const updatedReferral = await tx.referral.update({
      where: { id: referral.id },
      data: {
        status: 'VERIFIED',
        drawId,
        bonusEntryAwarded: true,
        bonusEntryId: bonusEntry.id,
        verifiedAt: new Date(),
      },
    });

    // 3. Increment total entries count for the draw
    await tx.draw.update({
      where: { id: drawId },
      data: {
        totalEntriesCount: { increment: 1 },
      },
    });

    return {
      referral: updatedReferral,
      bonusEntry,
    };
  });
}

/**
 * Reverses a referral bonus entry if payment was refunded or deemed fraudulent
 */
export async function reverseReferralBonus({
  referralId,
  reason,
}: {
  referralId: string;
  reason: string;
}) {
  return await prisma.$transaction(async (tx) => {
    const referral = await tx.referral.findUnique({
      where: { id: referralId },
    });

    if (!referral || !referral.bonusEntryAwarded || !referral.bonusEntryId) {
      return null;
    }

    // Set bonus entry status to REVERSED
    await tx.drawEntry.update({
      where: { id: referral.bonusEntryId },
      data: {
        status: 'REVERSED',
        notes: `Entry reversed: ${reason}`,
      },
    });

    // Update referral record
    const updatedReferral = await tx.referral.update({
      where: { id: referral.id },
      data: {
        status: 'REVERSED',
        fraudFlags: reason,
      },
    });

    if (referral.drawId) {
      await tx.draw.update({
        where: { id: referral.drawId },
        data: {
          totalEntriesCount: { decrement: 1 },
        },
      });
    }

    return updatedReferral;
  });
}

/**
 * Privacy-preserving name formatter: e.g. "Muhammad Ali Khan" -> "Muhammad A."
 * or "03012345678" -> "0301-***5678"
 */
export function formatMaskedDisplayName(fullName: string, phone?: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length > 1) {
    return `${parts[0]} ${parts[parts.length - 1][0]}.`;
  }
  if (parts.length === 1 && parts[0].length > 0) {
    return parts[0];
  }
  if (phone) {
    const clean = phone.replace(/\D/g, '');
    if (clean.length >= 8) {
      return `${clean.slice(0, 4)}-***${clean.slice(-4)}`;
    }
  }
  return 'Participant';
}

/**
 * Retrieves the live leaderboard rankings based on verified successful referrals
 * Applies the strict tie-breaking rule: earliest timestamp of achieving the referral total
 */
export async function getReferralLeaderboard(limit = 20) {
  // Aggregate verified referrals grouped by referrerId
  const verifiedReferrals = await prisma.referral.findMany({
    where: { status: 'VERIFIED' },
    select: {
      referrerId: true,
      verifiedAt: true,
    },
    orderBy: { verifiedAt: 'asc' },
  });

  const statsMap = new Map<
    string,
    { count: number; earliestVerifiedAt: Date; latestVerifiedAt: Date }
  >();

  for (const ref of verifiedReferrals) {
    const existing = statsMap.get(ref.referrerId);
    const date = ref.verifiedAt || new Date();
    if (!existing) {
      statsMap.set(ref.referrerId, {
        count: 1,
        earliestVerifiedAt: date,
        latestVerifiedAt: date,
      });
    } else {
      existing.count += 1;
      if (date > existing.latestVerifiedAt) {
        existing.latestVerifiedAt = date;
      }
    }
  }

  // Get user details for everyone on the leaderboard
  const userIds = Array.from(statsMap.keys());
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: {
      id: true,
      fullName: true,
      phone: true,
      createdAt: true,
    },
  });

  const userMap = new Map(users.map((u) => [u.id, u]));

  // Also count total eligible entries for each user
  const entryCounts = await prisma.drawEntry.groupBy({
    by: ['userId'],
    where: {
      userId: { in: userIds },
      status: 'ACTIVE',
    },
    _count: { id: true },
  });

  const entryMap = new Map(entryCounts.map((e) => [e.userId, e._count.id]));

  // Build ranking items
  const leaderboardItems = userIds.map((userId) => {
    const stats = statsMap.get(userId)!;
    const user = userMap.get(userId);
    return {
      userId,
      maskedName: user ? formatMaskedDisplayName(user.fullName, user.phone) : 'Participant',
      successfulReferrals: stats.count,
      eligibleBonusEntries: stats.count,
      totalEntries: entryMap.get(userId) || stats.count,
      latestMilestoneTimestamp: stats.latestVerifiedAt,
      registeredAt: user?.createdAt || new Date(),
    };
  });

  // Strict sorting & tie-breaking:
  // 1. Highest successful referrals
  // 2. Earliest timestamp of achieving that referral count (latestMilestoneTimestamp ascending)
  leaderboardItems.sort((a, b) => {
    if (b.successfulReferrals !== a.successfulReferrals) {
      return b.successfulReferrals - a.successfulReferrals;
    }
    return a.latestMilestoneTimestamp.getTime() - b.latestMilestoneTimestamp.getTime();
  });

  // Assign ranks
  const ranked = leaderboardItems.slice(0, limit).map((item, index) => ({
    rank: index + 1,
    ...item,
    status:
      index === 0
        ? 'First Place (1st Prize Contender - CD 70 2027)'
        : index === 1
        ? 'Second Place (2nd Prize Contender - iPhone 17 Pro Max)'
        : index === 2
        ? 'Third Place (3rd Prize Contender - Android Smartphone)'
        : 'Top Performer',
  }));

  return {
    items: ranked,
    totalEligibleParticipants: leaderboardItems.length,
    lastUpdated: new Date().toISOString(),
    tieBreakerRule: 'Ties broken by the earliest timestamp at which the verified referral total was achieved.',
  };
}
