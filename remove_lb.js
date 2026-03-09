const fs = require('fs');
let code = fs.readFileSync('c:/Users/A/logic_game/frontend/src/App.jsx', 'utf8');

code = code.replace(/const Leaderboard = \(\) => \(\s*<div.*?<\/div>\s*\);\s*/, '');

fs.writeFileSync('c:/Users/A/logic_game/frontend/src/App.jsx', code);
