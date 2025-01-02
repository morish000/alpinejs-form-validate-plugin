/**
 * @module i18nMessageResolver
 * This module provides a function to create a message resolver using i18next for internationalization support.
 */
import type { Alpine } from "alpinejs";
import type { i18n } from "i18next";
import type { MessageResolver } from "../types/functions_types.ts";
/**
 * Creates a message resolver using i18next to handle internationalization.
 *
 * @param {Object} store - An object containing the configuration for i18next.
 * @param {number} store.timestamp - A timestamp to track updates.
 * @param {function} store.i18next - A function that returns the i18next instance.
 * @returns {(Alpine: Alpine) => MessageResolver} A function that takes an Alpine instance and returns a MessageResolver.
 */
export declare const createI18NextMessageResolver: (store: {
    timestamp: number;
    i18next: () => i18n;
}) => (Alpine: Alpine) => MessageResolver;
