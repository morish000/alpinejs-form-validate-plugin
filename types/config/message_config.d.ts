/**
 * @module messageConfigFormatter
 * This module provides a function to format message configurations, ensuring each message value is an array.
 */
import type { MessageConfig, MessageOption } from "../types/config_types.ts";
/**
 * Formats the message configuration.
 *
 * @param {MessageOption} input - The input message configuration to be formatted.
 * @returns {MessageConfig} The formatted message configuration where each value is an array.
 */
export declare const formatMessageConfig: (input: MessageOption) => MessageConfig;
