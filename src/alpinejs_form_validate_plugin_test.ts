// deno-lint-ignore-file no-explicit-any ban-types
import {
  assert,
  assertEquals,
  assertExists,
  assertFalse,
  assertStrictEquals,
  assertThrows,
} from "jsr:@std/assert";
import { assertSpyCalls, spy } from "jsr:@std/testing/mock";
import { formDefaultConfig } from "./config/default_config.ts";
import {
  createValidatePlugin,
  createValidatePluginDefault,
} from "./alpinejs_form_validate_plugin.ts";
// @deno-types="@types/alpinejs"
import type { Alpine, DirectiveData, DirectiveUtilities } from "alpinejs";
import type { MessageStore } from "./types/functions_types.ts";
// @deno-types="@types/jsdom"
import { JSDOM } from "jsdom";

const createAlpineMock = () => ({
  directive: (_name: string, _callback: Function) => {},
  prefixed: (str: string) => `x-${str}`,
  reactive: (o: object) => o,
  mutateDom: (f: () => void) => f(),
} as unknown as Alpine);

const createMockMessageResolver = (message: string) => ({
  addUpdateListener: () => {},
  removeUpdateListener: () => {},
  resolve: (..._args: any[]) => {
    return message;
  },
});

Deno.test("createValidatePlugin - registers three directives", () => {
  const Alpine = createAlpineMock();
  const directiveSpy = spy(Alpine, "directive");

  createValidatePluginDefault(Alpine);

  assertSpyCalls(directiveSpy, 3);
  directiveSpy.restore();
});

// validate-form

Deno.test("validate-form directive - sets initial validation configuration", () => {
  const Alpine = createAlpineMock();
  const directiveSpy = spy(Alpine, "directive");

  createValidatePluginDefault(Alpine);

  const callback = directiveSpy.calls[0].args[1] as Function;

  const mockElement = {
    addEventListener: spy((_event: string, _handler: any) => {}),
    removeEventListener: spy(() => {}),
    _x_validation: undefined,
  };

  const mockEvaluate = (_expr: string) => (eval(`(${_expr})`));
  const mockCleanup = spy((_fn: any) => {});

  callback(
    mockElement as any, // el
    { expression: "" } as DirectiveData,
    {
      evaluate: mockEvaluate,
      cleanup: mockCleanup,
    } as unknown as DirectiveUtilities,
  );

  assertSpyCalls(mockElement.addEventListener, 1);
  assertExists(mockElement._x_validation);
  assertEquals(
    mockElement._x_validation,
    formDefaultConfig(mockElement as unknown as EventTarget),
  );

  mockCleanup.calls[0].args[0]();

  assertSpyCalls(mockElement.removeEventListener, 1);
  assertFalse("_x_validation" in mockElement);

  directiveSpy.restore();
});

