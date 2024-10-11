/**
 * @module inputRateLimitter
 * This module provides a factory to create an input rate limitter using debounce or throttle techniques.
 */

import type { Debounce, Throttle } from "../types/utils_types.ts";
import type { InputRateLimitterCreator } from "../types/functions_types.ts";

/**
 * Creates an input rate limitter based on the specified method and options.
 *
 * @param {Debounce} debounce - The debounce function to control input rate.
 * @param {Throttle} throttle - The throttle function to control input rate.
 * @returns {InputRateLimitterCreator} - A function that applies the specified input rate limiting technique.
 */
export const createInputRateLimitter = (
  debounce: Debounce,
  throttle: Throttle,
): InputRateLimitterCreator =>
(el, handler, { inputLimit, inputLimitOpts }) => {
  if (!inputLimit) {
    return handler;
  }
  const [method, wait] = inputLimit.split(":");

  switch (method) {
    case "debounce":
      /**
       * Applies debounce with the specified wait time and options.
       *
       * @param {Element} el - The element to which the handler is applied.
       * @param {Function} handler - The function to be debounced.
       * @param {number} wait - The wait time in milliseconds.
       * @param {boolean} immediate - If true, triggers the function on the leading edge.
       * @returns {Function} - The debounced function.
       */
      return debounce(
        el,
        handler,
        Number(wait ?? inputLimitOpts.debounce.wait),
        inputLimitOpts.debounce.immediate,
      );
    case "throttle":
      /**
       * Applies throttle with the specified wait time and options.
       *
       * @param {Element} el - The element to which the handler is applied.
       * @param {Function} handler - The function to be throttled.
       * @param {number} wait - The wait time in milliseconds.
       * @param {Object} options - Throttle options.
       * @returns {Function} - The throttled function.
       */
      return throttle(
        el,
        handler,
        Number(wait ?? inputLimitOpts.throttle.wait),
        inputLimitOpts.throttle.options,
      );
    case "none":
      // Returns the original handler if no rate limiting is specified.
      return handler;
    default:
      if (method) {
        throw new Error(`Input rate limitter not found: ${method}.`);
      }
      return handler;
  }
};
