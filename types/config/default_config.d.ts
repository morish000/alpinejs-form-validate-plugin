/**
 * @module validationConfigDefaults
 * This module provides default configurations for form and field validation.
 */
import type { FieldValidationConfig, FormValidationConfig } from "../types/config_types.ts";
/**
 * Creates the default configuration for form validation.
 *
 * @param {EventTarget} el - The event target for the form submission.
 * @returns {FormValidationConfig} The default configuration for handling form submission and validation.
 */
export declare const formDefaultConfig: (el: EventTarget) => FormValidationConfig;
/**
 * Creates the default configuration for field validation.
 *
 * @returns {FieldValidationConfig} The default configuration for handling field validation,
 * including reporting options and input change settings.
 */
export declare const fieldDefaultConfig: () => FieldValidationConfig;
