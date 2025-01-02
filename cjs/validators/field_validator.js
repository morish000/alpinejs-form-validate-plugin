"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFieldValidator = void 0;
/**
 * Creates a field validator function for form field validation.
 *
 * @param {Alpine} Alpine - The Alpine.js instance used for prefixing events.
 * @returns {(el: FormFieldElements, config: FieldValidationConfig, functions: Functions) => () => void} A function that validates the form field elements.
 */
const createFieldValidator = (Alpine) => (el, config, { messageStore, html5ValidationMessageResolver, fieldValueResolver, customFieldValidators, }) => {
    return function () {
        messageStore.clear(el);
        if (!el.checkValidity()) {
            messageStore.set(el, html5ValidationMessageResolver(el, config.m) ?? []);
            el.dispatchEvent(new CustomEvent(`${Alpine.prefixed("validate")}:failed`));
            return;
        }
        const value = fieldValueResolver.resolve(el);
        if (!el.required && fieldValueResolver.isEmpty(value)) {
            messageStore.clear(el);
            el.dispatchEvent(new CustomEvent(`${Alpine.prefixed("validate")}:success`));
            return;
        }
        for (const [key, { v, m }] of Object.entries(config.v)) {
            if (typeof v === "function") {
                if (!v(el, value)) {
                    messageStore.set(el, m);
                    el.dispatchEvent(new CustomEvent(`${Alpine.prefixed("validate")}:failed`));
                    return;
                }
                continue;
            }
            for (const customValidator of customFieldValidators) {
                if (customValidator.isSupported(key) &&
                    !customValidator.validate(el, value, key, v)) {
                    messageStore.set(el, m);
                    el.dispatchEvent(new CustomEvent(`${Alpine.prefixed("validate")}:failed`));
                    return;
                }
            }
        }
        el.dispatchEvent(new CustomEvent(`${Alpine.prefixed("validate")}:success`));
    };
};
exports.createFieldValidator = createFieldValidator;
