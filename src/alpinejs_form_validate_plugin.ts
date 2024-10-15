/**
 * @module validationPlugin
 * This module provides a validation plugin for Alpine.js, enabling form and field validations.
 */

// @deno-types="@types/alpinejs"
import type {
  DirectiveData,
  DirectiveUtilities,
  ElementWithXAttributes,
} from "alpinejs";
import type { Alpine } from "./types/alpine_types.ts";
import { debounce, merge, throttle } from "./utils/index.ts";
import {
  fieldDefaultConfig,
  formatMessageConfig,
  formatValidationConfig,
  formDefaultConfig,
} from "./config/index.ts";
import {
  createFieldValueResolver,
  createHtml5ValidationMessageResolver,
  createInputRateLimitter,
  createMessageResolver,
  createMessageStore,
} from "./functions/index.ts";
import {
  createFieldValidator,
  createFormValidator,
} from "./validators/index.ts";
import type {
  FieldValidationConfig,
  FieldValidationOption,
  FormValidationConfig,
  FormValidationOption,
} from "./types/config_types.ts";
import type {
  CreateMessageStore,
  FormFieldElements,
  Functions,
  FunctionsOption,
} from "./types/functions_types.ts";
import type {
  CreateFieldValidator,
  CreateFormValidator,
} from "./types/validators_types.ts";

/**
 * Creates a validation plugin for Alpine.js using the provided utilities and configurations.
 *
 * @param {Object} options - Options for creating the validation plugin.
 * @param {CreateMessageStore} options.createMessageStore - Function to create a message store.
 * @param {CreateFormValidator} options.createFormValidator - Function to create a form validator.
 * @param {CreateFieldValidator} options.createFieldValidator - Function to create a field validator.
 * @param {function(EventTarget): FormValidationConfig} options.formDefaultConfig - Function that returns default form validation configuration.
 * @param {function(): FieldValidationConfig} options.fieldDefaultConfig - Function that returns default field validation configuration.
 * @returns {function({defaultFunctionsOptions?: FunctionsOption, defaultFormOptions?: FormValidationOption, defaultFieldOptions?: FieldValidationOption}=): function(Alpine: Alpine): void} - A function to configure and initialize the plugin with optional default configurations.
 */
