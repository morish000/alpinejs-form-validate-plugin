"use strict";
/**
 * @module fieldValueResolver
 * This module provides a function to create a resolver for field values, supporting various input types.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFieldValueResolver = void 0;
/**
 * Creates a resolver for field values, supporting various input types.
 *
 * @returns {FieldValueResolver} - An object with methods to resolve field values and check if they are empty.
 */
const createFieldValueResolver = () => ({
    /**
     * Resolves the value of a form field based on its type.
     *
     * @param {HTMLElement} el - The form element to resolve the value from.
     * @returns {FormFieldValues} - The resolved value of the form element.
     * @throws {Error} - Throws an error if the form element is not found.
     */
    resolve: (el) => {
        let value;
        if (el.type === "radio") {
            // For radio, return the value of the checked input with the same name, or an empty string if none are checked.
            const form = el.form;
            if (!form) {
                throw new Error("A form element is required.");
            }
            const selected = form.querySelector(`input[type="radio"][name="${el.name}"]:checked`);
            value = selected ? selected.value : "";
        }
        else if (el.type === "checkbox") {
            // For checkbox, return an array of values of the checked inputs with the same name, or an empty array if none are checked.
            const form = el.form;
            if (!form) {
                throw new Error("A form element is required.");
            }
            const checkboxes = form.querySelectorAll(`input[type="checkbox"][name="${el.name}"]:checked`);
            value = Array.from(checkboxes).map((checkbox) => checkbox.value);
        }
        else if (el.type === "file" && el instanceof HTMLInputElement) {
            // For file, return an array of the selected files, or an empty array if none are selected.
            value = el.files ? Array.from(el.files) : [];
        }
        else if (el.tagName.toLowerCase() === "select" && el instanceof HTMLSelectElement) {
            // For select, return an array if multiple is true (or empty if none selected), otherwise return a string (empty if none selected).
            value = el.multiple
                ? Array.from(el.selectedOptions).map((option) => option.value)
                : el.value;
        }
        else {
            // For other types, return the value as a string.
            value = el.value;
        }
        return value;
    },
    /**
     * Checks if the provided value is considered empty.
     *
     * @param {FormFieldValues} value - The value to check.
     * @returns {boolean} - Returns true if the value is empty, false otherwise.
     */
    isEmpty: (value) => !value
        ? true
        : typeof value === "string"
            ? value.trim() === ""
            : value.length === 0,
});
exports.createFieldValueResolver = createFieldValueResolver;
