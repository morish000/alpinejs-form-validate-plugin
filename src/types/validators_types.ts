/**
 * @module ValidatorFactory
 * 
 * Provides types for creating form and field validators using configuration and helper functions.
 */

import type { Alpine } from "./alpine_types.ts";
import type {
  FieldValidationConfig,
  FormValidationConfig,
} from "./config_types.ts";
import type { FormFieldElements, Functions } from "./functions_types.ts";

/**
 * A type representing a function that takes a form and a configuration,
 * and returns a function to indicate if the form is valid.
 *
 * @typedef {Function} CreateFormValidator
 * @param {HTMLFormElement} form - The HTML form element to validate.
 * @param {FormValidationConfig} config - The configuration for form validation.
 * @returns {Function} - A function that returns a boolean indicating form validity.
 */
export type CreateFormValidator = (
  form: HTMLFormElement,
  config: FormValidationConfig,
) => () => boolean;

/**
 * A type representing a function that takes an Alpine.js instance and
 * returns a validator function for form fields, using field elements,
 * validation configuration, and helper functions.
 *
 * @typedef {Function} CreateFieldValidator
 * @param {Alpine} Alpine - An instance of Alpine.js.
 * @returns {Function} - A function that takes form field elements,
 * a field validation configuration, helper functions,
 * and returns a function to perform validation.
 * @param {FormFieldElements} el - The form field elements to validate.
 * @param {FieldValidationConfig} config - The configuration for field validation.
 * @param {Functions} functions - The helper functions.
 * @returns {Function} - A function to execute validation.
 */
export type CreateFieldValidator = (Alpine: Alpine) => (
  el: FormFieldElements,
  config: FieldValidationConfig,
  functions: Functions,
) => () => void;