export const createValidatePluginInternal = (
  {
    createMessageStore,
    createFormValidator,
    createFieldValidator,
    formDefaultConfig,
    fieldDefaultConfig,
  }: {
    createMessageStore: CreateMessageStore;
    createFormValidator: CreateFormValidator;
    createFieldValidator: CreateFieldValidator;
    formDefaultConfig: (el: EventTarget) => FormValidationConfig;
    fieldDefaultConfig: () => FieldValidationConfig;
  },
) =>
(
  {
    defaultFunctionsOptions = {},
    defaultFormOptions = {},
    defaultFieldOptions = {},
  }: {
    defaultFunctionsOptions?: FunctionsOption;
    defaultFormOptions?: FormValidationOption;
    defaultFieldOptions?: FieldValidationOption;
  } = {},
) =>
(Alpine: Alpine): void => {
  const functions: Functions = (() => {
    const opts = {
      fieldValueResolver: defaultFunctionsOptions.fieldValueResolver ??
        createFieldValueResolver(),
      messageResolver: defaultFunctionsOptions.messageResolver ??
        createMessageResolver(),
      customFieldValidators: defaultFunctionsOptions.customFieldValidators ??
        [],
      inputRateLimitter: defaultFunctionsOptions.inputRateLimitter ??
        createInputRateLimitter(debounce, throttle),
      html5ValidationMessageResolver:
        defaultFunctionsOptions.html5ValidationMessageResolver ??
          createHtml5ValidationMessageResolver(),
    };
    return {
      ...opts,
      messageStore: defaultFunctionsOptions.messageStore ??
        createMessageStore(Alpine)(opts),
    };
  })();

  Alpine.directive(
    "validate-form",
    (
      el: ElementWithXAttributes,
      { expression }: DirectiveData,
      { evaluate, cleanup }: DirectiveUtilities,
    ) => {
      /**
       * Merges and returns the form validation configuration for the element.
       * @returns {FormValidationConfig} - The merged form validation configuration.
       */
      const config: FormValidationConfig = (() => {
        const formConfig = { ...formDefaultConfig(el) };
        const formOptions = { ...defaultFormOptions };
        const formExpression = {
          ...(expression ? evaluate(expression) : {}) as FormValidationOption,
        };

        const merged: FormValidationConfig = merge(
          formConfig,
          formOptions,
          formExpression,
        );

        merged.trigger.target = (formExpression.trigger?.target ??
          formOptions.trigger?.target ??
          formConfig.trigger.target) as EventTarget;

        return merged;
      })();

      // console.log(config);

      const { before, after, preventDefault } = config.trigger;
      const formValidator = createFormValidator(el as HTMLFormElement, config);

      /**
       * Handles the form validation event, invoking configured callbacks and triggering success or failure events.
       * @param {Event} event - The event that triggered form validation.
       */
      const handleEvent = (event: Event) => {
        before?.call(el, event);
        const isValid = formValidator.call(el);
        after?.call(el, event);

        if (!isValid && preventDefault) {
          event.preventDefault();
        }

        if (isValid) {
          el.dispatchEvent(
            new CustomEvent(`${Alpine.prefixed("validate")}:success`),
          );
        } else {
          el.dispatchEvent(
            new CustomEvent(`${Alpine.prefixed("validate")}:failed`),
          );
        }
      };

      const { target, event: eventName } = config.trigger;
      target.addEventListener(eventName, handleEvent);

      (el as { _x_validation?: FormValidationConfig })._x_validation = config;
      cleanup(() => {
        target.removeEventListener(eventName, handleEvent);
        delete (el as { _x_validation?: FormValidationConfig })._x_validation;
      });
    },
  );

  Alpine.directive(
    "validate",
    (
      el: ElementWithXAttributes,
      { expression }: DirectiveData,
      { evaluate, cleanup }: DirectiveUtilities,
    ) => {
      if (!el.id || !(el as FormFieldElements).name) {
        throw new Error(
          "Validation error: Form elements with validation rules must have an id and name attribute.",
        );
      }

      /**
       * Merges and returns the field validation configuration for the element.
       * @returns {FieldValidationConfig} - The merged field validation configuration.
       */
      const config: FieldValidationConfig = (() => {
        const inputConfig = merge(
          fieldDefaultConfig(),
          defaultFieldOptions,
          (el as FormFieldElements).form?._x_validation?.report != null
            ? {
              report: (el as FormFieldElements).form?._x_validation.report,
            }
            : {},
          expression ? evaluate(expression) : {},
        );
        inputConfig.v = formatValidationConfig(inputConfig.v);
        inputConfig.m = formatMessageConfig(inputConfig.m);
        return inputConfig;
      })();

      // console.log(config);

      const validate = createFieldValidator(Alpine)(
        el as FormFieldElements,
        config,
        functions,
      );

      /**
       * Creates a validation field handler to manage before and after hooks.
       * @param {Object} hooks - Before and after hooks.
       * @param {function} validate - The validation function to call.
       * @returns {function(Event=): void} - The event handler function.
       */
      const createValidateFieldHandler = (
        { before, after }: {
          before?: ((e?: Event) => void) | null;
          after?: ((e?: Event) => void) | null;
        },
        validate: () => void,
      ) => {
        return (e?: Event) => {
          before?.call(el, e);
          validate.apply(el);
          after?.call(el, e);
        };
      };

      const events: { eventName: string; handler: (e: Event) => void }[] = [];

      /**
       * Registers an event handler based on given conditions.
       * @param {boolean} condition - Condition to check before registering.
       * @param {string} eventName - Name of the event.
       * @param {function(Event): void} eventHandler - The event handler function.
       */
      const registerEvent = (
        condition: boolean,
        eventName: string,
        eventHandler: (e: Event) => void,
      ) => {
        if (condition && eventHandler) {
          events.push({ eventName, handler: eventHandler });
        }
      };

      registerEvent(
        !!config.onChange || (!config.onBlur && !config.onInput),
        "change",
        createValidateFieldHandler(
          !config.onChange || config.onChange === true ? {} : config.onChange,
          validate,
        ),
      );
      registerEvent(
        !!config.onBlur,
        "blur",
        createValidateFieldHandler(
          !config.onBlur || config.onBlur === true ? {} : config.onBlur,
          validate,
        ),
      );
      registerEvent(
        !!config.onInput,
        "input",
        functions.inputRateLimitter(
          el,
          createValidateFieldHandler(
            !config.onInput || config.onInput === true ? {} : config.onInput,
            validate,
          ),
          config,
        ),
      );

      (el as FormFieldElements)._x_validation = {
        ...config,
        formSubmit: !(el as FormFieldElements).form,
        validate: function () {
          validate();
          this.formSubmit = true;
          if (["radio", "checkbox"].includes((el as FormFieldElements).type)) {
            Array.from<FormFieldElements>(
              (el as FormFieldElements).form?.querySelectorAll(
                `input[type="${(el as FormFieldElements).type}"][name="${
                  (el as FormFieldElements).name
                }"]`,
              ) ?? [],
            )
              .filter((elem: FormFieldElements) =>
                elem !== el && !elem.hasAttribute(Alpine.prefixed("validate"))
              )
              .forEach((elem: FormFieldElements) => {
                events.forEach(({ eventName, handler }) => {
                  elem.addEventListener(eventName, handler);
                });
              });
          }
        },
      };

      functions.messageStore.create(
        el as FormFieldElements,
        (message) => {
          (el as FormFieldElements).setCustomValidity(message);
          (el as FormFieldElements)._x_validation?.formSubmit && message &&
            config.report &&
            (el as FormFieldElements).reportValidity();
        },
      );

      events.forEach(({ eventName, handler }) => {
        el.addEventListener(eventName, handler);
      });

      cleanup(() => {
        if (["radio", "checkbox"].includes((el as FormFieldElements).type)) {
          Array.from<FormFieldElements>(
            (el as FormFieldElements).form?.querySelectorAll(
              `input[type="${(el as FormFieldElements).type}"][name="${
                (el as FormFieldElements).name
              }"]`,
            ) ?? [],
          )
            .filter((elem: FormFieldElements) =>
              elem !== el && !elem.hasAttribute(Alpine.prefixed("validate"))
            )
            .forEach((elem: FormFieldElements) => {
              events.forEach(({ eventName, handler }) => {
                elem.removeEventListener(eventName, handler);
              });
            });
        }
        events.forEach(({ eventName, handler }) => {
          el.removeEventListener(eventName, handler);
          (handler as { cancel?: () => void }).cancel?.();
        });
        functions.messageStore.delete(el as FormFieldElements);
        delete (el as FormFieldElements)._x_validation;
      });
    },
  );

  Alpine.directive(
    "validate-message-for",
    (
      el: ElementWithXAttributes,
      { expression }: DirectiveData,
      { effect }: DirectiveUtilities,
    ) => {
      /**
       * Evaluates and updates the text content based on the validation message store.
       */
      effect(() => {
        const field = document.querySelector(expression);
        Alpine.mutateDom(() => {
          el.textContent = field
            ? functions.messageStore.get(field as FormFieldElements)
            : "";
        });
      });
    },
  );
};

