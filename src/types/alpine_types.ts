/**
 * @module AlpineExtensions
 *
 * This module extends the Alpine interface to include additional functionality.
 */

// @deno-types="@types/alpinejs"
import type { Alpine } from "alpinejs";
// @deno-types="@types/alpinejs"
export type { Alpine } from "alpinejs";

/**
 * Extends the Alpine interface to include the `watch` method.
 * The `watch` method observes changes in a value and triggers a callback.
 *
 * @template T - The type of the observed value.
 * @param getter - A function that returns the value to be observed.
 * @param callback - A function that is called when the observed value changes.
 *                  Receives the new value and the old value as arguments.
 */
export interface AlpineWithWatch extends Alpine {
  /**
   * Observes changes in a value and triggers a callback.
   */
  watch: <T>(
    getter: () => T,
    callback: (value: T, oldValue: T) => void,
  ) => void;
}
