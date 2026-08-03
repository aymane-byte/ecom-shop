/**
 * Meta Pixel Helper
 * Helper function pour déclencher les événements Meta Pixel dans une SPA/Inertia.js
 */

/**
 * Déclenche un événement Meta Pixel
 * @param {string} eventName - Nom de l'événement (ex: 'ViewContent', 'AddToCart', 'Purchase')
 * @param {Object} data - Données de l'événement selon la documentation Meta Pixel
 */
export const trackPixelEvent = (eventName, data = {}) => {
    if (typeof window !== 'undefined' && window.fbq) {
        try {
            window.fbq('track', eventName, data);
            console.log(`[Meta Pixel] Event tracked: ${eventName}`, data);
        } catch (error) {
            console.error(`[Meta Pixel] Error tracking event ${eventName}:`, error);
        }
    } else {
        console.warn('[Meta Pixel] fbq not available. Event not tracked:', eventName, data);
    }
};

/**
 * Déclenche un événement personnalisé Meta Pixel
 * @param {string} eventName - Nom de l'événement personnalisé
 * @param {Object} data - Données de l'événement
 */
export const trackCustomPixelEvent = (eventName, data = {}) => {
    if (typeof window !== 'undefined' && window.fbq) {
        try {
            window.fbq('trackCustom', eventName, data);
            console.log(`[Meta Pixel] Custom event tracked: ${eventName}`, data);
        } catch (error) {
            console.error(`[Meta Pixel] Error tracking custom event ${eventName}:`, error);
        }
    } else {
        console.warn('[Meta Pixel] fbq not available. Custom event not tracked:', eventName, data);
    }
};

/**
 * Initialise le Meta Pixel (optionnel si déjà fait dans app.blade.php)
 */
export const initPixel = (pixelId) => {
    if (typeof window !== 'undefined' && !window.fbq) {
        window.fbq = window.fbq || function() {
            (window.fbq.q = window.fbq.q || []).push(arguments);
        };
        window.fbq('init', pixelId);
        window.fbq('track', 'PageView');
        console.log('[Meta Pixel] Initialized with ID:', pixelId);
    }
};
