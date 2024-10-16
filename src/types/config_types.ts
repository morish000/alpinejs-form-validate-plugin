/**
 * @module FormValidationConfig
 *
 * Provides configurations for form and field validation.
 */

/**
 * A type for deep optional properties in an object.
 *
 * @typedef {Object} DeepOptional
 * @template T
 * @property {T[P]} [P] - Optional property of type T.
 */
export type DeepOptional<T> = {
  [P in keyof T]?: T[P] extends object ? DeepOptional<T[P]> : T[P];
};

/**
 * Configuration options for form validation.
 *
 * @typedef {Object} FormValidationConfig
 * @property {boolean} report - Whether to report validation results.
 * @property {Object} trigger - Configuration for event triggers.
 * @property {EventTarget} trigger.target - The target element for the event.
 * @property {string} trigger.event - The event type to trigger validation.
 * @property {boolean} trigger.preventDefault - Whether to prevent the default action.
 * @property {Function|null} trigger.before - Function to execute before validation.
 * @property {Function|null} trigger.after - Function to execute after validation.
 */
export type FormValidationConfig = {
  report: boolean;
  trigger: {
    target: EventTarget;
    event: string;
    preventDefault: boolean;
    before: ((e?: Event) => void) | null;
    after: ((e?: Event) => void) | null;
  };
};

/**
 * Optional configuration for form validation.
 *
 * @typedef {DeepOptional<FormValidationConfig>} FormValidationOption
 */
export type FormValidationOption = DeepOptional<FormValidationConfig>;

/**
 * Configuration options for field validation.
 *
 * @typedef {Object} FieldValidationConfig
 * @property {ValidationConfig} v - Validation rules configuration.
 * @property {MessageConfig} m - Message configuration for validation.
 * @property {EventHandlerOptions} onChange - Options for the change event handler.
 * @property {EventHandlerOptions} onBlur - Options for the blur event handler.
 * @property {EventHandlerOptions} onInput - Options for the input event handler.
 * @property {InputLimit} inputLimit - Type of input limit mechanism.
 * @property {InputLimitOpts} inputLimitOpts - Options for input limiting.
 * @property {boolean?} formSubmit - Indicates if the form is submitted with validation.
 * @property {(() => void)?} validate - Function to perform validation logic.
 */
export type FieldValidationConfig = {
  v: ValidationConfig;
  m: MessageConfig;
  onChange: EventHandlerOptions;
  onBlur: EventHandlerOptions;
  onInput: EventHandlerOptions;
  inputLimit: InputLimit;
  inputLimitOpts: InputLimitOpts;
  formSubmit?: boolean;
  validate?: () => void;
};

/**
 * Optional configuration for field validation.
 *
 * @typedef {Object} FieldValidationOption
 * @property {ValidationOption} [v] - Optional validation options.
 * @property {MessageOption} [m] - Optional message options.
 * @property {EventHandlerOptions} [onChange] - Optional change event handler options.
 * @property {EventHandlerOptions} [onBlur] - Optional blur event handler options.
 * @property {EventHandlerOptions} [onInput] - Optional input event handler options.
 * @property {InputLimit} [inputLimit] - Optional input limit mechanism.
 * @property {DeepOptional<InputLimitOpts>} [inputLimitOpts] - Optional input limit options.
 */
export type FieldValidationOption = {
  v?: ValidationOption;
  m?: MessageOption;
  onChange?: EventHandlerOptions;
  onBlur?: EventHandlerOptions;
  onInput?: EventHandlerOptions;
  inputLimit?: InputLimit;
  inputLimitOpts?: DeepOptional<InputLimitOpts>;
};

/**
 * Configuration for validation rules and associated messages.
 *
 * @typedef {Object} ValidationConfig
 * @property {Object} [key] - Validation and message parameters.
 * @property {ValidatorFunction|FunctionParameter[]} v - Validation function or parameters.
 * @property {FunctionParameter[]} m - Message parameters.
 */
