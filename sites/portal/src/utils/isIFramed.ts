export const isIFramed = window.self !== window.top;

export const isPopup = window.opener && window.parent === window;

export const parentWindow: Window | null = typeof window !== 'undefined' ? window.opener || window.parent || null : null;
