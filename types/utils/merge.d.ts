/**
 * @module objectMergeUtility
 * This module provides a utility function to deeply merge multiple objects into the first object.
 */
/**
 * Deeply merges multiple objects into the first object.
 * Functions are not merged, but all other types are recursively merged.
 *
 * @template T - The type of the primary object to merge into.
 * @param {T} first - The initial object that other objects will be merged into.
 * @param {...any[]} rest - Additional objects to merge into the first object.
 * @returns {T} The merged object.
 */
export declare const merge: <T extends object>(first: T, ...rest: any[]) => T;
