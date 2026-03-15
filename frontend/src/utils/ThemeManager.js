export const THEMES = {
    LOGIC_LAB: 'LOGIC_LAB',
    NATURE: 'NATURE',
    SPACE: 'SPACE'
};

export const THEME_CONFIG = {
    [THEMES.LOGIC_LAB]: {
        name: 'Logic Lab',
        primary: '#22d3ee', // Cyan
        background: '#0a0a0c',
        tileBg: 'rgba(255, 255, 255, 0.05)',
        tileBorder: 'rgba(34, 211, 238, 0.3)',
        accent: '#3b82f6'
    },
    [THEMES.NATURE]: {
        name: 'Echo Forest',
        primary: '#10b981', // Emerald
        background: '#061a12',
        tileBg: 'rgba(88, 54, 30, 0.2)', // Woody brown
        tileBorder: 'rgba(16, 185, 129, 0.3)',
        accent: '#059669'
    },
    [THEMES.SPACE]: {
        name: 'Star Bound',
        primary: '#a855f7', // Purple
        background: '#030014',
        tileBg: 'rgba(255, 255, 255, 0.05)',
        tileBorder: 'rgba(168, 85, 247, 0.3)',
        accent: '#ec4899'
    }
};

export const getCurrentTheme = () => {
    return localStorage.getItem('puzzle_theme') || THEMES.LOGIC_LAB;
};

export const setTheme = (theme) => {
    localStorage.setItem('puzzle_theme', theme);
    document.documentElement.setAttribute('data-puzzle-theme', theme);
};
