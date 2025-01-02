/**
 * @module validationPlugin
 * This module provides a validation plugin for Alpine.js, enabling form and field validations.
 */
import { debounce, merge, throttle } from "./utils/index.js";
import { fieldDefaultConfig, formatMessageConfig, formatValidationConfig, formDefaultConfig, } from "./config/index.js";
import { createFieldValueResolver, createHtml5ValidationMessageResolver, createInputRateLimitter, createMessageResolver, createMessageStore, } from "./functions/index.js";
import { createFieldValidator, createFormValidator, } from "./validators/index.js";
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
export const createValidatePluginInternal = ({ createMessageStore, createFormValidator, createFieldValidator, formDefaultConfig, fieldDefaultConfig, }) => ({ defaultFunctionsOptions = {}, defaultFormOptions = {}, defaultFieldOptions = {}, } = {}) => (Alpine) => {
    const functions = (() => {
        const opts = {
            fieldValueResolver: defaultFunctionsOptions.fieldValueResolver ??
                createFieldValueResolver(),
            messageResolver: defaultFunctionsOptions.messageResolver ??
                createMessageResolver(),
            customFieldValidators: defaultFunctionsOptions.customFieldValidators ??
                [],
            inputRateLimitter: defaultFunctionsOptions.inputRateLimitter ??
                createInputRateLimitter(debounce, throttle),
            html5ValidationMessageResolver: defaultFunctionsOptions.html5ValidationMessageResolver ??
                createHtml5ValidationMessageResolver(),
        };
        return {
            ...opts,
            messageStore: defaultFunctionsOptions.messageStore ??
                createMessageStore(Alpine)(opts),
        };
    })();
    Alpine.directive("validate-form", (el, { expression }, { evaluate, cleanup }) => {
        /**
         * Merges and returns the form validation configuration for the element.
         * @returns {FormValidationConfig} - The merged form validation configuration.
         */
        const config = (() => {
            const formConfig = { ...formDefaultConfig(el) };
            const formOptions = { ...defaultFormOptions };
            const formExpression = {
                ...(expression ? evaluate(expression) : {}),
            };
            const merged = merge(formConfig, formOptions, formExpression);
            merged.trigger.target = (formExpression.trigger?.target ??
                formOptions.trigger?.target ??
                formConfig.trigger.target);
            return merged;
        })();
        // console.log(config);
        const { before, after, preventDefault } = config.trigger;
        const formValidator = createFormValidator(el, config);
        /**
         * Handles the form validation event, invoking configured callbacks and triggering success or failure events.
         * @param {Event} event - The event that triggered form validation.
         */
        const handleEvent = (event) => {
            before?.call(el, event);
            const isValid = formValidator.call(el);
            after?.call(el, event);
            if (!isValid && preventDefault) {
                event.preventDefault();
            }
            if (isValid) {
                el.dispatchEvent(new CustomEvent(`${Alpine.prefixed("validate")}:success`));
            }
            else {
                el.dispatchEvent(new CustomEvent(`${Alpine.prefixed("validate")}:failed`));
            }
        };
        const { target, event: eventName } = config.trigger;
        target.addEventListener(eventName, handleEvent);
        el._x_validation = config;
        cleanup(() => {
            target.removeEventListener(eventName, handleEvent);
            delete el._x_validation;
        });
    });
    Alpine.directive("validate", (el, { expression }, { evaluate, cleanup }) => {
        if (!el.id || !el.name) {
            throw new Error("Validation error: Form elements with validation rules must have an id and name attribute.");
        }
        /**
         * Merges and returns the field validation configuration for the element.
         * @returns {FieldValidationConfig} - The merged field validation configuration.
         */
        const config = (() => {
            const inputConfig = merge(fieldDefaultConfig(), defaultFieldOptions, el.form?._x_validation?.report != null
                ? {
                    report: el.form?._x_validation.report,
                }
                : {}, expression ? evaluate(expression) : {});
            inputConfig.v = formatValidationConfig(inputConfig.v);
            inputConfig.m = formatMessageConfig(inputConfig.m);
            return inputConfig;
        })();
        // console.log(config);
        const validate = createFieldValidator(Alpine)(el, config, functions);
        /**
         * Creates a validation field handler to manage before and after hooks.
         * @param {Object} hooks - Before and after hooks.
         * @param {function} validate - The validation function to call.
         * @returns {function(Event=): void} - The event handler function.
         */
        const createValidateFieldHandler = ({ before, after }, validate) => {
            return (e) => {
                before?.call(el, e);
                validate.apply(el);
                el._x_validation?.formSubmit &&
                    config.report && el.reportValidity();
                after?.call(el, e);
            };
        };
        const events = [];
        /**
         * Registers an event handler based on given conditions.
         * @param {boolean} condition - Condition to check before registering.
         * @param {string} eventName - Name of the event.
         * @param {function(Event): void} eventHandler - The event handler function.
         */
        const registerEvent = (condition, eventName, eventHandler) => {
            if (condition && eventHandler) {
                events.push({ eventName, handler: eventHandler });
            }
        };
        registerEvent(!!config.onChange || (!config.onBlur && !config.onInput), "change", createValidateFieldHandler(!config.onChange || config.onChange === true ? {} : config.onChange, validate));
        registerEvent(!!config.onBlur, "blur", createValidateFieldHandler(!config.onBlur || config.onBlur === true ? {} : config.onBlur, validate));
        registerEvent(!!config.onInput, "input", functions.inputRateLimitter(el, createValidateFieldHandler(!config.onInput || config.onInput === true ? {} : config.onInput, validate), config));
        el._x_validation = {
            ...config,
            formSubmit: !el.form,
            validate: function () {
                validate();
                this.formSubmit = true;
                if (["radio", "checkbox"].includes(el.type)) {
                    Array.from(el.form?.querySelectorAll(`input[type="${el.type}"][name="${el.name}"]`) ?? [])
                        .filter((elem) => elem !== el && !elem.hasAttribute(Alpine.prefixed("validate")))
                        .forEach((elem) => {
                        events.forEach(({ eventName, handler }) => {
                            elem.addEventListener(eventName, handler);
                        });
                    });
                }
            },
        };
        functions.messageStore.create(el, (message) => {
            el.setCustomValidity(message);
        });
        events.forEach(({ eventName, handler }) => {
            el.addEventListener(eventName, handler);
        });
        cleanup(() => {
            if (["radio", "checkbox"].includes(el.type)) {
                Array.from(el.form?.querySelectorAll(`input[type="${el.type}"][name="${el.name}"]`) ?? [])
                    .filter((elem) => elem !== el && !elem.hasAttribute(Alpine.prefixed("validate")))
                    .forEach((elem) => {
                    events.forEach(({ eventName, handler }) => {
                        elem.removeEventListener(eventName, handler);
                    });
                });
            }
            events.forEach(({ eventName, handler }) => {
                el.removeEventListener(eventName, handler);
                handler.cancel?.();
            });
            functions.messageStore.delete(el);
            delete el._x_validation;
        });
    });
    Alpine.directive("validate-message-for", (el, { expression }, { effect }) => {
        /**
         * Evaluates and updates the text content based on the validation message store.
         */
        effect(() => {
            const field = document.querySelector(expression);
            Alpine.mutateDom(() => {
                el.textContent = field
                    ? functions.messageStore.get(field)
                    : "";
            });
        });
    });
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
export const createValidatePlugin = createValidatePluginInternal({
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
export const createValidatePluginDefault = createValidatePlugin();