Deno.test("validate-form directive - overrides default configuration", () => {
  const Alpine = createAlpineMock();
  const directiveSpy = spy(Alpine, "directive");

  const addEventListener = spy((_e: string, _h: () => void) => {});
  const removeEventListener = spy((_e: string, _h: () => void) => {});
  createValidatePlugin({
    defaultFormOptions: {
      report: false,
      trigger: {
        target: {
          addEventListener,
          removeEventListener,
        },
      },
    },
  })(Alpine);

  const callback = directiveSpy.calls[0].args[1] as Function;

  const mockElement = {
    addEventListener: spy((_event: string, _handler: any) => {}),
    removeEventListener: spy(() => {}),
    _x_validation: undefined,
  };

  const mockEvaluate = (_expr: string) => eval(`(${_expr})`);
  const mockCleanup = spy((_fn: any) => {});

  callback(
    mockElement as any, // el
    { expression: "" } as DirectiveData,
    {
      evaluate: mockEvaluate,
      cleanup: mockCleanup,
    } as unknown as DirectiveUtilities,
  );

  assertSpyCalls(mockElement.addEventListener, 0);
  assertSpyCalls(addEventListener, 1);
  assertExists(mockElement._x_validation);
  assertFalse((mockElement._x_validation as any).report);
  assertEquals(
    (mockElement._x_validation as any).trigger.target,
    { addEventListener, removeEventListener },
  );

  mockCleanup.calls[0].args[0]();

  assertSpyCalls(mockElement.removeEventListener, 0);
  assertSpyCalls(removeEventListener, 1);
  assertFalse("_x_validation" in mockElement);

  // overwite form element

  const eventTarget = {
    addEventListener: spy((_e: string, _h: () => void) => {}),
    removeEventListener: spy((_e: string, _h: () => void) => {}),
  };
  (globalThis as any).eventTarget = eventTarget;

  callback(
    mockElement as any, // el
    {
      expression: `{
        report: true,
        trigger: {
          target: eventTarget,
        },
      }`,
    } as DirectiveData,
    {
      evaluate: mockEvaluate,
      cleanup: mockCleanup,
    } as unknown as DirectiveUtilities,
  );

  assertSpyCalls(mockElement.addEventListener, 0);
  assertSpyCalls(addEventListener, 1);
  assertSpyCalls(eventTarget.addEventListener, 1);
  assertExists(mockElement._x_validation);
  assert((mockElement._x_validation as any).report);
  assertEquals(
    (mockElement._x_validation as any).trigger.target,
    eventTarget,
  );

  mockCleanup.calls[1].args[0]();

  assertSpyCalls(mockElement.removeEventListener, 0);
  assertSpyCalls(removeEventListener, 1);
  assertSpyCalls(eventTarget.removeEventListener, 1);
  assertFalse("_x_validation" in mockElement);

  directiveSpy.restore();
  delete (globalThis as any).eventTarget;
});

Deno.test("validate-form directive - triggers validation event on success", () => {
  const Alpine = createAlpineMock();
  const directiveSpy = spy(Alpine, "directive");

  createValidatePluginDefault(Alpine);

  const callback = directiveSpy.calls[0].args[1] as Function;

  const mockElement = {
    addEventListener: spy((_event: string, _handler: any) => {}),
    removeEventListener: () => {},
    dispatchEvent: spy((_e: Event) => {}),
    elements: [],
    reportValidity: () => true,
    _x_validation: undefined,
  };

  const mockEvaluate = (_expr: any) => ({});
  const mockCleanup = spy((_fn: any) => {});

  callback(
    mockElement as any,
    { expression: "" } as DirectiveData,
    {
      evaluate: mockEvaluate,
      cleanup: mockCleanup,
    } as unknown as DirectiveUtilities,
  );

  mockElement.addEventListener.calls[0].args[1]();

  assertSpyCalls(mockElement.dispatchEvent, 1);

  assertStrictEquals(
    mockElement.dispatchEvent.calls[0].args[0].type,
    "x-validate:success",
  );

  mockCleanup.calls[0].args[0]();

  directiveSpy.restore();
});

Deno.test("validate-form directive - triggers validation event on failure", () => {
  const Alpine = createAlpineMock();
  const directiveSpy = spy(Alpine, "directive");

  createValidatePluginDefault(Alpine);

  const callback = directiveSpy.calls[0].args[1] as Function;

  const mockElement = {
    addEventListener: spy((_event: string, _handler: any) => {}),
    removeEventListener: () => {},
    dispatchEvent: spy((_e: Event) => {}),
    elements: [],
    reportValidity: () => false,
    _x_validation: undefined,
  };

  const mockEvaluate = (_expr: string) => eval(`(${_expr})`);
  const mockCleanup = spy((_fn: any) => {});

  const before = spy(() => {});
  const after = spy(() => {});
  (globalThis as any).before = before;
  (globalThis as any).after = after;
  callback(
    mockElement as any,
    {
      expression: `{
        trigger: {
          before: before,
          after: after
        }
      }`,
    } as DirectiveData,
    {
      evaluate: mockEvaluate,
      cleanup: mockCleanup,
    } as unknown as DirectiveUtilities,
  );

  const event = new CustomEvent("test");
  const preventDefault = spy(event, "preventDefault");
  mockElement.addEventListener.calls[0].args[1](event);

  assertSpyCalls(mockElement.dispatchEvent, 1);
  assertSpyCalls(preventDefault, 1);
  assertSpyCalls(before, 1);
  assertSpyCalls(after, 1);

  assertStrictEquals(
    mockElement.dispatchEvent.calls[0].args[0].type,
    "x-validate:failed",
  );

  mockCleanup.calls[0].args[0]();
  preventDefault.restore();
  directiveSpy.restore();

  delete (globalThis as any).before;
  delete (globalThis as any).after;
});

