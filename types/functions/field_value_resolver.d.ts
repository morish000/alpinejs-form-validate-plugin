/**
 * @module fieldValueResolver
 * This module provides a function to create a resolver for field values, supporting various input types.
 */
import type { FieldValueResolver } from "../types/functions_types.ts";
/**
 * Creates a resolver for field values, supporting various input types.
 *
 * @returns {FieldValueResolver} - An object with methods to resolve field values and check if they are empty.
 */
export declare const createFieldValueResolver: () => FieldValueResolver;
