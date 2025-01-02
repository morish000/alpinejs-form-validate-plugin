/**
 * @module messageResolver
 * This module provides a factory to create a message resolver for handling message operations.
 */

import type { FunctionParameter } from "../types/config_types.ts";
import type { MessageResolver } from "../types/functions_types.ts";

/**
 * Creates a message resolver object for handling message operations.
 * Provides methods to add and remove update listeners and resolve messages from parameters.
 *
 * @returns {MessageResolver} - An object with methods to manage message updates and resolution.
 */
export const createMessageResolver = (): MessageResolver => ({
  /**
   * Adds an update listener for message changes.
   */
  addUpdateListener: () => { },
  /**
   * Removes an existing update listener.
   */
  removeUpdateListener: () => { },
  /**
   * Resolves a message from given parameters.
   *
   * @param {...FunctionParameter[]} args - Parameters for message resolution.
   * @returns {string} - The resolved message as a string.
   */
  resolve: (...args: FunctionParameter[]) =>
    args.length > 0 ? args[0].toString() : "",
});