// validate

Deno.test("validate directive - initializes validation config and triggers success event", () => {
  const Alpine = createAlpineMock();
  const directiveSpy = spy(Alpine, "directive");

  createValidatePluginDefault(Alpine);

  const callback = directiveSpy.calls[1].args[1] as Function;

  const mockElement = {
    id: "testField",
    name: "test",
    tagName: "text",
    addEventListener: () => {},
    removeEventListener: () => {},
    setCustomValidity: () => {},
    dispatchEvent: spy((_e: Event) => {}),
    checkValidity: () => true,
    reportValidity: () => true,
    _x_validation: undefined,
  };

  assertThrows(
    () =>
      callback(
        {} as any,
        { expression: "" } as DirectiveData,
        {
          evaluate: (_expr: any) => ({}),
          cleanup: (_fn: any) => {},
        } as DirectiveUtilities,
      ),
    Error,
    "must have an id and name attribute",
  );

  const mockCleanUp = spy((_fn: any) => {});
  callback(
    mockElement as any,
    { expression: "" } as DirectiveData,
    {
      evaluate: (_expr: any) => ({}),
      cleanup: mockCleanUp,
    } as unknown as DirectiveUtilities,
  );

  assertExists(mockElement._x_validation);

  (mockElement._x_validation as any).validate();

  assertSpyCalls(mockElement.dispatchEvent, 1);
  assertStrictEquals(
    mockElement.dispatchEvent.calls[0].args[0].type,
    "x-validate:success",
  );

  mockCleanUp.calls[0].args[0]();

  assertFalse("_x_validation" in mockElement);

  directiveSpy.restore();
});

Deno.test("validate directive - initializes and triggers failure event", () => {
  const mockMessageResolver = createMockMessageResolver("resolved message");

  const Alpine = createAlpineMock();
  const directiveSpy = spy(Alpine, "directive");

  createValidatePlugin(
    {
      defaultFieldOptions: {
        onChange: true,
        onBlur: true,
        onInput: true,
      },
      defaultFunctionsOptions: {
        messageResolver: mockMessageResolver,
      },
    },
  )(Alpine);

  const callback = directiveSpy.calls[1].args[1] as Function;

  const mockElement = {
    id: "testField",
    name: "test",
    tagName: "text",
    addEventListener: spy((_t: string, _h: () => void) => {}),
    removeEventListener: spy((_t: string, _h: () => void) => {}),
    setCustomValidity: () => {},
    dispatchEvent: spy((_e: Event) => {}),
    checkValidity: () => false,
    reportValidity: () => false,
    validity: {
      valueMissing: "",
      typeMismatch: "",
      patternMismatch: "",
      tooLong: "",
      tooShort: "",
      rangeUnderflow: "",
      rangeOverflow: "",
      stepMismatch: "",
      badInput: "",
    },
    _x_validation: undefined,
  };

  assertThrows(
    () =>
      callback(
        {} as any,
        { expression: "" } as DirectiveData,
        {
          evaluate: (_expr: any) => ({}),
          cleanup: (_fn: any) => {},
        } as DirectiveUtilities,
      ),
    Error,
    "must have an id and name attribute",
  );

  const mockCleanUp = spy((_fn: any) => {});
  callback(
    mockElement as any,
    { expression: "" } as DirectiveData,
    {
      evaluate: (_expr: any) => ({}),
      cleanup: mockCleanUp,
    } as unknown as DirectiveUtilities,
  );

  assertExists(mockElement._x_validation);
  assertSpyCalls(mockElement.addEventListener, 3);

  (mockElement._x_validation as any).validate();

  assertSpyCalls(mockElement.dispatchEvent, 1);
  assertStrictEquals(
    mockElement.dispatchEvent.calls[0].args[0].type,
    "x-validate:failed",
  );

  mockCleanUp.calls[0].args[0]();

  assertFalse("_x_validation" in mockElement);
  assertSpyCalls(mockElement.removeEventListener, 3);

  directiveSpy.restore();
});

