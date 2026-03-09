const fs = require('fs');
let code = fs.readFileSync('c:/Users/A/logic_game/frontend/src/App.jsx', 'utf8');

// remove inline Leaderboard
code = code.replace(/const Leaderboard = \(\) => \([\s\S]*?\);\n/, '');

// check if Leaderboard is imported
if (!code.includes('import Leaderboard from')) {
    code = code.replace("import './App.css';", "import Leaderboard from './pages/Leaderboard';\nimport HintlessHeroChallenge from './pages/HintlessHeroChallenge';\nimport PuzzleMasterChallenge from './pages/PuzzleMasterChallenge';\nimport StreakKeeperChallenge from './pages/StreakKeeperChallenge';\nimport './App.css';");
}

// Add these to routes
if (!code.includes('<Route path="/challenge/hintless-hero"')) {
    code = code.replace(
        '<Route path="/leaderboard" element={<Leaderboard />} />',
        '<Route path="/leaderboard" element={<Leaderboard />} />\n              <Route path="/challenge/hintless-hero" element={<HintlessHeroChallenge />} />\n              <Route path="/challenge/puzzle-master" element={<PuzzleMasterChallenge />} />\n              <Route path="/challenge/streak-keeper" element={<StreakKeeperChallenge />} />'
    );
}

fs.writeFileSync('c:/Users/A/logic_game/frontend/src/App.jsx', code);
console.log('App.jsx updated!');
