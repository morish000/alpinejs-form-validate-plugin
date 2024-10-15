// deno-lint-ignore-file no-explicit-any
import { assertEquals, assertStrictEquals } from "jsr:@std/assert";
import { assertSpyCalls, spy } from "jsr:@std/testing/mock";
import { createFieldValidator } from "./field_validator.ts";
import { createMessageStore } from "../functions/message_store.ts";
import { createCustomFieldValidator } from "../functions/custom_field_validator.ts";
import type {
  FieldValidationConfig,
  MessageConfig,
} from "../types/config_types.ts";
import type {
  FormFieldElements,
  FormFieldValues,
  Functions,
} from "../types/functions_types.ts";
import type { FunctionParameter } from "../types/config_types.ts";
// @deno-types="@types/alpinejs"
import type { Alpine } from "alpinejs";

const mockAlpine = {
  reactive: (value: object) => value,
  prefixed: (key: string) => `x-${key}`,
} as unknown as Alpine;

const mockMessageResolver = {
  addUpdateListener: () => {},
  removeUpdateListener: () => {},
  resolve: (..._args: any[]) => {
    return "resolved message";
  },
};

Deno.test("createFieldValidator - handles HTML5 validity failure", () => {
  const store: any = {};
  let messageResolved: FunctionParameter[] | null = ["test"];
  const mockFunctions: Functions = {
    messageStore: createMessageStore(mockAlpine)({
      messageResolver: mockMessageResolver,
    }, store),
    html5ValidationMessageResolver: (
      _el: FormFieldElements,
      _messages: MessageConfig,
    ) => messageResolved,
    fieldValueResolver: {
      resolve: (el: FormFieldElements) => el.value,
      isEmpty: (value: FormFieldValues) => value === "",
    },
  } as unknown as Functions;

  const validatorConfig: FieldValidationConfig = {
    m: ["message"],
  } as unknown as FieldValidationConfig;

  const checkValidity = spy(() => false);
  const reportValidity = spy(() => false);
  const dispatchEventSpy = spy((..._args: any[]) => {});
  const el = {
    id: "input1",
    required: false,
    value: "",
    checkValidity,
    reportValidity,
    dispatchEvent: dispatchEventSpy,
  } as unknown as FormFieldElements;

  mockFunctions.messageStore?.create(el, () => {});
  let validate = createFieldValidator(mockAlpine)(
    el,
    validatorConfig,
    mockFunctions,
  );

  validate();

  assertEquals(store[el.id].value, "resolved message");
  assertSpyCalls(dispatchEventSpy, 1);
  assertStrictEquals(
    dispatchEventSpy.calls[0].args[0].type,
    "x-validate:failed",
  );
  assertSpyCalls(checkValidity, 1);
  assertSpyCalls(reportValidity, 0);

  (el as any)["_x_validation"] = { formSubmit: true };

  messageResolved = null;

  validate();

  assertSpyCalls(dispatchEventSpy, 2);
  assertStrictEquals(
    dispatchEventSpy.calls[1].args[0].type,
    "x-validate:failed",
  );
  assertSpyCalls(checkValidity, 2);
  assertSpyCalls(reportValidity, 0);

  validatorConfig.report = true;

  validate = createFieldValidator(mockAlpine)(
    el,
    validatorConfig,
    mockFunctions,
  );

  validate();

  assertSpyCalls(dispatchEventSpy, 3);
  assertStrictEquals(
    dispatchEventSpy.calls[2].args[0].type,
    "x-validate:failed",
  );
  assertSpyCalls(checkValidity, 2);
  assertSpyCalls(reportValidity, 1);
});

Deno.test("createFieldValidator - succeeds with not required and empty field", () => {
  const mockFunctions: Functions = {
    messageStore: createMessageStore(mockAlpine)({
      messageResolver: mockMessageResolver,
    }),
    fieldValueResolver: {
      resolve: (el: FormFieldElements) => el.value,
      isEmpty: (value: FormFieldValues) => value === "",
    },
  } as unknown as Functions;

  const validatorConfig: FieldValidationConfig =
    {} as unknown as FieldValidationConfig;

  const dispatchEventSpy = spy((..._args: any[]) => {});
  const el = {
    id: "input1",
    required: false,
    value: "",
    checkValidity: () => true,
    reportValidity: () => true,
    dispatchEvent: dispatchEventSpy,
  } as unknown as FormFieldElements;

  mockFunctions.messageStore?.create(el, () => {});
  const validate = createFieldValidator(mockAlpine)(
    el,
    validatorConfig,
    mockFunctions,
  );

  validate();

  assertSpyCalls(dispatchEventSpy, 1);
  assertStrictEquals(
    dispatchEventSpy.calls[0].args[0].type,
    "x-validate:success",
  );
});

