import React from 'react';

const RibbonBadge = ({ 
    type = '1st', 
    shape = 'rosette', // 'rosette', 'shield', 'hexagon', 'star'
    icon: Icon = null, 
    size = 80, 
    className = '' 
}) => {
    const cx = 50;
    const cy = 45;

    // --- Shape Generators ---
    
    // 1. Rosette Pleats (original)
    const getRosettePath = () => {
        const points = 30;
        const rOuter = 40;
        const rInner = 35;
        let path = [];
        for (let i = 0; i < points * 2; i++) {
            const radius = i % 2 === 0 ? rOuter : rInner;
            const angle = (Math.PI * i) / points;
            path.push(`${i === 0 ? 'M' : 'L'} ${cx + radius * Math.sin(angle)} ${cy - radius * Math.cos(angle)}`);
        }
        path.push('Z');
        return path.join(' ');
    };

    // 2. Shield Path
    const getShieldPath = () => {
        return "M 15 15 L 85 15 L 85 45 C 85 75 50 90 50 90 C 50 90 15 75 15 45 Z";
    };

    // 3. Hexagon Path
    const getHexagonPath = () => {
        const r = 38;
        let path = [];
        for(let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - (Math.PI / 6); // offset by 30deg to point up
            path.push(`${i === 0 ? 'M' : 'L'} ${cx + r * Math.cos(angle)} ${cy + r * Math.sin(angle)}`);
        }
        path.push('Z');
        return path.join(' ');
    };

    // 4. Star Path
    const getStarPath = () => {
        const points = 5;
        const rOuter = 40;
        const rInner = 20;
        let path = [];
        for (let i = 0; i < points * 2; i++) {
            const radius = i % 2 === 0 ? rOuter : rInner;
            const angle = (Math.PI * i) / points - (Math.PI / 2);
            path.push(`${i === 0 ? 'M' : 'L'} ${cx + radius * Math.cos(angle)} ${cy + radius * Math.sin(angle)}`);
        }
        path.push('Z');
        return path.join(' ');
    };

    // --- Color Themes ---
    const schemes = {
        '1st': {
            mainTop: '#fa2535', mainBottom: '#ba0d1a',
            centerTop: '#f01124', centerBottom: '#a6000e',
            rimTop: '#ffe100', rimBottom: '#c29700',
            tailLeftTop: '#e60b1d', tailLeftBottom: '#99000b',
            tailRightTop: '#d10a1b', tailRightBottom: '#800008',
            text: '1st', textColor: '#ffffff'
        },
        '2nd': {
            mainTop: '#2b78ff', mainBottom: '#0d4dc2',
            centerTop: '#1a6bde', centerBottom: '#0a3a99',
            rimTop: '#e0e0e0', rimBottom: '#a3a3a3',
            tailLeftTop: '#175cc4', tailLeftBottom: '#08337a',
            tailRightTop: '#134fa8', tailRightBottom: '#052357',
            text: '2nd', textColor: '#ffffff'
        },
        '3rd': {
            mainTop: '#24c9ff', mainBottom: '#008ba3',
            centerTop: '#12b8eb', centerBottom: '#007185',
            rimTop: '#ffde24', rimBottom: '#ccac00',
            tailLeftTop: '#0ba6db', tailLeftBottom: '#006578',
            tailRightTop: '#0896c9', tailRightBottom: '#005869',
            text: '3rd', textColor: '#ffffff'
        },
        'gold': {
            mainTop: '#ffd426', mainBottom: '#c29c06',
            centerTop: '#ffbb00', centerBottom: '#b38000',
            rimTop: '#fff4b3', rimBottom: '#b38b00',
            tailLeftTop: '#ebb510', tailLeftBottom: '#997500',
            tailRightTop: '#d6a30b', tailRightBottom: '#806000',
            text: 'Gold', textColor: '#ffffff'
        },
        'silver': {
            mainTop: '#e0e0e0', mainBottom: '#a3a3a3',
            centerTop: '#cccccc', centerBottom: '#8c8c8c',
            rimTop: '#ffffff', rimBottom: '#808080',
            tailLeftTop: '#b3b3b3', tailLeftBottom: '#737373',
            tailRightTop: '#9e9e9e', tailRightBottom: '#5c5c5c',
            text: 'Silver', textColor: '#ffffff'
        },
        'bronze': {
            mainTop: '#db8d48', mainBottom: '#9c5921',
            centerTop: '#c4732b', centerBottom: '#854b15',
            rimTop: '#f5bd8e', rimBottom: '#8a4b12',
            tailLeftTop: '#ab601f', tailLeftBottom: '#6e3c11',
            tailRightTop: '#965218', tailRightBottom: '#592e0a',
            text: 'Bronze', textColor: '#ffffff'
        },
        'diamond': {
            mainTop: '#e0f7fa', mainBottom: '#80deea',
            centerTop: '#b2ebf2', centerBottom: '#4dd0e1',
            rimTop: '#ffffff', rimBottom: '#b2ebf2',
            tailLeftTop: '#80deea', tailLeftBottom: '#00acc1',
            tailRightTop: '#4dd0e1', tailRightBottom: '#0097a7',
            text: 'Elite', textColor: '#006064'
        },
        'purple': {
            mainTop: '#b388ff', mainBottom: '#651fff',
            centerTop: '#7c4dff', centerBottom: '#6200ea',
            rimTop: '#eafeff', rimBottom: '#80d8ff',
            tailLeftTop: '#651fff', tailLeftBottom: '#4a148c',
            tailRightTop: '#6200ea', tailRightBottom: '#311b92',
            text: 'Pro', textColor: '#ffffff'
        },
        'emerald': {
            mainTop: '#69f0ae', mainBottom: '#00e676',
            centerTop: '#00e676', centerBottom: '#00c853',
            rimTop: '#b9f6ca', rimBottom: '#00e676',
            tailLeftTop: '#00e676', tailLeftBottom: '#00c853',
            tailRightTop: '#00c853', tailRightBottom: '#00b248',
            text: 'Pro', textColor: '#003300'
        }
    };

    const typeKey = type.toString().toLowerCase();
    const s = schemes[typeKey] || schemes['1st'];
    
    // Fallback logic for text vs icons
    const hasIcon = Icon !== null;
    const dropShadowId = `shadow-${typeKey}-${shape}-${Math.random().toString(36).substring(2, 9)}`;

    let basePath = '';
    switch(shape) {
        case 'shield': basePath = getShieldPath(); break;
        case 'hexagon': basePath = getHexagonPath(); break;
        case 'star': basePath = getStarPath(); break;
        case 'rosette':
        default: basePath = getRosettePath(); break;
    }

    return (
        <div 
            className={`relative inline-flex items-center justify-center drop-shadow-md transition-transform duration-300 hover:scale-[1.15] hover:rotate-2 hover:drop-shadow-xl ${className}`}
            style={{ width: size, height: size * 1.1 }}
        >
            <svg 
                viewBox="0 0 100 110" 
                width="100%" 
                height="100%" 
                style={{ overflow: 'visible', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))' }}
            >
                <defs>
                    <linearGradient id={`${typeKey}-main-grad`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={s.mainTop} />
                        <stop offset="100%" stopColor={s.mainBottom} />
                    </linearGradient>
                    <linearGradient id={`${typeKey}-center-grad`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={s.centerTop} />
                        <stop offset="100%" stopColor={s.centerBottom} />
                    </linearGradient>
                    <linearGradient id={`${typeKey}-rim-grad`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={s.rimTop} />
                        <stop offset="50%" stopColor={s.rimBottom} />
                        <stop offset="100%" stopColor={s.rimTop} />
                    </linearGradient>
                    <linearGradient id={`${typeKey}-tail-l-grad`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={s.tailLeftTop} />
                        <stop offset="100%" stopColor={s.tailLeftBottom} />
                    </linearGradient>
                    <linearGradient id={`${typeKey}-tail-r-grad`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={s.tailRightTop} />
                        <stop offset="100%" stopColor={s.tailRightBottom} />
                    </linearGradient>
                </defs>

                {/* Left & Right Hanging Tails (Only for Rosette/Star to avoid cluttering shields) */}
                {(shape === 'rosette' || shape === 'star') && (
                    <>
                        <path d="M 20 45 L 10 105 L 26 92 L 38 100 L 40 45 Z" fill={`url(#${typeKey}-tail-l-grad)`} />
                        <path d="M 80 45 L 90 105 L 74 92 L 62 100 L 60 45 Z" fill={`url(#${typeKey}-tail-r-grad)`} />
                    </>
                )}

                {/* Main Body */}
                <path d={basePath} fill={`url(#${typeKey}-main-grad)`} />
                
                {/* Outer Metallic Rim */}
                <circle cx="50" cy="45" r={shape === 'star' ? 22 : 28} fill={`url(#${typeKey}-rim-grad)`} />
                
                {/* Inner Metallic Border */}
                <circle cx="50" cy="45" r={shape === 'star' ? 19 : 24} fill={s.rimBottom} />
                
                {/* Smooth Center Circle */}
                <circle cx="50" cy="45" r={shape === 'star' ? 17 : 22} fill={`url(#${typeKey}-center-grad)`} />
                
                {/* 3D Glossy Highlight on top half of center circle */}
                <path d={`M ${50 - (shape === 'star' ? 17 : 22)} 45 A ${shape === 'star' ? 17 : 22} ${shape === 'star' ? 17 : 22} 0 0 1 ${50 + (shape === 'star' ? 17 : 22)} 45 A 24 20 0 0 0 ${50 - (shape === 'star' ? 17 : 22)} 45 Z`} fill="white" opacity="0.2" />
                <ellipse cx="40" cy="32" rx="8" ry="4" fill="white" opacity="0.15" transform="rotate(-30 40 32)" />

                {/* Draw Text if no icon is provided */}
                {!hasIcon && (
                    <text 
                        x="50" 
                        y={s.text.length > 3 ? "49" : "51"} 
                        textAnchor="middle" 
                        fill={s.textColor} 
                        fontSize={s.text.length > 3 ? "11" : "16"} 
                        fontWeight="900" 
                        fontFamily="Georgia, serif"
                        letterSpacing={s.text.length > 3 ? "0.05em" : "0"}
                        style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
                    >
                        {s.text}
                    </text>
                )}
            </svg>

            {/* Float actual React Icon component perfectly in the sweet spot center */}
            {hasIcon && (
                <div 
                    className="absolute" 
                    style={{ 
                        top: '41%', // roughly cy=45 out of viewBox 110
                        left: '50%', 
                        transform: 'translate(-50%, -50%)',
                        color: s.textColor,
                        filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.5))'
                    }}
                >
                    <Icon size={size * 0.35} strokeWidth={2.5} />
                </div>
            )}
        </div>
    );
};

export default RibbonBadge;
