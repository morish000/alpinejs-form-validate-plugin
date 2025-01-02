import type { FormValidationConfig } from "../types/config_types";
import { spy } from "sinon";
import { createFormValidator } from "./form_validator";

test("validateForm - validates form without reporting validity when report flag is false", () => {
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

  expect(result).toBe(validity);
  expect(checkValidity.callCount).toBe(1);
  expect(reportValidity.callCount).toBe(0);
});

test("validateForm - validates form and reports validity when report flag is true", () => {
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

  expect(result).toBe(validity);
  expect(checkValidity.callCount).toBe(0);
  expect(reportValidity.callCount).toBe(1);
});

test("validateForm - calls custom validation for elements with custom validation logic", () => {
  const validity = true;
  const report = true;
  const checkValidity = spy(() => validity);
  const reportValidity = spy(() => validity);
  const validate = spy(() => { });
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

  expect(validate.callCount).toBe(1);
});
