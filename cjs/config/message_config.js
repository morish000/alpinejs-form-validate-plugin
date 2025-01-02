"use strict";
/**
 * @module messageConfigFormatter
 * This module provides a function to format message configurations, ensuring each message value is an array.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatMessageConfig = void 0;
/**
 * Formats the message configuration.
 *
 * @param {MessageOption} input - The input message configuration to be formatted.
 * @returns {MessageConfig} The formatted message configuration where each value is an array.
 */
const formatMessageConfig = (input) => {
    const result = {};
    Object.entries(input).forEach(([key, value]) => {
        /**
         * Ensures each message value is in an array format.
         *
         * @type {ValidityStateKeys}
         */
        result[key] = Array.isArray(value) ? value : [value];
    });
    return result;
};
exports.formatMessageConfig = formatMessageConfig;
