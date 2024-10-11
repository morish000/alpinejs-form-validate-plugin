import { assertStrictEquals } from "jsr:@std/assert";
import { assertSpyCalls, spy } from "jsr:@std/testing/mock";
import { createFormValidator } from "./form_validator.ts";
import type { FormValidationConfig } from "../types/config_types.ts";

Deno.test("validateForm - validates form without reporting validity when report flag is false", () => {
  const validity = false;
  const report = false;
  const checkValidity = spy(() => validity);
  const reportValidity = spy(() => validity);
  const form = {
    elements: [],
    reportValidity,
    checkValidity,
  } as unknown as HTMLFormElement;

  const result = createFormValidator(
    form,
    { report } as FormValidationConfig,
  )();

  assertStrictEquals(result, validity);
  assertSpyCalls(checkValidity, 1);
  assertSpyCalls(reportValidity, 0);
});

Deno.test("validateForm - validates form and reports validity when report flag is true", () => {
  const validity = true;
  const report = true;
  const checkValidity = spy(() => validity);
  const reportValidity = spy(() => validity);
  const form = {
    elements: [],
    reportValidity,
    checkValidity,
  } as unknown as HTMLFormElement;

  const result = createFormValidator(
    form,
    { report } as FormValidationConfig,
  )();

  assertStrictEquals(result, validity);
  assertSpyCalls(checkValidity, 0);
  assertSpyCalls(reportValidity, 1);
});

Deno.test("validateForm - calls custom validation for elements with custom validation logic", () => {
  const validity = true;
  const report = true;
  const checkValidity = spy(() => validity);
  const reportValidity = spy(() => validity);
  const validate = spy(() => {});
  const mockElement1 = { id: "field1" };
  const mockElement2 = { id: "field2", _x_validation: { validate } };
  const form = {
    elements: [mockElement1, mockElement2],
    reportValidity,
    checkValidity,
  } as unknown as HTMLFormElement;

  createFormValidator(
    form,
    { report } as FormValidationConfig,
  )();

  assertSpyCalls(validate, 1);
});
