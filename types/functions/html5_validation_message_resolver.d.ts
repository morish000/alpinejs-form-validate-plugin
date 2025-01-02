/**
 * @module html5ValidationMessageResolver
 * This module provides a function to create a resolver for HTML5 validation messages
 * based on validity state keys.
 */
import type { Html5ValidationMessageResolver } from "../types/functions_types.ts";
/**
 * Creates a resolver for HTML5 validation messages based on validity state keys.
 *
 * @returns {Html5ValidationMessageResolver} - A function that checks a form field's validity and returns relevant messages.
 */
export declare const createHtml5ValidationMessageResolver: () => Html5ValidationMessageResolver;
