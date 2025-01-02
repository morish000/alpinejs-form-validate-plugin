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
export declare const createInputRateLimitter: (debounce: Debounce, throttle: Throttle) => InputRateLimitterCreator;
