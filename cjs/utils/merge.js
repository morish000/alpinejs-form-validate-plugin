"use strict";
/**
 * @module objectMergeUtility
 * This module provides a utility function to deeply merge multiple objects into the first object.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.merge = void 0;
/**
 * Deeply merges multiple objects into the first object.
 * Functions are not merged, but all other types are recursively merged.
 *
 * @template T - The type of the primary object to merge into.
 * @param {T} first - The initial object that other objects will be merged into.
 * @param {...any[]} rest - Additional objects to merge into the first object.
 * @returns {T} The merged object.
 */
const merge = (first, ...rest) => {
    const result = { ...first };
    return rest.reduce((acc, obj) => {
        Object.entries(obj).forEach(([key, value]) => {
            if (typeof value !== "function" && value instanceof Object && key in acc &&
                acc[key] instanceof Object) {
                acc[key] = (0, exports.merge)(acc[key], value);
            }
            else if (value !== null && value !== undefined) {
                acc[key] = value;
            }
        });
        return acc;
    }, result);
};
exports.merge = merge;