/**
 * Creates a validation plugin for Alpine.js with optional configurations.
 *
 * @param {Object?} [options] - Optional configuration for the validation plugin.
 * @param {FunctionsOption?} [options.defaultFunctionsOptions] - Default functions options.
 * @param {FormValidationOption?} [options.defaultFormOptions] - Default form validation options.
 * @param {FieldValidationOption?} [options.defaultFieldOptions] - Default field validation options.
 * @returns {function(Alpine: Alpine): void} - A function that initializes a validation plugin for Alpine.js.
 */
export const createValidatePlugin: (
  options?: {
    defaultFunctionsOptions?: FunctionsOption;
    defaultFormOptions?: FormValidationOption;
    defaultFieldOptions?: FieldValidationOption;
  },
) => (Alpine: Alpine) => void = createValidatePluginInternal({
  createMessageStore,
  createFormValidator,
  createFieldValidator,
  formDefaultConfig,
  fieldDefaultConfig,
});

/**
 * Initializes and returns a default validation plugin instance for Alpine.js.
 *
 * @param {Alpine} Alpine - The Alpine.js instance to which the validation plugin will be integrated.
 * @returns {void} - The function does not return a value; it directly integrates the plugin with Alpine.js.
 */
export const createValidatePluginDefault: (Alpine: Alpine) => void =
  createValidatePlugin();
