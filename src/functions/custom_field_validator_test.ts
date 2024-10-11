import { assertFalse, assertStrictEquals } from "jsr:@std/assert";
import { assertSpyCall, assertSpyCalls, spy } from "jsr:@std/testing/mock";
import { createCustomFieldValidator } from "./custom_field_validator.ts";
import type { ValidateFunctions } from "../types/functions_types.ts";
import { JSDOM } from "jsdom";
import validaorJS from "validator";

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

Deno.test("isSupported correctly identifies supported methods (mockValidator)", () => {
  const validator = createCustomFieldValidator(
    mockValidator as unknown as ValidateFunctions,
  );
  assertStrictEquals(validator.isSupported("isEmail"), true);
  assertStrictEquals(validator.isSupported("isLength"), true);
  assertStrictEquals(validator.isSupported("nonExistentFunc"), false);
  assertStrictEquals(validator.isSupported("escape"), true);
  assertStrictEquals(validator.isSupported("notFunction"), false);
});

Deno.test("isSupported correctly identifies supported methods (validator.js)", () => {
  const validator = createCustomFieldValidator(
    validaorJS as unknown as ValidateFunctions,
  );
  assertStrictEquals(validator.isSupported("isEmail"), true);
  assertStrictEquals(validator.isSupported("isLength"), true);
  assertStrictEquals(validator.isSupported("nonExistentFunc"), false);
  assertStrictEquals(validator.isSupported("escape"), true);
});

Deno.test("validate handles single parameter functions correctly (mockValidator)", () => {
  const validator = createCustomFieldValidator(
    mockValidator as unknown as ValidateFunctions,
  );
  const result = validator.validate(
    createDummyElement(),
    "test@example.com",
    "isEmail",
    [],
  );
  assertStrictEquals(result, true);

  const invalidResult = validator.validate(
    createDummyElement(),
    "invalid-email",
    "isEmail",
    [],
  );
  assertStrictEquals(invalidResult, false);
});

Deno.test("validate handles single parameter functions correctly (validator.js)", () => {
  const validator = createCustomFieldValidator(
    validaorJS as unknown as ValidateFunctions,
  );
  const result = validator.validate(
    createDummyElement(),
    "test@example.com",
    "isEmail",
    [],
  );
  assertStrictEquals(result, true);

  const invalidResult = validator.validate(
    createDummyElement(),
    "invalid-email",
    "isEmail",
    [],
  );
  assertStrictEquals(invalidResult, false);
});

Deno.test("validate handles multi-parameter functions correctly (mockValidator)", () => {
  const validator = createCustomFieldValidator(
    mockValidator as unknown as ValidateFunctions,
  );
  const result = validator.validate(createDummyElement(), "hello", "isLength", [
    {
      min: 3,
    },
  ]);
  assertStrictEquals(result, true);

  const invalidResult = validator.validate(
    createDummyElement(),
    "hi",
    "isLength",
    [{
      min: 3,
    }],
  );
  assertStrictEquals(invalidResult, false);
});

Deno.test("validate handles multi-parameter functions correctly (validator.js)", () => {
  const validator = createCustomFieldValidator(
    validaorJS as unknown as ValidateFunctions,
  );
  const result = validator.validate(createDummyElement(), "hello", "isLength", [
    {
      min: 3,
    },
  ]);
  assertStrictEquals(result, true);

  const invalidResult = validator.validate(
    createDummyElement(),
    "hi",
    "isLength",
    [{
      min: 3,
    }],
  );
  assertStrictEquals(invalidResult, false);
});

Deno.test("validate gracefully handles unsupported functions (mockValidator)", () => {
  const validator = createCustomFieldValidator(
    mockValidator as unknown as ValidateFunctions,
  );
  const result = validator.validate(
    createDummyElement(),
    "test@example.com",
    "nonExistentFunc",
    [],
  );
  assertFalse(result);
});

Deno.test("validate gracefully handles unsupported functions (validator.js)", () => {
  const validator = createCustomFieldValidator(
    validaorJS as unknown as ValidateFunctions,
  );
  const result = validator.validate(
    createDummyElement(),
    "test@example.com",
    "nonExistentFunc",
    [],
  );
  assertFalse(result);
});

Deno.test("Returns false for non-boolean return values (mockValidator)", () => {
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
  assertFalse(result);

  assertSpyCalls(escapeSpy, 1);

  assertSpyCall(escapeSpy, 0, {
    args: ["test value"],
    returned: "test value",
  });

  escapeSpy.restore();
});

Deno.test("Returns false for non-boolean return values (validator.js)", () => {
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
  assertFalse(result);

  assertSpyCalls(escapeSpy, 1);

  assertSpyCall(escapeSpy, 0, {
    args: ["test value"],
    returned: "test value",
  });

  escapeSpy.restore();
});

Deno.test("validate handles non-function values gracefully (mockValidator)", () => {
  const validator = createCustomFieldValidator(
    mockValidator as unknown as ValidateFunctions,
  );
  const result = validator.validate(
    createDummyElement(),
    "test@example.com",
    "notFunction",
    [],
  );
  assertFalse(result);
});
