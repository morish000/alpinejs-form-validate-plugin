/**
 * @module messageResolver
 * This module provides a factory to create a message resolver for handling message operations.
 */
import type { MessageResolver } from "../types/functions_types.ts";
/**
 * Creates a message resolver object for handling message operations.
 * Provides methods to add and remove update listeners and resolve messages from parameters.
 *
 * @returns {MessageResolver} - An object with methods to manage message updates and resolution.
 */
export declare const createMessageResolver: () => MessageResolver;
