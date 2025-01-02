import type { Alpine } from "alpinejs";
import type {
  FieldValidationConfig,
  MessageConfig,
} from "../types/config_types";
import type {
  FormFieldElements,
  FormFieldValues,
  Functions,
} from "../types/functions_types";
import type { FunctionParameter } from "../types/config_types";
import { spy } from "sinon";
import { createFieldValidator } from "./field_validator";
import { createMessageStore } from "../functions/message_store";
import { createCustomFieldValidator } from "../functions/custom_field_validator";

const mockAlpine = {
  reactive: (value: object) => value,
  prefixed: (key: string) => `x-${key}`,
} as unknown as Alpine;

const mockMessageResolver = {
  addUpdateListener: () => { },
  removeUpdateListener: () => { },
  resolve: (..._args: any[]) => {
    return "resolved message";
  },
};

test("createFieldValidator - handles HTML5 validity failure", () => {
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
  const dispatchEventSpy = spy((..._args: any[]) => { });
  const el = {
    id: "input1",
    required: false,
    value: "",
    checkValidity,
    dispatchEvent: dispatchEventSpy,
  } as unknown as FormFieldElements;

  mockFunctions.messageStore?.create(el, () => { });
  const validate = createFieldValidator(mockAlpine)(
    el,
    validatorConfig,
    mockFunctions,
  );

  validate();

  expect(store[el.id].value).toEqual("resolved message");
  expect(dispatchEventSpy.callCount).toBe(1);
  expect(
    dispatchEventSpy.getCall(0).args[0].type).toBe(
      "x-validate:failed",
    );
  expect(checkValidity.callCount).toBe(1);

  messageResolved = null;

  validate();

  expect(dispatchEventSpy.callCount).toBe(2);
  expect(
    dispatchEventSpy.getCall(1).args[0].type).toBe(
      "x-validate:failed",
    );
  expect(checkValidity.callCount).toBe(2);
});

test("createFieldValidator - succeeds with not required and empty field", () => {
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

  const dispatchEventSpy = spy((..._args: any[]) => { });
  const el = {
    id: "input1",
    required: false,
    value: "",
    checkValidity: () => true,
    dispatchEvent: dispatchEventSpy,
  } as unknown as FormFieldElements;

  mockFunctions.messageStore?.create(el, () => { });
  const validate = createFieldValidator(mockAlpine)(
    el,
    validatorConfig,
    mockFunctions,
  );

  validate();

  expect(dispatchEventSpy.callCount).toBe(1);
  expect(
    dispatchEventSpy.getCall(0).args[0].type).toBe(
      "x-validate:success",
    );
});

test("createFieldValidator - direct custom validation method success and failure", () => {
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

  const checkValidity = spy(() => true);
  const dispatchEventSpy = spy((..._args: any[]) => { });
  const el = {
    id: "input1",
    required: true,
    value: "mockValue",
    checkValidity,
    dispatchEvent: dispatchEventSpy,
  } as unknown as FormFieldElements;

  mockFunctions.messageStore?.create(el, () => { });
  const validate = createFieldValidator(mockAlpine)(
    el,
    validatorConfig,
    mockFunctions,
  );

  validate();

  expect(dispatchEventSpy.callCount).toBe(1);
  expect(
    dispatchEventSpy.getCall(0).args[0].type).toBe(
      "x-validate:success",
    );
  expect(checkValidity.callCount).toBe(1);

  el.value = "wrongValue";
  validate();

  expect(dispatchEventSpy.callCount).toBe(2);
  expect(
    dispatchEventSpy.getCall(1).args[0].type).toBe(
      "x-validate:failed",
    );
  expect(checkValidity.callCount).toBe(2);
});

test("createFieldValidator - custom stored validation method success and failure", () => {
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

  const checkValidity = spy(() => true);
  const dispatchEventSpy = spy((..._args: any[]) => { });
  const el = {
    id: "input1",
    required: true,
    value: "mockValue",
    checkValidity,
    dispatchEvent: dispatchEventSpy,
  } as unknown as FormFieldElements;

  mockFunctions.messageStore?.create(el, () => { });
  const validate = createFieldValidator(mockAlpine)(
    el,
    validatorConfig,
    mockFunctions,
  );

  validate();

  expect(dispatchEventSpy.callCount).toBe(1);
  expect(
    dispatchEventSpy.getCall(0).args[0].type).toBe(
      "x-validate:success",
    );
  expect(checkValidity.callCount).toBe(1);

  el.value = "wrongValue";
  validate();

  expect(dispatchEventSpy.callCount).toBe(2);
  expect(
    dispatchEventSpy.getCall(1).args[0].type).toBe(
      "x-validate:failed",
    );
  expect(checkValidity.callCount).toBe(2);
});
