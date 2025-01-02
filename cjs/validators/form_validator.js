"use strict";
/**
 * @module formValidator
 * This module provides functionality to create a form validation function for validating form elements in Alpine.js applications.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFormValidator = void 0;
/**
 * Creates a form validation function that validates each element
 * within a form and optionally reports its validity.
 *
 * @param {HTMLFormElement} form - The form element containing elements to validate.
 * @param {FormValidationConfig} config - Configuration options for form validation, including whether to report validity.
 * @param {boolean} config.report - If true, the form's validity is reported to the user using reportValidity().
 * @returns {() => boolean} - A function that performs validation and returns whether the form is valid.
 */
const createFormValidator = (form, { report }) => {
    return function () {
        Array.from(form.elements).forEach((el) => {
            el._x_validation
                ?.validate();
        });
        if (report) {
            return form.reportValidity();
        }
        else {
            return form.checkValidity();
        }
    };
};
exports.createFormValidator = createFormValidator;
