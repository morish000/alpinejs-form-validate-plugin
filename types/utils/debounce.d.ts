/**
 * @module debounceUtility
 * This module provides a debounce utility function to delay invoking a function until after a specified wait time.
 */
import type { Debounce } from "../types/utils_types.ts";
/**
 * Creates a debounced function that delays invoking the provided function
 * until after a specified wait time has elapsed since the last time it was invoked.
 * Optionally, it can invoke the function immediately on the leading edge.
 *
 * @param {HTMLElement} el - The context element to bind the function to.
 * @param {(e?: Event) => void} func - The function to debounce.
 * @param {number} wait - The number of milliseconds to delay.
 * @param {boolean} immediate - Whether to execute the function on the leading edge.
 * @returns {LimittedHandler} The debounced function with a cancel method.
 */
export declare const debounce: Debounce;
