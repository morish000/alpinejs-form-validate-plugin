/**
 * @module i18nMessageResolver
 * This module provides a function to create a message resolver using i18next for internationalization support.
 */

import type { Alpine } from "alpinejs";
import type { AlpineWithWatch } from "../types/alpine_types.ts";
import type { FunctionParameter } from "../types/config_types.ts";
import type { MessageResolver } from "../types/functions_types.ts";
import type { i18n, TOptions } from "i18next";

/**
 * Creates a message resolver using i18next to handle internationalization.
 *
 * @param {Object} store - An object containing the configuration for i18next.
 * @param {number} store.timestamp - A timestamp to track updates.
 * @param {function} store.i18next - A function that returns the i18next instance.
 * @returns {(Alpine: Alpine) => MessageResolver} A function that takes an Alpine instance and returns a MessageResolver.
 */
export const createI18NextMessageResolver =
  (store: { timestamp: number; i18next: () => i18n }) =>
  (Alpine: Alpine): MessageResolver => {
    const i18next = store.i18next();
    let listeners: (() => void)[] = [];
    /**
     * Watches for changes in the store's timestamp and triggers update listeners.
     */
    (Alpine as AlpineWithWatch).watch(
      () => store.timestamp,
      () => listeners.forEach((listener) => listener()),
    );
    return {
      /**
       * Adds a listener to the list of update listeners.
       *
       * @param {() => void} listener - The listener function to add.
       */
      addUpdateListener: (listener: () => void) => {
        if (!listeners.includes(listener)) {
          listeners.push(listener);
        }
      },
      /**
       * Removes a listener from the list of update listeners.
       *
       * @param {() => void} listenerToRemove - The listener function to remove.
       */
      removeUpdateListener: (listenerToRemove: () => void) => {
        listeners = listeners.filter((listener) =>
          listener !== listenerToRemove
        );
      },
      /**
       * Resolves a message key using i18next, falling back to the key if not found.
       *
       * @param {...FunctionParameter[]} args - The key and options for resolution.
       * @returns {string} - The resolved message.
       */
      resolve: (...args: FunctionParameter[]) => {
        const [key, options] = args;
        return i18next.exists(key as (string | string[]))
          ? i18next.t(key as (string | string[]), options as TOptions)
          : key as string;
      },
    };
  };