Deno.test("createFieldValidator - direct custom validation method success and failure", () => {
  const mockFunctions: Functions = {
    messageStore: createMessageStore(mockAlpine)({
      messageResolver: mockMessageResolver,
    }),
    fieldValueResolver: {
      resolve: (el: FormFieldElements) => el.value,
      isEmpty: (value: FormFieldValues) => value === "",
    },
  } as unknown as Functions;

  const validatorConfig: FieldValidationConfig = {
    v: {
      test: {
        v: (_el: any, value: any) => {
          return value === "mockValue";
        },
        m: ["message"],
      },
    },
  } as unknown as FieldValidationConfig;

  const reportValidity = spy(() => true);
  const dispatchEventSpy = spy((..._args: any[]) => {});
  const el = {
    id: "input1",
    required: true,
    value: "mockValue",
    checkValidity: () => true,
    reportValidity,
    dispatchEvent: dispatchEventSpy,
  } as unknown as FormFieldElements;

  mockFunctions.messageStore?.create(el, () => {});
  let validate = createFieldValidator(mockAlpine)(
    el,
    validatorConfig,
    mockFunctions,
  );

  validate();

  assertSpyCalls(dispatchEventSpy, 1);
  assertStrictEquals(
    dispatchEventSpy.calls[0].args[0].type,
    "x-validate:success",
  );
  assertSpyCalls(reportValidity, 0);

  el.value = "wrongValue";
  validate();

  assertSpyCalls(dispatchEventSpy, 2);
  assertStrictEquals(
    dispatchEventSpy.calls[1].args[0].type,
    "x-validate:failed",
  );
  assertSpyCalls(reportValidity, 0);

  (el as any)["_x_validation"] = { formSubmit: true };
  validatorConfig.report = true;

  validate = createFieldValidator(mockAlpine)(
    el,
    validatorConfig,
    mockFunctions,
  );

  validate();

  assertSpyCalls(dispatchEventSpy, 3);
  assertStrictEquals(
    dispatchEventSpy.calls[2].args[0].type,
    "x-validate:failed",
  );
  assertSpyCalls(reportValidity, 2);
});

Deno.test("createFieldValidator - custom stored validation method success and failure", () => {
  const mockFunctions: Functions = {
    customFieldValidators: [
      createCustomFieldValidator({
        validate: (value) => value === "mockValue",
      }),
    ],
    messageStore: createMessageStore(mockAlpine)({
      messageResolver: mockMessageResolver,
    }),
    fieldValueResolver: {
      resolve: (el: FormFieldElements) => el.value,
      isEmpty: (value: FormFieldValues) => value === "",
    },
  } as unknown as Functions;

  const validatorConfig: FieldValidationConfig = {
    v: {
      validate: {
        v: [],
        m: ["message"],
      },
    },
  } as unknown as FieldValidationConfig;

  const reportValidity = spy(() => true);
  const dispatchEventSpy = spy((..._args: any[]) => {});
  const el = {
    id: "input1",
    required: true,
    value: "mockValue",
    checkValidity: () => true,
    reportValidity,
    dispatchEvent: dispatchEventSpy,
  } as unknown as FormFieldElements;

  mockFunctions.messageStore?.create(el, () => {});
  let validate = createFieldValidator(mockAlpine)(
    el,
    validatorConfig,
    mockFunctions,
  );

  validate();

  assertSpyCalls(dispatchEventSpy, 1);
  assertStrictEquals(
    dispatchEventSpy.calls[0].args[0].type,
    "x-validate:success",
  );
  assertSpyCalls(reportValidity, 0);

  el.value = "wrongValue";
  validate();

  assertSpyCalls(dispatchEventSpy, 2);
  assertStrictEquals(
    dispatchEventSpy.calls[1].args[0].type,
    "x-validate:failed",
  );
  assertSpyCalls(reportValidity, 0);

  (el as any)["_x_validation"] = { formSubmit: true };
  validatorConfig.report = true;

  validate = createFieldValidator(mockAlpine)(
    el,
    validatorConfig,
    mockFunctions,
  );

  validate();

  assertSpyCalls(dispatchEventSpy, 3);
  assertStrictEquals(
    dispatchEventSpy.calls[2].args[0].type,
    "x-validate:failed",
  );
  assertSpyCalls(reportValidity, 2);
});
