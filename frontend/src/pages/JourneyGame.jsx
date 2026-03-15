import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { JOURNEY_LEVELS } from '../config/journeyLevels';
import PuzzleContainer from '../components/puzzle/PuzzleContainer';
import SeededRandom from '../utils/crypto';

// Generators
import { generateNumberMatrix } from '../games/NumberMatrix/generator';
import { generatePatternMatch } from '../games/PatternMatch/generator';
import { generateSequenceSolver } from '../games/SequenceSolver/generator';
import { generateDeductionGrid } from '../games/DeductionGrid/generator';
import { generateBinaryLogic } from '../games/BinaryLogic/generator';

const JourneyGame = () => {
    const { level } = useParams();
    const navigate = useNavigate();
    const journeyLevel = useSelector((state) => state.game.journeyLevel || 1);
    const [levelData, setLevelData] = useState(null);

    useEffect(() => {
        const lvlNum = parseInt(level);
        if (isNaN(lvlNum) || lvlNum > journeyLevel) {
            navigate('/journey');
            return;
        }

        const config = JOURNEY_LEVELS.find(l => l.level === lvlNum);
        if (!config) {
            navigate('/journey');
            return;
        }

        // Generate puzzle based on level config
        const rnd = new SeededRandom(`journey-${lvlNum}`);
        const options = { difficulty: config.difficulty };
        
        let puzzleData;
        switch (config.type) {
            case 'NUMBER_MATRIX': puzzleData = generateNumberMatrix(rnd, options); break;
            case 'PATTERN_MATCH': puzzleData = generatePatternMatch(rnd, options); break;
            case 'SEQUENCE_SOLVER': puzzleData = generateSequenceSolver(rnd, options); break;
            case 'DEDUCTION_GRID': puzzleData = generateDeductionGrid(rnd, options); break;
            case 'BINARY_LOGIC': puzzleData = generateBinaryLogic(rnd, options); break;
            default: puzzleData = generateNumberMatrix(rnd, options);
        }

        setLevelData({
            level: lvlNum,
            puzzleType: config.type,
            difficultyLevel: config.difficulty,
            state: puzzleData,
            title: config.title
        });
    }, [level, journeyLevel, navigate]);

    if (!levelData) return <div className="min-h-screen pt-32 text-center text-white/20 uppercase font-black tracking-widest">Loading_Level_Data...</div>;

    return (
        <div className="min-h-screen bg-[#0a0a0c]">
             {/* Level Header Overlay */}
             <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center pointer-events-none">
                 <div className="px-6 py-2 bg-cyan/10 backdrop-blur-md border border-cyan/30 rounded-full">
                     <span className="text-[10px] font-black text-cyan uppercase tracking-[0.3em]">
                         Neural_Node_{levelData.level.toString().padStart(2, '0')} // {levelData.title}
                     </span>
                 </div>
             </div>

             <PuzzleContainer 
                todayProgress={levelData} 
                practiceMode={false} 
                isJourney={true}
                triggerSync={() => navigate('/journey')}
             />
        </div>
    );
};

export default JourneyGame;
