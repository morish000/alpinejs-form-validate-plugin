/**
 * @module customFieldValidator
 * This module provides a function to create a custom field validator using specified validation functions.
 */
import type { CustomFieldValidator, ValidateFunctions } from "../types/functions_types.ts";
/**
 * Creates a custom field validator using specified validation functions.
 *
 * @param {ValidateFunctions} validator - An object containing validation functions.
 * @returns {CustomFieldValidator} - An object with methods to check support and validate field values.
 */
export declare const createCustomFieldValidator: (validator: ValidateFunctions) => CustomFieldValidator;