Deno.test("validate directive - executes before/after hooks on failure", async () => {
  const mockMessageResolver = createMockMessageResolver("");

  const Alpine = createAlpineMock();
  const directiveSpy = spy(Alpine, "directive");

  createValidatePlugin(
    {
      defaultFieldOptions: {
        onChange: true,
        onBlur: true,
        onInput: true,
      },
      defaultFunctionsOptions: {
        messageResolver: mockMessageResolver,
      },
    },
  )(Alpine);

  const callback = directiveSpy.calls[1].args[1] as Function;

  const mockElement = {
    id: "testField",
    name: "test",
    tagName: "text",
    addEventListener: spy((_t: string, _h: () => void) => {}),
    removeEventListener: spy((_t: string, _h: () => void) => {}),
    setCustomValidity: () => {},
    dispatchEvent: spy((_e: Event) => {}),
    checkValidity: () => false,
    reportValidity: () => false,
    validity: {
      valueMissing: "",
      typeMismatch: "",
      patternMismatch: "",
      tooLong: "",
      tooShort: "",
      rangeUnderflow: "",
      rangeOverflow: "",
      stepMismatch: "",
      badInput: "",
    },
    form: {
      _x_validation: {
        report: false,
      },
    },
    _x_validation: undefined,
  };

  const mockCleanUp = spy((_fn: any) => {});

  (globalThis as any).before = spy(() => {});
  (globalThis as any).after = spy(() => {});
  callback(
    mockElement as any,
    {
      expression: `
      {
        onChange: {
          before: before,
          after: after,
        },
        onBlur: {
          before: before,
          after: after,
        },
        onInput: {
          before: before,
          after: after,
        },
        inputLimit: "debounce",
      }
      `,
    } as DirectiveData,
    {
      evaluate: (_expr: string) => (eval(`(${_expr})`)),
      cleanup: mockCleanUp,
    } as unknown as DirectiveUtilities,
  );

  assertExists(mockElement._x_validation);
  assertSpyCalls(mockElement.addEventListener, 3);

  assertStrictEquals(mockElement.addEventListener.calls[0].args[0], "change");
  mockElement.addEventListener.calls[0].args[1]();
  assertSpyCalls((globalThis as any).before, 1);
  assertSpyCalls((globalThis as any).after, 1);
  assertSpyCalls(mockElement.dispatchEvent, 1);
  assertStrictEquals(
    mockElement.dispatchEvent.calls[0].args[0].type,
    "x-validate:failed",
  );

  assertStrictEquals(mockElement.addEventListener.calls[1].args[0], "blur");
  mockElement.addEventListener.calls[1].args[1]();
  assertSpyCalls((globalThis as any).before, 2);
  assertSpyCalls((globalThis as any).after, 2);
  assertSpyCalls(mockElement.dispatchEvent, 2);
  assertStrictEquals(
    mockElement.dispatchEvent.calls[1].args[0].type,
    "x-validate:failed",
  );

  assertStrictEquals(mockElement.addEventListener.calls[2].args[0], "input");
  mockElement.addEventListener.calls[2].args[1]();
  await new Promise((resolve) => setTimeout(resolve, 500));
  assertSpyCalls((globalThis as any).before, 3);
  assertSpyCalls((globalThis as any).after, 3);
  assertSpyCalls(mockElement.dispatchEvent, 3);
  assertStrictEquals(
    mockElement.dispatchEvent.calls[2].args[0].type,
    "x-validate:failed",
  );

  (mockElement._x_validation as any).formSubmit = true;
  (mockElement._x_validation as any).validate();

  assertSpyCalls(mockElement.dispatchEvent, 4);
  assertStrictEquals(
    mockElement.dispatchEvent.calls[3].args[0].type,
    "x-validate:failed",
  );

  mockCleanUp.calls[0].args[0]();

  assertFalse("_x_validation" in mockElement);
  assertSpyCalls(mockElement.removeEventListener, 3);

  delete (globalThis as any).before;
  delete (globalThis as any).after;

  directiveSpy.restore();
});

