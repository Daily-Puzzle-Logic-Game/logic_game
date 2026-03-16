# 🧠 Logic Looper: The Daily Brain Engine

**Logic Looper** is a high-fidelity, daily puzzle platform designed to sharpen cognitive intuition through structured logic training. Built with a "wow-factor" aesthetic, it combines addictive gameplay mechanics with a robust streak-based motivation system.

---

## 🚀 Live Production Links

- **Frontend**: [https://logic-looper-eta.vercel.app](https://logic-looper-eta.vercel.app)
- **Backend**: [https://logicgame-nine.vercel.app](https://logicgame-nine.vercel.app)

---

## 🎮 Core Features

- **Daily Logic Rotation**: A new specialized logic puzzle every 24 hours.
- **Global Leaderboards**: Real-time rank tracking and competitive scoring.
- **Neural Journey**: A multi-level progression map with increasing complexity.
- **Streak Propulsion**: Consecutive solve rewards and "Streak Shields" to protect your progress.
- **Challenges**: Specialized modes like "Hintless Hero" and "Puzzle Master" to earn unique badges.
- **Premium UX**: Glassmorphic UI, fluid Framer Motion animations, and dynamic "Neural" backgrounds.

## 🕹️ Puzzle Modules

- **Number Matrix**: Sudoku-inspired deduction engines.
- **Pattern Matching**: Neural pattern recognition challenges.
- **Binary Logic**: Gate-based optimization puzzles.
- **Deduction Grids**: Einstein-style logical deduction.
- **Sequence Solvers**: Mathematical and logical sequence identification.

---

## 🏗️ Technical Stack

### Frontend
- **Framework**: React 18 (Vite)
- **State Management**: Redux Toolkit (RTK)
- **Styling**: Tailwind CSS + Custom Design Tokens
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Auth**: Google OAuth 2.0 Integrations

### Backend
- **Engine**: Node.js + Express
- **Database**: PostgreSQL (via Neon Serverless)
- **ORM**: Prisma
- **Deployment**: Vercel Serverless Functions
- **Security**: JWT Authentication + CORS strict policy

---

## 🛠️ Local Development

### 1. Requirements
- Node.js (v18+)
- PostgreSQL Database (Local or Cloud)

### 2. Environment Setup

Create `.env` files in both directories:

**Backend (`/backend/.env`)**
```env
PORT=3000
DATABASE_URL="postgresql://..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
JWT_SECRET="..."
```

**Frontend (`/frontend/.env`)**
```env
VITE_GOOGLE_CLIENT_ID="..."
VITE_API_URL="http://localhost:3000"
```

### 3. Installation
```bash
# In the root, install both
cd backend && npm install
cd ../frontend && npm install
```

### 4. Running
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

---

## ✨ Recent Refactors & Improvements

This project recently underwent a major **Production Readiness** sweep:
- **API Centralization**: Removed all hardcoded `localhost` URLs. All requests now route through a centralized dynamic config.
- **UX Scroll Reset**: Implemented a global `ScrollToTop` listener to ensure seamless navigation between routes.
- **Backend CORS Policy**: Updated to securely allow the production frontend while maintaining local development flexibility.
- **Redux Stability**: Fixed payload processing errors in the notification system.
- **Mobile Optimization**: Refined the landing page and navigation for responsive devices.

---

## 📜 License & Credit
**Lead Developer & Project Architect**: Gyanaranjan Sahoo
Developed for Bluestock™. All rights reserved.
