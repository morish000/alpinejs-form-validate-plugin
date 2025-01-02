"use strict";
/**
 * @module alpineI18NextPlugin
 * This module provides an i18Next plugin for Alpine.js to facilitate internationalization.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createI18NextPlugin = void 0;
/**
 * Creates an i18Next plugin for Alpine.js to handle internationalization.
 *
 * @param {Object} store - Contains configuration for i18next integration.
 * @param {number} store.timestamp - A timestamp to track updates.
 * @param {function} store.i18next - A function that returns the i18next instance.
 * @returns {(Alpine: Alpine) => void} A function accepting an Alpine instance to set up i18next integration.
 */
const createI18NextPlugin = (store) => (Alpine) => {
    const i18next = store.i18next();
    /**
     * Updates the timestamp to track changes.
     * @private
     */
    const update = () => store.timestamp = Date.now();
    ["languageChanged", "loaded"].forEach((event) => i18next.on(event, update));
    ["added", "removed"].forEach((event) => i18next.store.on(event, update));
    /**
     * Adds the `$t` magic property to translate keys using i18next.
     */
    Alpine.magic("t", () => (key, options) => {
        store.timestamp;
        return i18next.t(key, options);
    });
    /**
     * Adds the `$i18next` magic property to access the full i18next instance.
     */
    Alpine.magic("i18next", () => () => {
        return i18next;
    });
    /**
     * Defines a custom directive `x-i18next-text` to update text content based on i18next translations.
     */
    Alpine.directive("i18next-text", (el, { expression }, { evaluateLater, effect }) => {
        const args = evaluateLater(expression);
        /**
         * Reactively updates the element's text content based on the evaluated expression.
         */
        effect(() => {
            store.timestamp;
            args(([key, options]) => {
                Alpine.mutateDom(() => {
                    el.textContent = i18next.t(key, options);
                });
            });
        });
    });
};
exports.createI18NextPlugin = createI18NextPlugin;
