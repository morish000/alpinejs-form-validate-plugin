/**
 * @module messageConfigFormatter
 * This module provides a function to format message configurations, ensuring each message value is an array.
 */

import type {
  MessageConfig,
  MessageOption,
  ValidityStateKeys,
} from "../types/config_types.ts";

/**
 * Formats the message configuration.
 *
 * @param {MessageOption} input - The input message configuration to be formatted.
 * @returns {MessageConfig} The formatted message configuration where each value is an array.
 */
export const formatMessageConfig = (input: MessageOption): MessageConfig => {
  const result: MessageConfig = {};

  Object.entries(input).forEach(([key, value]) => {
    /**
     * Ensures each message value is in an array format.
     *
     * @type {ValidityStateKeys}
     */
    result[key as ValidityStateKeys] = Array.isArray(value) ? value : [value];
  });

  return result;
};
