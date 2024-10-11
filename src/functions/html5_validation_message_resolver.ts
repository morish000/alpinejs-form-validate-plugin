import type {
  FunctionParameter,
  MessageConfig,
  ValidityStateKeys,
} from "../types/config_types.ts";
import type {
  FormFieldElements,
  Html5ValidationMessageResolver,
} from "../types/functions_types.ts";

/**
 * Creates a resolver for HTML5 validation messages based on validity state keys.
 *
 * @returns {Html5ValidationMessageResolver} - A function that checks a form field's validity and returns relevant messages.
 */
export const createHtml5ValidationMessageResolver =
  (): Html5ValidationMessageResolver => {
    // @see https://developer.mozilla.org/ja/docs/Web/API/ValidityState
    const validityKeys: ValidityStateKeys[] = [
      "valueMissing",
      "typeMismatch",
      "patternMismatch",
      "tooLong",
      "tooShort",
      "rangeUnderflow",
      "rangeOverflow",
      "stepMismatch",
      "badInput",
    ];

    return (
      el: FormFieldElements,
      messages: MessageConfig,
    ) => {
      /**
       * Checks validity of the form element and returns appropriate messages.
       *
       * @param {FormFieldElements} el - The form field element to be validated.
       * @param {MessageConfig} messages - Configuration for validation messages.
       * @returns {FunctionParameter[] | null} - Array of messages if invalid, otherwise null.
       */
      if (el.checkValidity()) {
        return null;
      }
      const key: ValidityStateKeys | undefined = validityKeys.find((k) =>
        el.validity[k] && messages[k]
      );
      return key
        ? messages[key] as FunctionParameter[]
        : [el.validationMessage];
    };
  };
