/**
 * @module ValidationFunctions
 *
 * A collection of types and definitions for handling form validation and message resolution.
 */
import type { Alpine } from "alpinejs";
import type { FieldValidationConfig, FunctionParameter, MessageConfig } from "./config_types.ts";
/**
 * A collection of functions used for form validation and handling messages.
 *
 * @typedef {Object} Functions
 * @property {FieldValueResolver} fieldValueResolver - Resolves field values.
 * @property {MessageResolver} messageResolver - Resolves messages.
 * @property {CustomFieldValidator[]} customFieldValidators - Array of custom validators.
 * @property {InputRateLimitterCreator} inputRateLimitter - Creates input rate limiters.
 * @property {Html5ValidationMessageResolver} html5ValidationMessageResolver - Resolves HTML5 validation messages.
 * @property {MessageStore} messageStore - Manages message storage.
 */
export type Functions = {
    fieldValueResolver: FieldValueResolver;
    messageResolver: MessageResolver;
    customFieldValidators: CustomFieldValidator[];
    inputRateLimitter: InputRateLimitterCreator;
    html5ValidationMessageResolver: Html5ValidationMessageResolver;
    messageStore: MessageStore;
};
/**
 * A partial version of the Functions type, allowing for optional properties.
 *
 * @typedef {Object} FunctionsOption
 */
export type FunctionsOption = Partial<Functions>;
/**
 * Functions to resolve and check field values.
 *
 * @typedef {Object} FieldValueResolver
 * @property {Function} resolve - Resolves the value of a form field.
 * @property {Function} isEmpty - Checks if a given value is empty.
 */
export type FieldValueResolver = {
    resolve: (el: FormFieldElements) => FormFieldValues;
    isEmpty: (value: FormFieldValues) => boolean;
};
/**
 * Functions to resolve messages and manage update listeners.
 *
 * @typedef {Object} MessageResolver
 * @property {Function} addUpdateListener - Adds a listener for message updates.
 * @property {Function} removeUpdateListener - Removes a listener for message updates.
 * @property {Function} resolve - Resolves a message based on the arguments.
 */
export type MessageResolver = {
    addUpdateListener: (listener: () => void) => void;
    removeUpdateListener: (listener: () => void) => void;
    resolve: (...args: FunctionParameter[]) => string;
};
/**
 * A validator for custom field validation logic.
 *
 * @typedef {Object} CustomFieldValidator
 * @property {Function} isSupported - Checks if a validator supports a given key.
 * @property {ValidateFunction} validate - Performs validation on a form field.
 */
export type CustomFieldValidator = {
    isSupported: (key: string) => boolean;
    validate: ValidateFunction;
};
/**
 * Creates a function that limits the rate of input events.
 *
 * @typedef {Function} InputRateLimitterCreator
 * @param {EventTarget} el - The event target element.
 * @param {Function} handler - The event handler function.
 * @param {FieldValidationConfig} config - The configuration for validation.
 * @returns {Function} - A rate-limited event handler.
 */
export type InputRateLimitterCreator = (el: EventTarget, handler: (e?: Event) => void, config: FieldValidationConfig) => (e?: Event) => void;
/**
 * Resolves validation messages based on HTML5 constraints.
 *
 * @typedef {Function} Html5ValidationMessageResolver
 * @param {FormFieldElements} el - The form field element.
 * @param {MessageConfig} messages - The configuration for messages.
 * @returns {FunctionParameter[] | null} - The resolved message parameters or null.
 */
export type Html5ValidationMessageResolver = (el: FormFieldElements, messages: MessageConfig) => FunctionParameter[] | null;
/**
 * Creates a store for managing validation messages.
 *
 * @typedef {import("alpinejs").Alpine} Alpine
 * @typedef {Function} CreateMessageStore
 * @param {Alpine} Alpine - An instance of Alpine.js.
 * @returns {Function} - A function that initializes the message store.
 */
export type CreateMessageStore = (Alpine: Alpine) => (functions: {
    messageResolver: MessageResolver;
}, store?: Record<string, MessageStoreItem>) => MessageStore;
/**
 * An item in the message store with message handling capabilities.
 *
 * @typedef {Object} MessageStoreItem
 * @property {Function} handleMessage - Handles a message with provided parameters.
 * @property {FunctionParameter[]} param - Parameters associated with the message.
 * @property {string} value - The stored message value.
 */
export type MessageStoreItem = {
    handleMessage: (message: string) => void;
    param: FunctionParameter[];
    value: string;
};
/**
 * Manages the storage and retrieval of validation messages.
 *
 * @typedef {Object} MessageStore
 * @property {Function} create - Creates a message entry for a form field.
 * @property {Function} delete - Deletes a message entry for a form field.
 * @property {Function} set - Sets message parameters for a form field.
 * @property {Function} get - Retrieves the message for a form field.
 * @property {Function} clear - Clears the message for a form field.
 */
export type MessageStore = {
    create: (el: FormFieldElements, handleMessage: (message: string) => void) => void;
    delete: (el: FormFieldElements) => void;
    set: (el: FormFieldElements, message: FunctionParameter[]) => void;
    get: (el: FormFieldElements) => string;
    clear: (el: FormFieldElements) => void;
};
/**
 * A collection of validation functions keyed by their identifier.
 *
 * @typedef {Object} ValidateFunctions
 */
export type ValidateFunctions = {
    [key: string]: (arg: FunctionParameter, ...rest: FunctionParameter[]) => boolean;
};
/**
 * A function to validate a form field based on its elements, value, and arguments.
 *
 * @typedef {Function} ValidateFunction
 * @param {FormFieldElements} el - The form field element to validate.
 * @param {FormFieldValues} value - The current value of the form field.
 * @param {string} name - The name of the field.
 * @param {FunctionParameter[]} args - The arguments for validation.
 * @returns {boolean} - Whether the field is valid.
 */
export type ValidateFunction = (el: FormFieldElements, value: FormFieldValues, name: string, args: FunctionParameter[]) => boolean;
/**
 * An interface representing a form field element with optional validation.
 *
 * This interface extends the standard HTMLElement to include an optional
 * custom attribute `_x_validation`, which can be used to store validation-related
 * information for the element.
 */
export interface ValidationFormFieldElement extends HTMLElement {
    /**
     * Stores validation-related information for the element.
     */
    _x_validation?: FieldValidationConfig;
}
/**
 * Represents HTML form elements that can be validated.
 *
 * @typedef {HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement} FormFieldElements
 */
export type FormFieldElements = (HTMLInputElement & ValidationFormFieldElement) | (HTMLSelectElement & ValidationFormFieldElement) | (HTMLTextAreaElement & ValidationFormFieldElement);
/**
 * Possible values for a form field, including strings and file arrays.
 *
 * @typedef {string | string[] | File[]} FormFieldValues
 */
export type FormFieldValues = string | string[] | File[];
