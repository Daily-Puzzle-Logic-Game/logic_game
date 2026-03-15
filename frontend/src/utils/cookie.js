/**
 * Simple cookie helper for persistent Guest identification.
 */
export const setCookie = (name, value, days = 365) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

export const getCookie = (name) => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
};

export const getOrSetGuestId = () => {
    let guestId = getCookie('logic_guest_id');
    if (!guestId) {
        guestId = 'GUEST_' + Math.random().toString(36).substr(2, 9).toUpperCase();
        setCookie('logic_guest_id', guestId);
    }
    return guestId;
};