Deno.test("validate directive - no event listeners on all false config", () => {
  const mockMessageResolver = createMockMessageResolver("Error");

  const Alpine = createAlpineMock();
  const directiveSpy = spy(Alpine, "directive");

  createValidatePlugin(
    {
      defaultFieldOptions: {
        report: false,
        onChange: false,
        onBlur: false,
        onInput: false,
      },
      defaultFunctionsOptions: {
        messageResolver: mockMessageResolver,
      },
    },
  )(Alpine);

  const callback = directiveSpy.calls[1].args[1] as Function;

  const mockElement = {
    id: "testField",
    name: "test",
    tagName: "text",
    addEventListener: spy((_t: string, _h: () => void) => {}),
    removeEventListener: spy((_t: string, _h: () => void) => {}),
    setCustomValidity: () => {},
    dispatchEvent: spy((_e: Event) => {}),
    checkValidity: () => false,
    reportValidity: spy(() => false),
    validity: {
      valueMissing: "",
      typeMismatch: "",
      patternMismatch: "",
      tooLong: "",
      tooShort: "",
      rangeUnderflow: "",
      rangeOverflow: "",
      stepMismatch: "",
      badInput: "",
    },
    _x_validation: undefined,
  };

  const mockCleanUp = spy((_fn: any) => {});

  callback(
    mockElement as any,
    {
      expression: "",
    } as DirectiveData,
    {
      evaluate: (_expr: string) => (eval(`(${_expr})`)),
      cleanup: mockCleanUp,
    } as unknown as DirectiveUtilities,
  );

  assertSpyCalls(mockElement.addEventListener, 1);
  assertStrictEquals(mockElement.addEventListener.calls[0].args[0], "change");

  (mockElement._x_validation as any).formSubmit = true;
  mockElement.addEventListener.calls[0].args[1]();

  assertSpyCalls(mockElement.reportValidity, 0);

  mockCleanUp.calls[0].args[0]();

  directiveSpy.restore();
});

Deno.test("validate directive - calls reportValidity on failure with report option", () => {
  const mockMessageResolver = createMockMessageResolver("Error");

  const Alpine = createAlpineMock();
  const directiveSpy = spy(Alpine, "directive");

  createValidatePlugin(
    {
      defaultFieldOptions: {
        report: true,
      },
      defaultFunctionsOptions: {
        messageResolver: mockMessageResolver,
      },
    },
  )(Alpine);

  const callback = directiveSpy.calls[1].args[1] as Function;

  const mockElement = {
    id: "testField",
    name: "test",
    tagName: "text",
    addEventListener: spy((_t: string, _h: () => void) => {}),
    removeEventListener: spy((_t: string, _h: () => void) => {}),
    setCustomValidity: () => {},
    dispatchEvent: spy((_e: Event) => {}),
    checkValidity: () => false,
    reportValidity: spy(() => false),
    validity: {
      valueMissing: "",
      typeMismatch: "",
      patternMismatch: "",
      tooLong: "",
      tooShort: "",
      rangeUnderflow: "",
      rangeOverflow: "",
      stepMismatch: "",
      badInput: "",
    },
    _x_validation: undefined,
  };

  const mockCleanUp = spy((_fn: any) => {});

  callback(
    mockElement as any,
    {
      expression: "",
    } as DirectiveData,
    {
      evaluate: (_expr: string) => (eval(`(${_expr})`)),
      cleanup: mockCleanUp,
    } as unknown as DirectiveUtilities,
  );

  assertSpyCalls(mockElement.addEventListener, 1);
  assertStrictEquals(mockElement.addEventListener.calls[0].args[0], "change");

  assertSpyCalls(mockElement.reportValidity, 0);

  (mockElement._x_validation as any).formSubmit = true;
  mockElement.addEventListener.calls[0].args[1]();

  assertSpyCalls(mockElement.reportValidity, 2);

  mockCleanUp.calls[0].args[0]();

  directiveSpy.restore();
});

