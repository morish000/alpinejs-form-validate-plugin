/**
 * @module validationConfigFormatter
 * This module provides a function to format a validation configuration from an abbreviated form to a full ValidationConfig object.
 */

import type {
  FunctionParameter,
  ValidationConfig,
  ValidationOption,
  ValidatorFunction,
} from "../types/config_types.ts";

/**
 * Formats a validation configuration from an abbreviated form to a full ValidationConfig object.
 *
 * @param {ValidationOption} abbreviated - The abbreviated validation configuration.
 * @returns {ValidationConfig} - The formatted validation configuration.
 * @throws {Error} - Throws an error if the message (m) is undefined for any validation key.
 */
export const formatValidationConfig = (
  abbreviated: ValidationOption,
): ValidationConfig => {
  const result: ValidationConfig = {};

  Object.entries(abbreviated).forEach(([key, value]) => {
    let v: ValidatorFunction | FunctionParameter[] | null = null;
    let m: FunctionParameter[] | null = null;

    if (Array.isArray(value)) {
      if (typeof value[0] === "function") {
        /**
         * Handles value as an array where the first element is a function.
         *
         * @type {ValidatorFunction}
         */
        v = value[0];
        m = Array.isArray(value[1]) ? value[1] : [value[1]];
      } else {
        /**
         * Handles value as an array where the first element is not a function, treats it as messages.
         *
         * @type {FunctionParameter[]}
         */
        m = value;
      }
    } else if (
      typeof value === "object" &&
      Object.keys(value).every((key) => key === "v" || key === "m") &&
      ("v" in value || "m" in value)
    ) {
      /**
       * Processes value as an object with 'v' and/or 'm' properties.
       *
       * @type {ValidatorFunction | FunctionParameter[]}
       */
      v = "v" in value
        ? Array.isArray(value.v)
          ? value.v as FunctionParameter[]
          : typeof value.v === "function"
          ? value.v as ValidatorFunction
          : [value.v as FunctionParameter]
        : null;
      /**
       * @type {FunctionParameter[]}
       */
      m = "m" in value ? (Array.isArray(value.m) ? value.m : [value.m]) : null;
    } else if (value !== null) {
      /**
       * Sets messages for non-null values that are not arrays or objects.
       *
       * @type {FunctionParameter[]}
       */
      m = [value];
    }

    if (!m) {
      throw new Error(`Message undefined. validation key: ${key}`);
    }

    result[key] = {
      v: v ?? [],
      m: m,
    };
  });

  return result;
};
