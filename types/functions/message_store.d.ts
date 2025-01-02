import type { CreateMessageStore } from "../types/functions_types.ts";
/**
 * Creates a message store for managing message values associated with DOM elements.
 *
 * @param {Alpine} Alpine - Alpine.js instance used to create reactive stores.
 * @returns {MessageStore} - An object providing methods to manipulate message values.
 */
export declare const createMessageStore: CreateMessageStore;
