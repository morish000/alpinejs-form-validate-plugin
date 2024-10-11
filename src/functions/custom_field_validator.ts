import type { FunctionParameter } from "../types/config_types.ts";
import type {
  CustomFieldValidator,
  FormFieldElements,
  FormFieldValues,
  ValidateFunctions,
} from "../types/functions_types.ts";

/**
 * Creates a custom field validator using specified validation functions.
 *
 * @param {ValidateFunctions} validator - An object containing validation functions.
 * @returns {CustomFieldValidator} - An object with methods to check support and validate field values.
 */
export const createCustomFieldValidator = (
  validator: ValidateFunctions,
): CustomFieldValidator => ({
  /**
   * Checks if a validation function is supported for a given field name.
   *
   * @param {string} name - The name of the validation function to check.
   * @returns {boolean} - Returns true if the function is supported, false otherwise.
   */
  isSupported: (name: string) => typeof validator[name] === "function",
  /**
   * Validates the value of a form field using the specified validation function.
   *
   * @param {FormFieldElements} _el - The form element (not used in validation).
   * @param {FormFieldValues} value - The value of the form field to validate.
   * @param {string} name - The name of the validation function to use.
   * @param {FunctionParameter[]} args - Additional arguments to pass to the validation function.
   * @returns {boolean} - Returns true if validation succeeds, false otherwise.
   */
  validate: (
    _el: FormFieldElements,
    value: FormFieldValues,
    name: string,
    args: FunctionParameter[],
  ) => {
    const validateFunc = validator[name];
    if (typeof validateFunc === "function") {
      const result = validateFunc(value, ...args);
      return typeof result === "boolean" ? result : false;
    }
    return false;
  },
});
