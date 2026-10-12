import prisma from './prisma';

export interface ComplianceState {
  realMoneyEnabled: boolean;
  paidPrizeDrawsEnabled: boolean;
  referralBonusEnabled: boolean;
  demoModeActive: boolean;
  winnerSelectionMode: 'RANKING' | 'RANDOM_DRAW';
  legalReviewStatus: string;
  legalReviewNotes: string;
  counselApprovalDate: string | null;
}

export const DEFAULT_COMPLIANCE_STATE: ComplianceState = {
  realMoneyEnabled: false,
  paidPrizeDrawsEnabled: false,
  referralBonusEnabled: true, // Bonus logic enabled in demo/sandbox mode
  demoModeActive: true,
  winnerSelectionMode: 'RANKING',
  legalReviewStatus: 'PENDING_PAKISTAN_LEGAL_COUNSEL_REVIEW',
  legalReviewNotes: 'Real-money payments and paid prize allocations are strictly disabled pending formal legal review by licensed Pakistani legal counsel under provincial prize competitions acts and gambling regulations.',
  counselApprovalDate: null,
};

export async function getComplianceSettings(): Promise<ComplianceState> {
  try {
    const settings = await prisma.platformSetting.findMany({
      where: {
        key: {
          in: [
            'REAL_MONEY_PAYMENTS_ENABLED',
            'PAID_PRIZE_DRAWS_ENABLED',
            'REFERRAL_BONUS_ENABLED',
            'DEMO_MODE_ACTIVE',
            'WINNER_SELECTION_MODE',
            'LEGAL_REVIEW_STATUS',
            'LEGAL_REVIEW_NOTES',
            'COUNSEL_APPROVAL_DATE',
          ],
        },
      },
    });

    const map = new Map(settings.map((s) => [s.key, s.value]));

    return {
      realMoneyEnabled: map.get('REAL_MONEY_PAYMENTS_ENABLED') === 'true',
      paidPrizeDrawsEnabled: map.get('PAID_PRIZE_DRAWS_ENABLED') === 'true',
      referralBonusEnabled: map.get('REFERRAL_BONUS_ENABLED') !== 'false',
      demoModeActive: map.get('DEMO_MODE_ACTIVE') !== 'false',
      winnerSelectionMode: (map.get('WINNER_SELECTION_MODE') as 'RANKING' | 'RANDOM_DRAW') || 'RANKING',
      legalReviewStatus: map.get('LEGAL_REVIEW_STATUS') || DEFAULT_COMPLIANCE_STATE.legalReviewStatus,
      legalReviewNotes: map.get('LEGAL_REVIEW_NOTES') || DEFAULT_COMPLIANCE_STATE.legalReviewNotes,
      counselApprovalDate: map.get('COUNSEL_APPROVAL_DATE') || null,
    };
  } catch (error) {
    console.warn('Falling back to default compliance settings:', error);
    return DEFAULT_COMPLIANCE_STATE;
  }
}

export async function canProcessRealMoney(): Promise<boolean> {
  const compliance = await getComplianceSettings();
  return compliance.realMoneyEnabled && compliance.legalReviewStatus === 'APPROVED_BY_LEGAL_COUNSEL';
}

export async function canIssueReferralBonus(): Promise<boolean> {
  const compliance = await getComplianceSettings();
  return compliance.referralBonusEnabled;
}