Deno.test("validate directive - registers event listeners for checkboxes and radios", () => {
  const Alpine = createAlpineMock();
  const directiveSpy = spy(Alpine, "directive");

  createValidatePluginDefault(Alpine);

  const callback = directiveSpy.calls[1].args[1] as Function;

  const jsdom = new JSDOM(
    `<!DOCTYPE html>
    <html lang="ja">
      <head>
        <title>test</title>
      </head>
      <body>
        <form>
          <input id="text-1" type="text" name="checkbox-1" />
          <input id="checkbox-1" type="checkbox" name="checkbox-1" />
          <input id="checkbox-2" type="checkbox" name="checkbox-1" />
          <input id="checkbox-3" type="checkbox" name="other-1" />
          <input id="checkbox-4" type="checkbox" name="checkbox-1" x-validate />
          <input id="text-2" type="text" name="radio-1" />
          <input id="radio-1" type="radio" name="radio-1" />
          <input id="radio-2" type="radio" name="radio-1" />
          <input id="radio-3" type="radio" name="other-1" />
          <input id="radio-4" type="radio" name="radio-1" x-validate />
        </form>
      </body>
    </html>`,
  );

  const CustomEventBk = (globalThis as any).CustomEvent;
  (globalThis as any).CustomEvent = jsdom.window.CustomEvent;

  const text1 = jsdom.window.document.getElementById("text-1") as HTMLElement;
  const text2 = jsdom.window.document.getElementById("text-2") as HTMLElement;
  const checkbox1 = jsdom.window.document.getElementById(
    "checkbox-1",
  ) as HTMLElement;
  const checkbox2 = jsdom.window.document.getElementById(
    "checkbox-2",
  ) as HTMLElement;
  const checkbox3 = jsdom.window.document.getElementById(
    "checkbox-3",
  ) as HTMLElement;
  const checkbox4 = jsdom.window.document.getElementById(
    "checkbox-4",
  ) as HTMLElement;
  const radio1 = jsdom.window.document.getElementById("radio-1") as HTMLElement;
  const radio2 = jsdom.window.document.getElementById("radio-2") as HTMLElement;
  const radio3 = jsdom.window.document.getElementById("radio-3") as HTMLElement;
  const radio4 = jsdom.window.document.getElementById("radio-4") as HTMLElement;

  const text1addEventListener = spy(text1, "addEventListener");
  const text1removeEventListener = spy(text1, "removeEventListener");

  const text2addEventListener = spy(text2, "addEventListener");
  const text2removeEventListener = spy(text2, "removeEventListener");

  const checkbox1addEventListener = spy(checkbox1, "addEventListener");
  const checkbox1removeEventListener = spy(checkbox1, "removeEventListener");

  const checkbox2addEventListener = spy(checkbox2, "addEventListener");
  const checkbox2removeEventListener = spy(checkbox2, "removeEventListener");

  const checkbox3addEventListener = spy(checkbox3, "addEventListener");
  const checkbox3removeEventListener = spy(checkbox3, "removeEventListener");

  const checkbox4addEventListener = spy(checkbox4, "addEventListener");
  const checkbox4removeEventListener = spy(checkbox4, "removeEventListener");

  const radio1addEventListener = spy(radio1, "addEventListener");
  const radio1removeEventListener = spy(radio1, "removeEventListener");

  const radio2addEventListener = spy(radio2, "addEventListener");
  const radio2removeEventListener = spy(radio2, "removeEventListener");

  const radio3addEventListener = spy(radio3, "addEventListener");
  const radio3removeEventListener = spy(radio3, "removeEventListener");

  const radio4addEventListener = spy(radio4, "addEventListener");
  const radio4removeEventListener = spy(radio4, "removeEventListener");

  const cleanup1 = spy((_fn: any) => {});
  callback(
    checkbox1 as any,
    { expression: "" } as DirectiveData,
    {
      evaluate: (_expr: any) => ({}),
      cleanup: cleanup1,
    } as unknown as DirectiveUtilities,
  );

  const cleanup2 = spy((_fn: any) => {});
  callback(
    radio1 as any,
    { expression: "" } as DirectiveData,
    {
      evaluate: (_expr: any) => ({}),
      cleanup: cleanup2,
    } as unknown as DirectiveUtilities,
  );

  assertExists((checkbox1 as any)._x_validation);
  assertExists((radio1 as any)._x_validation);

  assertSpyCalls(text1addEventListener, 0);
  assertSpyCalls(text1removeEventListener, 0);

  assertSpyCalls(text2addEventListener, 0);
  assertSpyCalls(text2removeEventListener, 0);

  assertSpyCalls(checkbox1addEventListener, 1);
  assertSpyCalls(checkbox1removeEventListener, 0);

  assertSpyCalls(checkbox2addEventListener, 0);
  assertSpyCalls(checkbox2removeEventListener, 0);

  assertSpyCalls(checkbox3addEventListener, 0);
  assertSpyCalls(checkbox3removeEventListener, 0);

  assertSpyCalls(checkbox4addEventListener, 0);
  assertSpyCalls(checkbox4removeEventListener, 0);

  assertSpyCalls(radio1addEventListener, 1);
  assertSpyCalls(radio1removeEventListener, 0);

  assertSpyCalls(radio2addEventListener, 0);
  assertSpyCalls(radio2removeEventListener, 0);

  assertSpyCalls(radio3addEventListener, 0);
  assertSpyCalls(radio3removeEventListener, 0);

  assertSpyCalls(radio4addEventListener, 0);
  assertSpyCalls(radio4removeEventListener, 0);

  (checkbox1 as any)._x_validation.validate();
  (radio1 as any)._x_validation.validate();

  assertSpyCalls(text1addEventListener, 0);
  assertSpyCalls(text1removeEventListener, 0);

  assertSpyCalls(text2addEventListener, 0);
  assertSpyCalls(text2removeEventListener, 0);

  assertSpyCalls(checkbox1addEventListener, 1);
  assertSpyCalls(checkbox1removeEventListener, 0);

  assertSpyCalls(checkbox2addEventListener, 1);
  assertSpyCalls(checkbox2removeEventListener, 0);

  assertSpyCalls(checkbox3addEventListener, 0);
  assertSpyCalls(checkbox3removeEventListener, 0);

  assertSpyCalls(checkbox4addEventListener, 0);
  assertSpyCalls(checkbox4removeEventListener, 0);

  assertSpyCalls(radio1addEventListener, 1);
  assertSpyCalls(radio1removeEventListener, 0);

  assertSpyCalls(radio2addEventListener, 1);
  assertSpyCalls(radio2removeEventListener, 0);

  assertSpyCalls(radio3addEventListener, 0);
  assertSpyCalls(radio3removeEventListener, 0);

  assertSpyCalls(radio4addEventListener, 0);
  assertSpyCalls(radio4removeEventListener, 0);

  cleanup1.calls[0].args[0]();
  cleanup2.calls[0].args[0]();
  assertFalse("_x_validation" in checkbox1);
  assertFalse("_x_validation" in radio2);

  assertSpyCalls(text1addEventListener, 0);
  assertSpyCalls(text1removeEventListener, 0);

  assertSpyCalls(text2addEventListener, 0);
  assertSpyCalls(text2removeEventListener, 0);

  assertSpyCalls(checkbox1addEventListener, 1);
  assertSpyCalls(checkbox1removeEventListener, 1);

  assertSpyCalls(checkbox2addEventListener, 1);
  assertSpyCalls(checkbox2removeEventListener, 1);

  assertSpyCalls(checkbox3addEventListener, 0);
  assertSpyCalls(checkbox3removeEventListener, 0);

  assertSpyCalls(checkbox4addEventListener, 0);
  assertSpyCalls(checkbox4removeEventListener, 0);

  assertSpyCalls(radio1addEventListener, 1);
  assertSpyCalls(radio1removeEventListener, 1);

  assertSpyCalls(radio2addEventListener, 1);
  assertSpyCalls(radio2removeEventListener, 1);

  assertSpyCalls(radio3addEventListener, 0);
  assertSpyCalls(radio3removeEventListener, 0);

  assertSpyCalls(radio4addEventListener, 0);
  assertSpyCalls(radio4removeEventListener, 0);

  (globalThis as any).CustomEvent = CustomEventBk;

  directiveSpy.restore();
});

