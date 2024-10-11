/**
 * @module messageStore
 * This module provides a factory to create a message store for managing message values associated with DOM elements in Alpine.js applications.
 */

import type { Alpine } from "alpinejs";
import type {
  CreateMessageStore,
  MessageStore,
} from "../types/functions_types.ts";

/**
 * Creates a message store for managing message values associated with DOM elements.
 *
 * @param {Alpine} Alpine - Alpine.js instance used to create reactive stores.
 * @returns {MessageStore} - An object providing methods to manipulate message values.
 */
export const createMessageStore: CreateMessageStore = (Alpine: Alpine) =>
(
  { messageResolver },
  store = Alpine.reactive({}),
): MessageStore => {
  // Adds a listener to update message values when resolved message changes.
  messageResolver.addUpdateListener(
    () => {
      Object.values(store).forEach((value) => {
        if (value.value || value.param.length > 0) {
          value.value = messageResolver.resolve(...value.param);
          value.handleMessage(value.value);
        }
      });
    },
  );
  return {
    /**
     * Initializes a message entry for a given element.
     *
     * @param {Element} el - The DOM element associated with the message.
     * @param {function(string): void} handleMessage - Callback to handle message changes.
     */
    create: (el, handleMessage) => {
      store[el.id] = {
        handleMessage,
        param: [],
        value: "",
      };
      handleMessage("");
    },
    /**
     * Deletes a message entry for a given element.
     *
     * @param {Element} el - The DOM element whose message entry will be deleted.
     */
    delete: (el) => {
      store[el.id].handleMessage("");
      delete store[el.id];
    },
    /**
     * Sets message parameters and resolves the message value for a given element.
     *
     * @param {Element} el - The DOM element associated with the message.
     * @param {Array} [message=[]] - Parameters used to resolve the message.
     */
    set: (el, message = []) => {
      const value = messageResolver.resolve(...message);
      store[el.id].param = message;
      store[el.id].value = value;
      store[el.id].handleMessage(value);
    },
    /**
     * Retrieves the message value for a given element.
     *
     * @param {Element} el - The DOM element whose message value is retrieved.
     * @returns {string} - The resolved message value.
     */
    get: (el) => {
      return store[el.id] ? store[el.id].value : "";
    },
    /**
     * Clears the message parameters and value for a given element.
     *
     * @param {Element} el - The DOM element whose message entry will be cleared.
     */
    clear: (el) => {
      store[el.id].param = [];
      store[el.id].value = "";
      store[el.id].handleMessage("");
    },
  };
};
