"use strict";
/**
 * @module validationConfigDefaults
 * This module provides default configurations for form and field validation.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.fieldDefaultConfig = exports.formDefaultConfig = void 0;
/**
 * Creates the default configuration for form validation.
 *
 * @param {EventTarget} el - The event target for the form submission.
 * @returns {FormValidationConfig} The default configuration for handling form submission and validation.
 */
const formDefaultConfig = (el) => ({
    report: true,
    trigger: {
        target: el,
        event: "submit",
        preventDefault: true,
        before: null,
        after: null,
    },
});
exports.formDefaultConfig = formDefaultConfig;
/**
 * Creates the default configuration for field validation.
 *
 * @returns {FieldValidationConfig} The default configuration for handling field validation,
 * including reporting options and input change settings.
 */
const fieldDefaultConfig = () => ({
    v: {},
    m: {},
    report: false,
    onChange: true,
    onBlur: false,
    onInput: false,
    inputLimit: "none",
    inputLimitOpts: {
        debounce: { wait: 250, immediate: false },
        throttle: {
            wait: 500,
            options: { leading: false, trailing: true },
        },
    },
});
exports.fieldDefaultConfig = fieldDefaultConfig;
