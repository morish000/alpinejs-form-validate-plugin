import type { CreateFieldValidator } from "../types/validators_types.ts";
/**
 * Creates a field validator function for form field validation.
 *
 * @param {Alpine} Alpine - The Alpine.js instance used for prefixing events.
 * @returns {(el: FormFieldElements, config: FieldValidationConfig, functions: Functions) => () => void} A function that validates the form field elements.
 */
export declare const createFieldValidator: CreateFieldValidator;
