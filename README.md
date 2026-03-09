# Logic Looper

Develop an engaging daily puzzle game that combines logic challenges with streak-based motivation systems. The game must be highly interactive, visually appealing, and designed for daily engagement over 365 days with minimal server dependency.

## Core Philosophy
- **Client-First Architecture**: Maximum logic execution on client-side
- **Daily Engagement**: Hook users with progressive difficulty and streak rewards
- **Server Efficiency**: Minimize read/write operations to optimize costs
- **Polished UX**: Professional, intuitive, and delightful user experience

## 🎮 Game Concept
### Gameplay Mechanics
- **Daily Logic Puzzles**: Different puzzle types rotating daily
- **Progressive Difficulty**: Levels auto-adjust based on user performance
- **Time-based Challenges**: Optional timed modes for extra rewards
- **Hint System**: Limited hints per day (client-side managed)
- **Solution Validation**: All puzzle solutions verified client-side

### Puzzle Types
- Number Matrix (Sudoku-like variations)
- Pattern Matching (Visual/Logical patterns)
- Sequence Solvers (Mathematical/Logical sequences)
- Deduction Grids (Einstein puzzle style)
- Binary Logic (Gate-based puzzles)

## 🏗️ Technical Architecture
### Frontend (Client-Side Heavy)
- React 18+ (Functional Components with Hooks)
- Redux Toolkit (Client State Management)
- Tailwind CSS + Styled Components
- Framer Motion (Animations)
- Day.js (Date handling)
- Crypto-js (Client-side puzzle generation/validation)
- IndexedDB (Client-side storage for offline play)

### Backend (Minimalist)
- Node.js + Express
- PostgreSQL (Neon.tech - Serverless Postgres)
- ORM: Prisma
- Authentication: NextAuth.js compatible setup
- Deployment: Vercel (Serverless Functions)

## 🛠️ Setup & Environment

To run this project locally, create `.env` files in the `backend` and `frontend` directories with the following configuration:

### Backend (`backend/.env`)
```env
PORT=3000
DATABASE_URL="YOUR_DATABASE_URL"
GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID"
GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET"
JWT_SECRET="YOUR_JWT_SECRET"
FRONTEND_URL="http://localhost:5173"
```

### Frontend (`frontend/.env`)
```env
VITE_GOOGLE_CLIENT_ID="YOUR_VITE_GOOGLE_CLIENT_ID"
VITE_API_URL="http://localhost:3000"
VITE_TRUECALLER_PARTNER_KEY="YOUR_TRUECALLER_PARTNER_KEY"
VITE_TRUECALLER_APP_NAME="Logic Looper"
VITE_TRUECALLER_PRIVACY_URL="https://yourdomain.com/privacy"
VITE_TRUECALLER_TERMS_URL="https://yourdomain.com/terms"
```

> **Truecaller Setup Notes:**
> - Register your web app at [Truecaller Verification Console](https://verification-sdk-console.truecaller.com/) to get `VITE_TRUECALLER_PARTNER_KEY`.
> - Set the **Callback URL** in the console to: `https://yourdomain.com/api/auth/truecaller/callback`
> - Truecaller 1-tap only works on **Android mobile browsers** where the Truecaller app is installed. Desktop and iOS users are shown a descriptive fallback message.
> - For local development the callback URL must be publicly reachable (e.g. use [ngrok](https://ngrok.com/) to tunnel `localhost:3000`).

## 🚀 Getting Started
1. **Clone the repository**
2. **Install dependencies**: `npm install` in both `backend` and `frontend`
3. **Database Migration**: `npx prisma migrate dev` in the `backend` folder
4. **Run Development Servers**: `npm run dev` in both folders
