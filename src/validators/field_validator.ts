/**
 * @module fieldValidator
 * This module provides functionality to create a field validator function for validating form field elements in Alpine.js applications.
 */

import type { Alpine } from "alpinejs";
import type { FieldValidationConfig } from "../types/config_types.ts";
import type { CreateFieldValidator } from "../types/validators_types.ts";
import type { FormFieldElements, Functions } from "../types/functions_types.ts";

/**
 * Creates a field validator function for form field validation.
 *
 * @param {Alpine} Alpine - The Alpine.js instance used for prefixing events.
 * @returns {(el: FormFieldElements, config: FieldValidationConfig, functions: Functions) => () => void} A function that validates the form field elements.
 */
export const createFieldValidator: CreateFieldValidator = (Alpine: Alpine) =>
(
  el: FormFieldElements,
  config: FieldValidationConfig,
  {
    messageStore,
    html5ValidationMessageResolver,
    fieldValueResolver,
    customFieldValidators,
  }: Functions,
) => {
  return function () {
    messageStore.clear(el);

    const isReport =
      (el as { _x_validation?: { formSubmit: boolean } })._x_validation
        ?.formSubmit && config.report;

    if (!(isReport ? el.reportValidity() : el.checkValidity())) {
      messageStore.set(
        el,
        html5ValidationMessageResolver(el, config.m) ?? [],
      );
      el.dispatchEvent(
        new CustomEvent(`${Alpine.prefixed("validate")}:failed`),
      );
      return;
    }

    const value = fieldValueResolver.resolve(el);

    if (!el.required && fieldValueResolver.isEmpty(value)) {
      messageStore.clear(el);
      el.dispatchEvent(
        new CustomEvent(`${Alpine.prefixed("validate")}:success`),
      );
      return;
    }

    for (const [key, { v, m }] of Object.entries(config.v)) {
      if (typeof v === "function") {
        if (!v(el, value)) {
          messageStore.set(el, m);
          isReport && el.reportValidity();
          el.dispatchEvent(
            new CustomEvent(`${Alpine.prefixed("validate")}:failed`),
          );
          return;
        }
        continue;
      }

      for (const customValidator of customFieldValidators) {
        if (
          customValidator.isSupported(key) &&
          !customValidator.validate(el, value, key, v)
        ) {
          messageStore.set(el, m);
          isReport && el.reportValidity();
          el.dispatchEvent(
            new CustomEvent(`${Alpine.prefixed("validate")}:failed`),
          );
          return;
        }
      }
    }
    el.dispatchEvent(
      new CustomEvent(`${Alpine.prefixed("validate")}:success`),
    );
  };
};
