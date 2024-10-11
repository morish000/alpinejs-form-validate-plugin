/**
 * @module RateLimiters
 * 
 * Provides types and utility functions for debouncing and throttling event handlers.
 */

/**
 * A type representing a function that limits the execution rate of another function
 * using the debounce technique.
 *
 * @typedef {Function} Debounce
 * @param {EventTarget} el - The target element for the event.
 * @param {Function} func - The function to debounce.
 * @param {number} wait - The number of milliseconds to delay.
 * @param {boolean} [immediate] - Whether to run the function immediately.
 * @returns {LimittedHandler} - A handler with a cancel method to stop the invocation.
 */
export type Debounce = (
  el: EventTarget,
  func: (e?: Event) => void,
  wait: number,
  immediate?: boolean,
) => LimittedHandler;

/**
 * A type representing a function that limits the execution rate of another function
 * using the throttle technique.
 *
 * @typedef {Function} Throttle
 * @param {EventTarget} el - The target element for the event.
 * @param {Function} func - The function to throttle.
 * @param {number} wait - The number of milliseconds to wait between invocations.
 * @param {Object} [options] - Options to control the throttle behavior.
 * @param {boolean} [options.leading] - Whether to invoke on the leading edge.
 * @param {boolean} [options.trailing] - Whether to invoke on the trailing edge.
 * @returns {LimittedHandler} - A handler with a cancel method to stop the invocation.
 */
export type Throttle = (
  el: EventTarget,
  func: (e?: Event) => void,
  wait: number,
  options?: { leading?: boolean; trailing?: boolean },
) => LimittedHandler;

/**
 * A type for functions that handle events with limited execution frequency
 * and provide a method to cancel further invocations.
 *
 * @typedef {Object} LimittedHandler
 * @property {Function} (e?) - The function to handle an event.
 * @property {Function} cancel - A method to cancel the scheduled invocation.
 */
export type LimittedHandler = {
  (e?: Event): void;
  cancel: () => void;
};
