import { Howl, Howler } from 'howler';

const sounds = {
    // UI & Interface (Modern Game SFX)
    bubble_pop: new Howl({ src: ['/assets/sounds/tap.mp3'], volume: 0.5, preload: true }),
    crystal_ding: new Howl({ src: ['/assets/sounds/correct.mp3'], volume: 0.6, preload: true }),
    interface_hover: new Howl({ src: ['/assets/sounds/hover.mp3'], volume: 0.2, preload: true }),
    
    // Gameplay (Tactile & Precise)
    slide_clack: new Howl({ src: ['/assets/sounds/unlock.mp3'], volume: 0.5, preload: true }),
    oops_thud: new Howl({ src: ['/assets/sounds/wrong.mp3'], volume: 0.4, preload: true }),
    tile_place: new Howl({ src: ['/assets/sounds/click.mp3'], volume: 0.5, preload: true }),
    
    // Milestones (Triumphant)
    sparkle_shine: new Howl({ src: ['/assets/sounds/complete.mp3'], volume: 0.6, preload: true }),
    royal_fanfare: new Howl({ src: ['/assets/sounds/complete.mp3'], volume: 0.8, preload: true, rate: 1.2 }),
    
    // Legacy mapping (Maintains app stability)
    click: new Howl({ src: ['/assets/sounds/click.mp3'], volume: 0.4, preload: true }),
    correct: new Howl({ src: ['/assets/sounds/correct.mp3'], volume: 0.6, preload: true }),
    wrong: new Howl({ src: ['/assets/sounds/wrong.mp3'], volume: 0.4, preload: true }),
    complete: new Howl({ src: ['/assets/sounds/complete.mp3'], volume: 0.6, preload: true }),
    unlock: new Howl({ src: ['/assets/sounds/unlock.mp3'], volume: 0.5, preload: true }),
    hover: new Howl({ src: ['/assets/sounds/hover.mp3'], volume: 0.15, preload: true }),
    tap: new Howl({ src: ['/assets/sounds/tap.mp3'], volume: 0.4, preload: true }),
    placement: new Howl({ src: ['/assets/sounds/click.mp3'], volume: 0.5, preload: true }),
    promotion: new Howl({ src: ['/assets/sounds/complete.mp3'], volume: 0.7, preload: true, rate: 1.1 })
};

// Standard Audio Unlock for Browsers
const unlockAudio = () => {
    const resume = () => {
        if (Howler.ctx && Howler.ctx.state === 'suspended') {
            Howler.ctx.resume().then(() => {
                console.log("AudioContext Resumed");
            }).catch(() => {});
        }
    };
    
    if (typeof window !== 'undefined') {
        const events = ['click', 'touchstart', 'mousedown'];
        const handler = () => {
            resume();
            // Don't remove immediately, maybe wait for a few interactions to be sure
            // but for standard policy once is enough.
            events.forEach(e => window.removeEventListener(e, handler));
        };
        events.forEach(e => window.addEventListener(e, handler, { once: true, passive: true }));
    }
};

if (typeof window !== 'undefined') {
    unlockAudio();
}

export const playSound = (type) => {
    if (localStorage.getItem('soundEnabled') === 'false') return;
    
    if (sounds[type]) {
        try {
            // Hot-path: Direct play for zero latency
            if (sounds[type].state() === 'unloaded') {
                sounds[type].load();
            }
            
            // Try to resume context if it's suspended (async but won't block current play attempt)
            if (Howler.ctx && Howler.ctx.state === 'suspended') {
                Howler.ctx.resume().then(() => {
                   sounds[type].play();
                }).catch(() => {
                   sounds[type].play(); // Try anyway
                });
                return; 
            }

            sounds[type].play();
        } catch (e) {
            // Silently ignore
        }
    }
};

export const toggleSound = (enabled) => {
    localStorage.setItem('soundEnabled', enabled);
};

const SoundManager = {
    playSound,
    toggleSound
};

export default SoundManager;
