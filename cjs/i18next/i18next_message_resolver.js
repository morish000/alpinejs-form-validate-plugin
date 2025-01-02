"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createI18NextMessageResolver = void 0;
/**
 * Creates a message resolver using i18next to handle internationalization.
 *
 * @param {Object} store - An object containing the configuration for i18next.
 * @param {number} store.timestamp - A timestamp to track updates.
 * @param {function} store.i18next - A function that returns the i18next instance.
 * @returns {(Alpine: Alpine) => MessageResolver} A function that takes an Alpine instance and returns a MessageResolver.
 */
const createI18NextMessageResolver = (store) => (Alpine) => {
    const i18next = store.i18next();
    let listeners = [];
    /**
     * Watches for changes in the store's timestamp and triggers update listeners.
     */
    Alpine.watch(() => store.timestamp, () => listeners.forEach((listener) => listener()));
    return {
        /**
         * Adds a listener to the list of update listeners.
         *
         * @param {() => void} listener - The listener function to add.
         */
        addUpdateListener: (listener) => {
            if (!listeners.includes(listener)) {
                listeners.push(listener);
            }
        },
        /**
         * Removes a listener from the list of update listeners.
         *
         * @param {() => void} listenerToRemove - The listener function to remove.
         */
        removeUpdateListener: (listenerToRemove) => {
            listeners = listeners.filter((listener) => listener !== listenerToRemove);
        },
        /**
         * Resolves a message key using i18next, falling back to the key if not found.
         *
         * @param {...FunctionParameter[]} args - The key and options for resolution.
         * @returns {string} - The resolved message.
         */
        resolve: (...args) => {
            const [key, options] = args;
            return i18next.exists(key)
                ? i18next.t(key, options)
                : key;
        },
    };
};
exports.createI18NextMessageResolver = createI18NextMessageResolver;