Deno.test("validate directive - Handles listeners for standalone checkboxes and radios without a form", () => {
  const Alpine = createAlpineMock();
  const directiveSpy = spy(Alpine, "directive");

  createValidatePlugin({
    defaultFunctionsOptions: {
      fieldValueResolver: {
        resolve: (_el) => "",
        isEmpty: (_value) => true,
      },
    },
  })(Alpine);

  const callback = directiveSpy.calls[1].args[1] as Function;

  const jsdom = new JSDOM(
    `<!DOCTYPE html>
    <html lang="ja">
      <head>
        <title>test</title>
      </head>
      <body>
        <input id="checkbox-1" type="checkbox" name="checkbox-1" />
        <input id="radio-1" type="radio" name="radio-1" />
      </body>
    </html>`,
  );

  const CustomEventBk = (globalThis as any).CustomEvent;
  (globalThis as any).CustomEvent = jsdom.window.CustomEvent;

  const checkbox1 = jsdom.window.document.getElementById(
    "checkbox-1",
  ) as HTMLElement;
  const radio1 = jsdom.window.document.getElementById("radio-1") as HTMLElement;

  const checkbox1addEventListener = spy(checkbox1, "addEventListener");
  const checkbox1removeEventListener = spy(checkbox1, "removeEventListener");

  const radio1addEventListener = spy(radio1, "addEventListener");
  const radio1removeEventListener = spy(radio1, "removeEventListener");

  const cleanup1 = spy((_fn: any) => {});
  callback(
    checkbox1 as any,
    { expression: "" } as DirectiveData,
    {
      evaluate: (_expr: any) => ({}),
      cleanup: cleanup1,
    } as unknown as DirectiveUtilities,
  );

  const cleanup2 = spy((_fn: any) => {});
  callback(
    radio1 as any,
    { expression: "" } as DirectiveData,
    {
      evaluate: (_expr: any) => ({}),
      cleanup: cleanup2,
    } as unknown as DirectiveUtilities,
  );

  assertExists((checkbox1 as any)._x_validation);
  assertExists((radio1 as any)._x_validation);

  assertSpyCalls(radio1addEventListener, 1);
  assertSpyCalls(radio1removeEventListener, 0);

  (checkbox1 as any)._x_validation.validate();
  (radio1 as any)._x_validation.validate();

  assertSpyCalls(checkbox1addEventListener, 1);
  assertSpyCalls(checkbox1removeEventListener, 0);
  assertSpyCalls(radio1addEventListener, 1);
  assertSpyCalls(radio1removeEventListener, 0);

  cleanup1.calls[0].args[0]();
  cleanup2.calls[0].args[0]();
  assertFalse("_x_validation" in checkbox1);
  assertSpyCalls(checkbox1addEventListener, 1);
  assertSpyCalls(checkbox1removeEventListener, 1);

  assertSpyCalls(radio1addEventListener, 1);
  assertSpyCalls(radio1removeEventListener, 1);

  (globalThis as any).CustomEvent = CustomEventBk;

  directiveSpy.restore();
});

// validate-message-for

Deno.test("validate-message-for directive - shows validation message", () => {
  const Alpine = createAlpineMock();
  const directiveSpy = spy(Alpine, "directive");

  createValidatePlugin({
    defaultFunctionsOptions: {
      messageStore: {
        get: (_el: any) => {
          return "Error message";
        },
      } as unknown as MessageStore,
    },
  })(Alpine);

  const callback = directiveSpy.calls[2].args[1] as Function;

  const mockElement = {
    textContent: "",
  };

  globalThis.document = {
    querySelector: (
      _expression: string,
    ) => (_expression === "#testField" ? {} : null),
  } as Document;

  callback(
    mockElement as any,
    { expression: "#testField" } as DirectiveData,
    { effect: (fn: Function) => fn() } as unknown as DirectiveUtilities,
  );

  assertStrictEquals(mockElement.textContent, "Error message");

  callback(
    mockElement as any,
    { expression: "#notFound" } as DirectiveData,
    { effect: (fn: Function) => fn() } as unknown as DirectiveUtilities,
  );

  assertStrictEquals(mockElement.textContent, "");

  delete (globalThis as any).document;
  directiveSpy.restore();
});
