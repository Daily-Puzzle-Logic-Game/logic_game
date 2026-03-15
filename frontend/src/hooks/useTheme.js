import { useEffect } from 'react';

export const useTheme = () => {
    const isDark = true;

    useEffect(() => {
        const root = window.document.documentElement;
        // Always ensure dark mode is active
        root.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    }, []);

    const toggleTheme = () => {
        // No-op to prevent errors if called elsewhere
    };

    return { isDark, toggleTheme };
};
