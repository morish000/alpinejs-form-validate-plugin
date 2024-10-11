/**
 * @module validationConfigDefaults
 * This module provides default configurations for form and field validation.
 */

import type {
  FieldValidationConfig,
  FormValidationConfig,
} from "../types/config_types.ts";

/**
 * Creates the default configuration for form validation.
 *
 * @param {EventTarget} el - The event target for the form submission.
 * @returns {FormValidationConfig} The default configuration for handling form submission and validation.
 */
export const formDefaultConfig = (el: EventTarget): FormValidationConfig => ({
  report: true,
  trigger: {
    target: el,
    event: "submit",
    preventDefault: true,
    before: null,
    after: null,
  },
});

/**
 * Creates the default configuration for field validation.
 *
 * @returns {FieldValidationConfig} The default configuration for handling field validation,
 * including reporting options and input change settings.
 */
export const fieldDefaultConfig = (): FieldValidationConfig => (
  {
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
  }
);
