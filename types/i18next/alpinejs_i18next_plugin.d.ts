/**
 * @module alpineI18NextPlugin
 * This module provides an i18Next plugin for Alpine.js to facilitate internationalization.
 */
import type { i18n } from "i18next";
import type { Alpine } from "alpinejs";
/**
 * Creates an i18Next plugin for Alpine.js to handle internationalization.
 *
 * @param {Object} store - Contains configuration for i18next integration.
 * @param {number} store.timestamp - A timestamp to track updates.
 * @param {function} store.i18next - A function that returns the i18next instance.
 * @returns {(Alpine: Alpine) => void} A function accepting an Alpine instance to set up i18next integration.
 */
export declare const createI18NextPlugin: (store: {
    timestamp: number;
    i18next: () => i18n;
}) => (Alpine: Alpine) => void;
