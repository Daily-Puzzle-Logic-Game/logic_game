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
```

### Frontend (`frontend/.env`)
```env
VITE_GOOGLE_CLIENT_ID="YOUR_VITE_GOOGLE_CLIENT_ID"
VITE_API_URL="http://localhost:3000/api"
```

## 🚀 Getting Started
1. **Clone the repository**
2. **Install dependencies**: `npm install` in both `backend` and `frontend`
3. **Database Migration**: `npx prisma migrate dev` in the `backend` folder
4. **Run Development Servers**: `npm run dev` in both folders
