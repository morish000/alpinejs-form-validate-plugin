import type { FormValidationConfig } from "../types/config_types.ts";
import type { CreateFormValidator } from "../types/validators_types.ts";

/**
 * Creates a form validation function that validates each element
 * within a form and optionally reports its validity.
 *
 * @param {HTMLFormElement} form - The form element containing elements to validate.
 * @param {FormValidationConfig} config - Configuration options for form validation, including whether to report validity.
 * @param {boolean} config.report - If true, the form's validity is reported to the user using reportValidity().
 * @returns {() => boolean} - A function that performs validation and returns whether the form is valid.
 */
export const createFormValidator: CreateFormValidator = (
  form: HTMLFormElement,
  { report }: FormValidationConfig,
) => {
  return function () {
    Array.from(form.elements).forEach((el) => {
      (el as { _x_validation?: { validate: () => void } })._x_validation
        ?.validate();
    });

    if (report) {
      return form.reportValidity();
    } else {
      return form.checkValidity();
    }
  };
};
