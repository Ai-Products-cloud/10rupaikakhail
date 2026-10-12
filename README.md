# 10kakhail — Pakistan's Online Lucky Draw & Referral Platform

**10kakhail** (10 Ka Khel / 10 Ka Khail) is a modern, responsive, secure full-stack lucky draw platform designed specifically for users in Pakistan. The platform introduces a micro-entry model with a proposed **PKR 10** fee, an organic referral bonus mechanism, real-time leaderboard standings, interactive 3D prize showcases, and role-based administrative governance.

---

## ⚠️ Important Legal & Regulatory Pre-Launch Compliance

In accordance with Pakistani statutory frameworks, provincial lottery regulations, and consumer protection acts:
- **Real-money payments and paid prize allocations default to DISABLED.**
- The platform operates in a **Sandbox Demo Mode** using simulated mobile wallets (simulated JazzCash, Easypaisa, and 1-Click Sandbox).
- Before collecting any real money in production, documented confirmation from licensed Pakistani legal counsel and payment gateway merchant approvals must be obtained.
- Administrators can audit and toggle independent compliance feature flags in the Admin Panel (`/admin/compliance`), with every modification logged in the immutable audit trail.

---

## 🏆 Featured Prizes (with Real-Time 3D Interactive Models)

The homepage and prize catalog feature dedicated interactive Three.js 3D models with 360° mouse drag/swipe rotation, dynamic lighting, and specular highlights:

1. **First Prize: Honda CD 70 2027 Model Motorcycle**
   - Iconic Pakistani motorcycle featuring the high-efficiency 4-stroke engine, 2027 aerodynamic red/gold fuel tank decals, classic chrome exhaust, and spoke wheels.
   - Estimated Value: **PKR 185,000**
2. **Second Prize: iPhone 17 Pro Max**
   - Grade 5 Desert Titanium chassis, triple-lens sapphire camera system with periscope optical zoom, and 120Hz ProMotion OLED display.
   - Estimated Value: **PKR 495,000**
3. **Third Prize: Android Flagship Smartphone**
   - Pakistani Emerald Green glass body, circular quad-camera module, 120Hz AMOLED display, and 67W Turbo Fast Charging.
   - Estimated Value: **PKR 145,000**

---

## 💎 Referral Program & Bonus Formula

1. **Unique Shareable Link**: Every registered user receives a unique referral code and URL:
   ```
   https://10kakhail.pk/register?ref=10K-YOURCODE
   ```
2. **The Bonus Rule**:
   - Each successful, verified referral awards the referring user **exactly one (+1) additional draw entry** for the qualifying draw.
   - A referral is marked `VERIFIED` only after the referee completes mobile verification and confirms their first eligible PKR 10 entry.
   - **Example**:
     - Initial Standard Entries: 1
     - Verified Referrals: 5
     - Referral Bonus Entries: 5
     - **Total Eligible Entries: 6**
3. **Anti-Fraud & Exactly-Once Guarantee**:
   - Self-referrals, duplicate device fingerprints, and circular loops are detected and rejected.
   - Bonus entries are issued atomically in a database transaction with idempotency checks.
   - If a payment is refunded or reversed, the associated referral bonus entry is automatically revoked.

---

## 🏅 Referral Leaderboard & Ranking Rules

- **Winner Selection Model**: Primary proposed selection is based on **Referral Ranking** rather than random chance.
  - **Rank 1**: Wins 1st Prize (Honda CD 70 2027 Model)
  - **Rank 2**: Wins 2nd Prize (iPhone 17 Pro Max)
  - **Rank 3**: Wins 3rd Prize (Android Smartphone)
- **Tie-Breaking Rule**: If multiple participants achieve the same number of verified referrals, the tie is strictly broken by the **earliest timestamp** at which that referral total was achieved.
- **Privacy Controls**: Names and phone numbers on the public leaderboard are systematically masked (e.g. `Hamza K.` or `0301-***4567`).

---

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons, Three.js (WebGL 3D canvas), Canvas Confetti.
- **Backend**: Next.js Server API Routes, JWT session cookies, Bcryptjs password hashing.
- **Database**: SQLite / PostgreSQL with Prisma ORM.
- **Testing**: Node.js test runner (`node:test`, `node:assert`).

---

## 🚀 Quick Setup & Local Run

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

### 3. Initialize Database & Seed Demo Data
```bash
npx prisma generate
npx prisma db push
node scripts/seed.js
```

### 4. Run Automated Tests
```bash
npm test
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Accounts for Evaluation

| Role | Mobile / Identifier | Password | Access / Notes |
|---|---|---|---|
| **Chief Administrator** | `03001234567` | `AdminPassword123!` | `/admin` (Feature flags, draws, audit logs, refunds) |
| **Top Participant (#1)** | `03019876543` | `UserPassword123!` | Hamza Khan (7 verified referrals, Leaderboard Rank #1) |
| **Participant (#2)** | `03215554321` | `UserPassword123!` | Ali Raza (5 verified referrals, Leaderboard Rank #2) |
| **New Participant** | Any new number | Set at signup | Can test new referral attribution & PKR 10 checkout |

*(Note: The login page at `/login` also features one-click demo quick-fill buttons for instant testing).*
