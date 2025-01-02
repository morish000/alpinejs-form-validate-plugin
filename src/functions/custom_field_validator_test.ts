import type { ValidateFunctions } from "../types/functions_types";
import { spy } from "sinon";
import { JSDOM } from "jsdom";
import validaorJS from "validator";
import { createCustomFieldValidator } from "./custom_field_validator";

const {
  window,
} = new JSDOM(
  "<!DOCTYPE html><html><body></body></html>",
);

function createDummyElement(
  type: string = "text",
  name: string = "dummy",
): HTMLInputElement {
  const el = window.document.createElement("input");
  el.type = type;
  el.name = name;
  return el;
}

const mockValidator = {
  isEmail: (value: string) => /\S+@\S+\.\S+/.test(value),
  isLength: (value: string, options: { min?: number; max?: number }) =>
    (!options.min || value.length >= options.min) &&
    (!options.max || value.length <= options.max),
  escape: (value: string) => value,
  notFunction: "",
};

test("isSupported correctly identifies supported methods (mockValidator)", () => {
  const validator = createCustomFieldValidator(
    mockValidator as unknown as ValidateFunctions,
  );
  expect(validator.isSupported("isEmail")).toBe(true);
  expect(validator.isSupported("isLength")).toBe(true);
  expect(validator.isSupported("nonExistentFunc")).toBe(false);
  expect(validator.isSupported("escape")).toBe(true);
  expect(validator.isSupported("notFunction")).toBe(false);
});

test("isSupported correctly identifies supported methods (validator.js)", () => {
  const validator = createCustomFieldValidator(
    validaorJS as unknown as ValidateFunctions,
  );
  expect(validator.isSupported("isEmail")).toBe(true);
  expect(validator.isSupported("isLength")).toBe(true);
  expect(validator.isSupported("nonExistentFunc")).toBe(false);
  expect(validator.isSupported("escape")).toBe(true);
});

test("validate handles single parameter functions correctly (mockValidator)", () => {
  const validator = createCustomFieldValidator(
    mockValidator as unknown as ValidateFunctions,
  );
  const result = validator.validate(
    createDummyElement(),
    "test@example.com",
    "isEmail",
    [],
  );
  expect(result).toBe(true);

  const invalidResult = validator.validate(
    createDummyElement(),
    "invalid-email",
    "isEmail",
    [],
  );
  expect(invalidResult).toBe(false);
});

test("validate handles single parameter functions correctly (validator.js)", () => {
  const validator = createCustomFieldValidator(
    validaorJS as unknown as ValidateFunctions,
  );
  const result = validator.validate(
    createDummyElement(),
    "test@example.com",
    "isEmail",
    [],
  );
  expect(result).toBe(true);

  const invalidResult = validator.validate(
    createDummyElement(),
    "invalid-email",
    "isEmail",
    [],
  );
  expect(invalidResult).toBe(false);
});

test("validate handles multi-parameter functions correctly (mockValidator)", () => {
  const validator = createCustomFieldValidator(
    mockValidator as unknown as ValidateFunctions,
  );
  const result = validator.validate(createDummyElement(), "hello", "isLength", [
    {
      min: 3,
    },
  ]);
  expect(result).toBe(true);

  const invalidResult = validator.validate(
    createDummyElement(),
    "hi",
    "isLength",
    [{
      min: 3,
    }],
  );
  expect(invalidResult).toBe(false);
});

test("validate handles multi-parameter functions correctly (validator.js)", () => {
  const validator = createCustomFieldValidator(
    validaorJS as unknown as ValidateFunctions,
  );
  const result = validator.validate(createDummyElement(), "hello", "isLength", [
    {
      min: 3,
    },
  ]);
  expect(result).toBe(true);

  const invalidResult = validator.validate(
    createDummyElement(),
    "hi",
    "isLength",
    [{
      min: 3,
    }],
  );
  expect(invalidResult).toBe(false);
});

test("validate gracefully handles unsupported functions (mockValidator)", () => {
  const validator = createCustomFieldValidator(
    mockValidator as unknown as ValidateFunctions,
  );
  const result = validator.validate(
    createDummyElement(),
    "test@example.com",
    "nonExistentFunc",
    [],
  );
  expect(result).toBe(false);
});

test("validate gracefully handles unsupported functions (validator.js)", () => {
  const validator = createCustomFieldValidator(
    validaorJS as unknown as ValidateFunctions,
  );
  const result = validator.validate(
    createDummyElement(),
    "test@example.com",
    "nonExistentFunc",
    [],
  );
  expect(result).toBe(false);
});

test("Returns false for non-boolean return values (mockValidator)", () => {
  const escapeSpy = spy(mockValidator, "escape");

  const validator = createCustomFieldValidator(
    mockValidator as unknown as ValidateFunctions,
  );
  const result = validator.validate(
    createDummyElement(),
    "test value",
    "escape",
    [],
  );
  expect(result).toBe(false);

  expect(escapeSpy.callCount).toBe(1);

  expect(escapeSpy.getCall(0).args[0]).toBe("test value");
  expect(escapeSpy.getCall(0).returnValue).toBe("test value");

  escapeSpy.restore();
});

test("Returns false for non-boolean return values (validator.js)", () => {
  const escapeSpy = spy(validaorJS, "escape");

  const validator = createCustomFieldValidator(
    validaorJS as unknown as ValidateFunctions,
  );
  const result = validator.validate(
    createDummyElement(),
    "test value",
    "escape",
    [],
  );
  expect(result).toBe(false);

  expect(escapeSpy.callCount).toBe(1);
  expect(escapeSpy.getCall(0).args[0]).toBe("test value");
  expect(escapeSpy.getCall(0).returnValue).toBe("test value");

  escapeSpy.restore();
});

test("validate handles non-function values gracefully (mockValidator)", () => {
  const validator = createCustomFieldValidator(
    mockValidator as unknown as ValidateFunctions,
  );
  const result = validator.validate(
    createDummyElement(),
    "test@example.com",
    "notFunction",
    [],
  );
  expect(result).toBe(false);
});
