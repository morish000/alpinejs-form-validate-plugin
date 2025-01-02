/**
 * @module validationConfigFormatter
 * This module provides a function to format a validation configuration from an abbreviated form to a full ValidationConfig object.
 */
import type { ValidationConfig, ValidationOption } from "../types/config_types.ts";
/**
 * Formats a validation configuration from an abbreviated form to a full ValidationConfig object.
 *
 * @param {ValidationOption} abbreviated - The abbreviated validation configuration.
 * @returns {ValidationConfig} - The formatted validation configuration.
 * @throws {Error} - Throws an error if the message (m) is undefined for any validation key.
 */
export declare const formatValidationConfig: (abbreviated: ValidationOption) => ValidationConfig;
