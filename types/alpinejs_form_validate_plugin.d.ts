/**
 * @module validationPlugin
 * This module provides a validation plugin for Alpine.js, enabling form and field validations.
 */
import type { Alpine } from "./types/alpine_types.ts";
import type { FieldValidationConfig, FieldValidationOption, FormValidationConfig, FormValidationOption } from "./types/config_types.ts";
import type { CreateMessageStore, FunctionsOption } from "./types/functions_types.ts";
import type { CreateFieldValidator, CreateFormValidator } from "./types/validators_types.ts";
/**
 * Creates a validation plugin for Alpine.js using the provided utilities and configurations.
 *
 * @param {Object} options - Options for creating the validation plugin.
 * @param {CreateMessageStore} options.createMessageStore - Function to create a message store.
 * @param {CreateFormValidator} options.createFormValidator - Function to create a form validator.
 * @param {CreateFieldValidator} options.createFieldValidator - Function to create a field validator.
 * @param {function(EventTarget): FormValidationConfig} options.formDefaultConfig - Function that returns default form validation configuration.
 * @param {function(): FieldValidationConfig} options.fieldDefaultConfig - Function that returns default field validation configuration.
 * @returns {function({defaultFunctionsOptions?: FunctionsOption, defaultFormOptions?: FormValidationOption, defaultFieldOptions?: FieldValidationOption}=): function(Alpine: Alpine): void} - A function to configure and initialize the plugin with optional default configurations.
 */
export declare const createValidatePluginInternal: ({ createMessageStore, createFormValidator, createFieldValidator, formDefaultConfig, fieldDefaultConfig, }: {
    createMessageStore: CreateMessageStore;
    createFormValidator: CreateFormValidator;
    createFieldValidator: CreateFieldValidator;
    formDefaultConfig: (el: EventTarget) => FormValidationConfig;
    fieldDefaultConfig: () => FieldValidationConfig;
}) => ({ defaultFunctionsOptions, defaultFormOptions, defaultFieldOptions, }?: {
    defaultFunctionsOptions?: FunctionsOption;
    defaultFormOptions?: FormValidationOption;
    defaultFieldOptions?: FieldValidationOption;
}) => (Alpine: Alpine) => void;
/**
 * Creates a validation plugin for Alpine.js with optional configurations.
 *
 * @param {Object?} [options] - Optional configuration for the validation plugin.
 * @param {FunctionsOption?} [options.defaultFunctionsOptions] - Default functions options.
 * @param {FormValidationOption?} [options.defaultFormOptions] - Default form validation options.
 * @param {FieldValidationOption?} [options.defaultFieldOptions] - Default field validation options.
 * @returns {function(Alpine: Alpine): void} - A function that initializes a validation plugin for Alpine.js.
 */
export declare const createValidatePlugin: (options?: {
    defaultFunctionsOptions?: FunctionsOption;
    defaultFormOptions?: FormValidationOption;
    defaultFieldOptions?: FieldValidationOption;
}) => (Alpine: Alpine) => void;
/**
 * Initializes and returns a default validation plugin instance for Alpine.js.
 *
 * @param {Alpine} Alpine - The Alpine.js instance to which the validation plugin will be integrated.
 * @returns {void} - The function does not return a value; it directly integrates the plugin with Alpine.js.
 */
export declare const createValidatePluginDefault: (Alpine: Alpine) => void;