export type ValidationConfig = {
  [key: string]: {
    v: ValidatorFunction | FunctionParameter[];
    m: FunctionParameter[];
  };
};

/**
 * Options for configuring validation rules.
 *
 * @typedef {Object} ValidationOption
 * @property {Array|FunctionParameter|Object} [key] - Validation options.
 * @property {ValidatorFunction|FunctionParameter|FunctionParameter[]} [v] - Optional validator or parameters.
 * @property {FunctionParameter|FunctionParameter[]} m - Message parameters.
 */
export type ValidationOption = {
  [key: string]:
    | [ValidatorFunction, FunctionParameter]
    | [ValidatorFunction, FunctionParameter[]]
    | FunctionParameter
    | FunctionParameter[]
    | {
      v?: ValidatorFunction | FunctionParameter | FunctionParameter[];
      m: FunctionParameter | FunctionParameter[];
    };
};

/**
 * Partial configuration for validation messages based on validity states.
 *
 * @typedef {Partial<Object>} MessageConfig
 * @template ValidityStateKeys
 */
export type MessageConfig = Partial<
  { [key in ValidityStateKeys]: FunctionParameter[] }
>;

/**
 * Optional configuration for validation messages.
 *
 * @typedef {Partial<Object>} MessageOption
 * @template ValidityStateKeys
 */
export type MessageOption = Partial<
  { [key in ValidityStateKeys]: FunctionParameter | FunctionParameter[] }
>;

/**
 * Keys representing validity states excluding "customError" and "valid".
 *
 * @typedef {Exclude<keyof ValidityState, "customError" | "valid">} ValidityStateKeys
 */
export type ValidityStateKeys = Exclude<
  keyof ValidityState,
  "customError" | "valid"
>;

/**
 * Options for event handler configuration.
 *
 * @typedef {boolean|Object} EventHandlerOptions
 * @property {Function|null} [before] - Function to execute before the event.
 * @property {Function|null} [after] - Function to execute after the event.
 */
export type EventHandlerOptions = boolean | {
  before?: ((e?: Event) => void) | null;
  after?: ((e?: Event) => void) | null;
};

/**
 * Types of rate limiting for input events.
 *
 * @typedef {"none"|"debounce"|"throttle"|`debounce:${number}`|`throttle:${number}`} InputLimit
 */
export type InputLimit =
  | "none"
  | "debounce"
  | "throttle"
  | `debounce:${number}`
  | `throttle:${number}`;

/**
 * Options for configuring input rate limiting.
 *
 * @typedef {Object} InputLimitOpts
 * @property {Object} debounce - Configuration for debounce.
 * @property {number} debounce.wait - Wait time in milliseconds.
 * @property {boolean} debounce.immediate - Whether to run immediately.
 * @property {Object} throttle - Configuration for throttle.
 * @property {number} throttle.wait - Wait time in milliseconds.
 * @property {Object} throttle.options - Throttle options for execution.
 * @property {boolean} throttle.options.leading - Whether to trigger on the leading edge.
 * @property {boolean} throttle.options.trailing - Whether to trigger on the trailing edge.
 */
export type InputLimitOpts = {
  debounce: {
    wait: number;
    immediate: boolean;
  };
  throttle: {
    wait: number;
    options: {
      leading: boolean;
      trailing: boolean;
    };
  };
};

/**
 * A function to validate form field elements.
 *
 * @typedef {Function} ValidatorFunction
 * @param {HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement} el - The form field element.
 * @param {string|string[]|File[]} value - The value of the form field.
 * @returns {boolean} - Whether the field is valid.
 */
export type ValidatorFunction = (
  el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
  value: string | string[] | File[],
) => boolean;

/**
 * Parameters used in function calls, including objects, strings, numbers, and booleans.
 *
 * @typedef {object|string|number|boolean} FunctionParameter
 */
export type FunctionParameter =
  | object
  | string
  | number
  | boolean;
