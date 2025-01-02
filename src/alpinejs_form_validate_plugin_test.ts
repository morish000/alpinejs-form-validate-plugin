import type { Alpine, DirectiveData, DirectiveUtilities } from "alpinejs";
import type { MessageStore } from "./types/functions_types";
import { JSDOM } from "jsdom";
import { spy } from "sinon";
import { formDefaultConfig } from "./config/default_config";
import {
  createValidatePlugin,
  createValidatePluginDefault,
} from "./alpinejs_form_validate_plugin";

const createAlpineMock = () => ({
  directive: (_name: string, _callback: Function) => { },
  prefixed: (str: string) => `x-${str}`,
  reactive: (o: object) => o,
  mutateDom: (f: () => void) => f(),
} as unknown as Alpine);

const createMockMessageResolver = (message: string) => ({
  addUpdateListener: () => { },
  removeUpdateListener: () => { },
  resolve: (..._args: any[]) => {
    return message;
  },
});

test("createValidatePlugin - registers three directives", () => {
  const Alpine = createAlpineMock();
  const directiveSpy = spy(Alpine, "directive");

  createValidatePluginDefault(Alpine);

  expect(directiveSpy.callCount).toBe(3);
  directiveSpy.restore();
});

// validate-form

test("validate-form directive - sets initial validation configuration", () => {
  const Alpine = createAlpineMock();
  const directiveSpy = spy(Alpine, "directive");

  createValidatePluginDefault(Alpine);

  const callback = directiveSpy.getCall(0).args[1] as Function;

  const mockElement = {
    addEventListener: spy((_event: string, _handler: any) => { }),
    removeEventListener: spy(() => { }),
    _x_validation: undefined,
  };

  const mockEvaluate = (_expr: string) => (eval(`(${_expr})`));
  const mockCleanup = spy((_fn: any) => { });

  callback(
    mockElement as any, // el
    { expression: "" } as DirectiveData,
    {
      evaluate: mockEvaluate,
      cleanup: mockCleanup,
    } as unknown as DirectiveUtilities,
  );

  expect(mockElement.addEventListener.callCount).toBe(1);
  expect(mockElement._x_validation).toBeDefined();
  expect(
    mockElement._x_validation).toEqual(
      formDefaultConfig(mockElement as unknown as EventTarget),
    );

  mockCleanup.getCall(0).args[0]();

  expect(mockElement.removeEventListener.callCount).toBe(1);
  expect("_x_validation" in mockElement).toBe(false);

  directiveSpy.restore();
});

test("validate-form directive - overrides default configuration", () => {
  const Alpine = createAlpineMock();
  const directiveSpy = spy(Alpine, "directive");

  const addEventListener = spy((_e: string, _h: () => void) => { });
  const removeEventListener = spy((_e: string, _h: () => void) => { });
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

  const callback = directiveSpy.getCall(0).args[1] as Function;

  const mockElement = {
    addEventListener: spy((_event: string, _handler: any) => { }),
    removeEventListener: spy(() => { }),
    _x_validation: undefined,
  };

  const mockEvaluate = (_expr: string) => eval(`(${_expr})`);
  const mockCleanup = spy((_fn: any) => { });

  callback(
    mockElement as any, // el
    { expression: "" } as DirectiveData,
    {
      evaluate: mockEvaluate,
      cleanup: mockCleanup,
    } as unknown as DirectiveUtilities,
  );

  expect(mockElement.addEventListener.callCount).toBe(0);
  expect(addEventListener.callCount).toBe(1);
  expect(mockElement._x_validation).toBeDefined();
  expect((mockElement._x_validation as any).report).toBe(false);
  expect(
    (mockElement._x_validation as any).trigger.target).toEqual(
      { addEventListener, removeEventListener }
    );

  mockCleanup.getCall(0).args[0]();

  expect(mockElement.removeEventListener.callCount).toBe(0);
  expect(removeEventListener.callCount).toBe(1);
  expect("_x_validation" in mockElement).toBe(false);

  // overwite form element

  const eventTarget = {
    addEventListener: spy((_e: string, _h: () => void) => { }),
    removeEventListener: spy((_e: string, _h: () => void) => { }),
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

  expect(mockElement.addEventListener.callCount).toBe(0);
  expect(addEventListener.callCount).toBe(1);
  expect(eventTarget.addEventListener.callCount).toBe(1);
  expect(mockElement._x_validation).toBeDefined();
  expect((mockElement._x_validation as any).report);
  expect(
    (mockElement._x_validation as any).trigger.target).toEqual(
      eventTarget,
    );

  mockCleanup.getCall(1).args[0]();

  expect(mockElement.removeEventListener.callCount).toBe(0);
  expect(removeEventListener.callCount).toBe(1);
  expect(eventTarget.removeEventListener.callCount).toBe(1);
  expect("_x_validation" in mockElement).toBe(false);

  directiveSpy.restore();
  delete (globalThis as any).eventTarget;
});

test("validate-form directive - triggers validation event on success", () => {
  const Alpine = createAlpineMock();
  const directiveSpy = spy(Alpine, "directive");

  createValidatePluginDefault(Alpine);

  const callback = directiveSpy.getCall(0).args[1] as Function;

  const mockElement = {
    addEventListener: spy((_event: string, _handler: any) => { }),
    removeEventListener: () => { },
    dispatchEvent: spy((_e: Event) => { }),
    elements: [],
    reportValidity: () => true,
    _x_validation: undefined,
  };

  const mockEvaluate = (_expr: any) => ({});
  const mockCleanup = spy((_fn: any) => { });

  callback(
    mockElement as any,
    { expression: "" } as DirectiveData,
    {
      evaluate: mockEvaluate,
      cleanup: mockCleanup,
    } as unknown as DirectiveUtilities,
  );

  mockElement.addEventListener.getCall(0).args[1]();

  expect(mockElement.dispatchEvent.callCount).toBe(1);

  expect(
    mockElement.dispatchEvent.getCall(0).args[0].type).toBe(
      "x-validate:success",
    );

  mockCleanup.getCall(0).args[0]();

  directiveSpy.restore();
});

test("validate-form directive - triggers validation event on failure", () => {
  const Alpine = createAlpineMock();
  const directiveSpy = spy(Alpine, "directive");

  createValidatePluginDefault(Alpine);

  const callback = directiveSpy.getCall(0).args[1] as Function;

  const mockElement = {
    addEventListener: spy((_event: string, _handler: any) => { }),
    removeEventListener: () => { },
    dispatchEvent: spy((_e: Event) => { }),
    elements: [],
    reportValidity: () => false,
    _x_validation: undefined,
  };

  const mockEvaluate = (_expr: string) => eval(`(${_expr})`);
  const mockCleanup = spy((_fn: any) => { });

  const before = spy(() => { });
  const after = spy(() => { });
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
  mockElement.addEventListener.getCall(0).args[1](event);

  expect(mockElement.dispatchEvent.callCount).toBe(1);
  expect(preventDefault.callCount).toBe(1);
  expect(before.callCount).toBe(1);
  expect(after.callCount).toBe(1);

  expect(
    mockElement.dispatchEvent.getCall(0).args[0].type).toBe(
      "x-validate:failed",
    );

  mockCleanup.getCall(0).args[0]();
  preventDefault.restore();
  directiveSpy.restore();

  delete (globalThis as any).before;
  delete (globalThis as any).after;
});

// validate

test("validate directive - initializes validation config and triggers success event", () => {
  const Alpine = createAlpineMock();
  const directiveSpy = spy(Alpine, "directive");

  createValidatePluginDefault(Alpine);

  const callback = directiveSpy.getCall(1).args[1] as Function;

  const mockElement = {
    id: "testField",
    name: "test",
    tagName: "text",
    addEventListener: () => { },
    removeEventListener: () => { },
    setCustomValidity: () => { },
    dispatchEvent: spy((_e: Event) => { }),
    checkValidity: () => true,
    reportValidity: () => true,
    _x_validation: undefined,
  };

  expect(
    () =>
      callback(
        {} as any,
        { expression: "" } as DirectiveData,
        {
          evaluate: (_expr: any) => ({}),
          cleanup: (_fn: any) => { },
        } as DirectiveUtilities,
      )).toThrow(
        "must have an id and name attribute",
      );

  const mockCleanUp = spy((_fn: any) => { });
  callback(
    mockElement as any,
    { expression: "" } as DirectiveData,
    {
      evaluate: (_expr: any) => ({}),
      cleanup: mockCleanUp,
    } as unknown as DirectiveUtilities,
  );

  expect(mockElement._x_validation).toBeDefined();

  (mockElement._x_validation as any).validate();

  expect(mockElement.dispatchEvent.callCount).toBe(1);
  expect(
    mockElement.dispatchEvent.getCall(0).args[0].type).toBe(
      "x-validate:success",
    );

  mockCleanUp.getCall(0).args[0]();

  expect("_x_validation" in mockElement).toBe(false);

  directiveSpy.restore();
});

test("validate directive - initializes and triggers failure event", () => {
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

  const callback = directiveSpy.getCall(1).args[1] as Function;

  const mockElement = {
    id: "testField",
    name: "test",
    tagName: "text",
    addEventListener: spy((_t: string, _h: () => void) => { }),
    removeEventListener: spy((_t: string, _h: () => void) => { }),
    setCustomValidity: () => { },
    dispatchEvent: spy((_e: Event) => { }),
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

  expect(
    () =>
      callback(
        {} as any,
        { expression: "" } as DirectiveData,
        {
          evaluate: (_expr: any) => ({}),
          cleanup: (_fn: any) => { },
        } as DirectiveUtilities,
      )).toThrow(
        "must have an id and name attribute",
      );

  const mockCleanUp = spy((_fn: any) => { });
  callback(
    mockElement as any,
    { expression: "" } as DirectiveData,
    {
      evaluate: (_expr: any) => ({}),
      cleanup: mockCleanUp,
    } as unknown as DirectiveUtilities,
  );

  expect(mockElement._x_validation).toBeDefined();
  expect(mockElement.addEventListener.callCount).toBe(3);

  (mockElement._x_validation as any).validate();

  expect(mockElement.dispatchEvent.callCount).toBe(1);
  expect(
    mockElement.dispatchEvent.getCall(0).args[0].type).toBe(
      "x-validate:failed",
    );

  mockCleanUp.getCall(0).args[0]();

  expect("_x_validation" in mockElement).toBe(false);
  expect(mockElement.removeEventListener.callCount).toBe(3);

  directiveSpy.restore();
});

test("validate directive - executes before/after hooks on failure", async () => {
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

  const callback = directiveSpy.getCall(1).args[1] as Function;

  const mockElement = {
    id: "testField",
    name: "test",
    tagName: "text",
    addEventListener: spy((_t: string, _h: () => void) => { }),
    removeEventListener: spy((_t: string, _h: () => void) => { }),
    setCustomValidity: () => { },
    dispatchEvent: spy((_e: Event) => { }),
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

  const mockCleanUp = spy((_fn: any) => { });

  (globalThis as any).before = spy(() => { });
  (globalThis as any).after = spy(() => { });
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

  expect(mockElement._x_validation).toBeDefined();
  expect(mockElement.addEventListener.callCount).toBe(3);

  expect(mockElement.addEventListener.getCall(0).args[0]).toBe("change");
  mockElement.addEventListener.getCall(0).args[1]();
  expect((globalThis as any).before.callCount).toBe(1);
  expect((globalThis as any).after.callCount).toBe(1);
  expect(mockElement.dispatchEvent.callCount).toBe(1);
  expect(
    mockElement.dispatchEvent.getCall(0).args[0].type).toBe(
      "x-validate:failed",
    );

  expect(mockElement.addEventListener.getCall(1).args[0]).toBe("blur");
  mockElement.addEventListener.getCall(1).args[1]();
  expect((globalThis as any).before.callCount).toBe(2);
  expect((globalThis as any).after.callCount).toBe(2);
  expect(mockElement.dispatchEvent.callCount).toBe(2);
  expect(
    mockElement.dispatchEvent.getCall(1).args[0].type).toBe(
      "x-validate:failed",
    );

  expect(mockElement.addEventListener.getCall(2).args[0]).toBe("input");
  mockElement.addEventListener.getCall(2).args[1]();
  await new Promise((resolve) => setTimeout(resolve, 500));
  expect((globalThis as any).before.callCount).toBe(3);
  expect((globalThis as any).after.callCount).toBe(3);
  expect(mockElement.dispatchEvent.callCount).toBe(3);
  expect(
    mockElement.dispatchEvent.getCall(2).args[0].type).toBe(
      "x-validate:failed",
    );

  (mockElement._x_validation as any).formSubmit = true;
  (mockElement._x_validation as any).validate();

  expect(mockElement.dispatchEvent.callCount).toBe(4);
  expect(
    mockElement.dispatchEvent.getCall(3).args[0].type).toBe(
      "x-validate:failed",
    );

  mockCleanUp.getCall(0).args[0]();

  expect("_x_validation" in mockElement).toBe(false);
  expect(mockElement.removeEventListener.callCount).toBe(3);

  delete (globalThis as any).before;
  delete (globalThis as any).after;

  directiveSpy.restore();
});

test("validate directive - no event listeners on all false config", () => {
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

  const callback = directiveSpy.getCall(1).args[1] as Function;

  const mockElement = {
    id: "testField",
    name: "test",
    tagName: "text",
    addEventListener: spy((_t: string, _h: () => void) => { }),
    removeEventListener: spy((_t: string, _h: () => void) => { }),
    setCustomValidity: () => { },
    dispatchEvent: spy((_e: Event) => { }),
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

  const mockCleanUp = spy((_fn: any) => { });

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

  expect(mockElement.addEventListener.callCount).toBe(1);
  expect(mockElement.addEventListener.getCall(0).args[0]).toBe("change");

  (mockElement._x_validation as any).formSubmit = true;
  mockElement.addEventListener.getCall(0).args[1]();

  expect(mockElement.reportValidity.callCount).toBe(0);

  mockCleanUp.getCall(0).args[0]();

  directiveSpy.restore();
});

test("validate directive - calls reportValidity on failure with report option", () => {
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

  const callback = directiveSpy.getCall(1).args[1] as Function;

  const mockElement = {
    id: "testField",
    name: "test",
    tagName: "text",
    addEventListener: spy((_t: string, _h: () => void) => { }),
    removeEventListener: spy((_t: string, _h: () => void) => { }),
    setCustomValidity: () => { },
    dispatchEvent: spy((_e: Event) => { }),
    checkValidity: spy(() => false),
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

  const mockCleanUp = spy((_fn: any) => { });

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

  expect(mockElement.addEventListener.callCount).toBe(1);
  expect(mockElement.addEventListener.getCall(0).args[0]).toBe("change");

  expect(mockElement.reportValidity.callCount).toBe(0);
  expect(mockElement.checkValidity.callCount).toBe(0);

  (mockElement._x_validation as any).formSubmit = true;
  mockElement.addEventListener.getCall(0).args[1]();

  expect(mockElement.reportValidity.callCount).toBe(1);
  expect(mockElement.checkValidity.callCount).toBe(2);

  mockCleanUp.getCall(0).args[0]();

  directiveSpy.restore();
});

test("validate directive - registers event listeners for checkboxes and radios", () => {
  const Alpine = createAlpineMock();
  const directiveSpy = spy(Alpine, "directive");

  createValidatePluginDefault(Alpine);

  const callback = directiveSpy.getCall(1).args[1] as Function;

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

  const cleanup1 = spy((_fn: any) => { });
  callback(
    checkbox1 as any,
    { expression: "" } as DirectiveData,
    {
      evaluate: (_expr: any) => ({}),
      cleanup: cleanup1,
    } as unknown as DirectiveUtilities,
  );

  const cleanup2 = spy((_fn: any) => { });
  callback(
    radio1 as any,
    { expression: "" } as DirectiveData,
    {
      evaluate: (_expr: any) => ({}),
      cleanup: cleanup2,
    } as unknown as DirectiveUtilities,
  );

  expect((checkbox1 as any)._x_validation).toBeDefined();
  expect((radio1 as any)._x_validation).toBeDefined();

  expect(text1addEventListener.callCount).toBe(0);
  expect(text1removeEventListener.callCount).toBe(0);

  expect(text2addEventListener.callCount).toBe(0);
  expect(text2removeEventListener.callCount).toBe(0);

  expect(checkbox1addEventListener.callCount).toBe(1);
  expect(checkbox1removeEventListener.callCount).toBe(0);

  expect(checkbox2addEventListener.callCount).toBe(0);
  expect(checkbox2removeEventListener.callCount).toBe(0);

  expect(checkbox3addEventListener.callCount).toBe(0);
  expect(checkbox3removeEventListener.callCount).toBe(0);

  expect(checkbox4addEventListener.callCount).toBe(0);
  expect(checkbox4removeEventListener.callCount).toBe(0);

  expect(radio1addEventListener.callCount).toBe(1);
  expect(radio1removeEventListener.callCount).toBe(0);

  expect(radio2addEventListener.callCount).toBe(0);
  expect(radio2removeEventListener.callCount).toBe(0);

  expect(radio3addEventListener.callCount).toBe(0);
  expect(radio3removeEventListener.callCount).toBe(0);

  expect(radio4addEventListener.callCount).toBe(0);
  expect(radio4removeEventListener.callCount).toBe(0);

  (checkbox1 as any)._x_validation.validate();
  (radio1 as any)._x_validation.validate();

  expect(text1addEventListener.callCount).toBe(0);
  expect(text1removeEventListener.callCount).toBe(0);

  expect(text2addEventListener.callCount).toBe(0);
  expect(text2removeEventListener.callCount).toBe(0);

  expect(checkbox1addEventListener.callCount).toBe(1);
  expect(checkbox1removeEventListener.callCount).toBe(0);

  expect(checkbox2addEventListener.callCount).toBe(1);
  expect(checkbox2removeEventListener.callCount).toBe(0);

  expect(checkbox3addEventListener.callCount).toBe(0);
  expect(checkbox3removeEventListener.callCount).toBe(0);

  expect(checkbox4addEventListener.callCount).toBe(0);
  expect(checkbox4removeEventListener.callCount).toBe(0);

  expect(radio1addEventListener.callCount).toBe(1);
  expect(radio1removeEventListener.callCount).toBe(0);

  expect(radio2addEventListener.callCount).toBe(1);
  expect(radio2removeEventListener.callCount).toBe(0);

  expect(radio3addEventListener.callCount).toBe(0);
  expect(radio3removeEventListener.callCount).toBe(0);

  expect(radio4addEventListener.callCount).toBe(0);
  expect(radio4removeEventListener.callCount).toBe(0);

  cleanup1.getCall(0).args[0]();
  cleanup2.getCall(0).args[0]();
  expect("_x_validation" in checkbox1).toBe(false);
  expect("_x_validation" in radio2).toBe(false);

  expect(text1addEventListener.callCount).toBe(0);
  expect(text1removeEventListener.callCount).toBe(0);

  expect(text2addEventListener.callCount).toBe(0);
  expect(text2removeEventListener.callCount).toBe(0);

  expect(checkbox1addEventListener.callCount).toBe(1);
  expect(checkbox1removeEventListener.callCount).toBe(1);

  expect(checkbox2addEventListener.callCount).toBe(1);
  expect(checkbox2removeEventListener.callCount).toBe(1);

  expect(checkbox3addEventListener.callCount).toBe(0);
  expect(checkbox3removeEventListener.callCount).toBe(0);

  expect(checkbox4addEventListener.callCount).toBe(0);
  expect(checkbox4removeEventListener.callCount).toBe(0);

  expect(radio1addEventListener.callCount).toBe(1);
  expect(radio1removeEventListener.callCount).toBe(1);

  expect(radio2addEventListener.callCount).toBe(1);
  expect(radio2removeEventListener.callCount).toBe(1);

  expect(radio3addEventListener.callCount).toBe(0);
  expect(radio3removeEventListener.callCount).toBe(0);

  expect(radio4addEventListener.callCount).toBe(0);
  expect(radio4removeEventListener.callCount).toBe(0);

  (globalThis as any).CustomEvent = CustomEventBk;

  directiveSpy.restore();
});

test("validate directive - Handles listeners for standalone checkboxes and radios without a form", () => {
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

  const callback = directiveSpy.getCall(1).args[1] as Function;

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

  const cleanup1 = spy((_fn: any) => { });
  callback(
    checkbox1 as any,
    { expression: "" } as DirectiveData,
    {
      evaluate: (_expr: any) => ({}),
      cleanup: cleanup1,
    } as unknown as DirectiveUtilities,
  );

  const cleanup2 = spy((_fn: any) => { });
  callback(
    radio1 as any,
    { expression: "" } as DirectiveData,
    {
      evaluate: (_expr: any) => ({}),
      cleanup: cleanup2,
    } as unknown as DirectiveUtilities,
  );

  expect((checkbox1 as any)._x_validation).toBeDefined();
  expect((radio1 as any)._x_validation).toBeDefined();

  expect(radio1addEventListener.callCount).toBe(1);
  expect(radio1removeEventListener.callCount).toBe(0);

  (checkbox1 as any)._x_validation.validate();
  (radio1 as any)._x_validation.validate();

  expect(checkbox1addEventListener.callCount).toBe(1);
  expect(checkbox1removeEventListener.callCount).toBe(0);
  expect(radio1addEventListener.callCount).toBe(1);
  expect(radio1removeEventListener.callCount).toBe(0);

  cleanup1.getCall(0).args[0]();
  cleanup2.getCall(0).args[0]();
  expect("_x_validation" in checkbox1).toBe(false);
  expect(checkbox1addEventListener.callCount).toBe(1);
  expect(checkbox1removeEventListener.callCount).toBe(1);

  expect(radio1addEventListener.callCount).toBe(1);
  expect(radio1removeEventListener.callCount).toBe(1);

  (globalThis as any).CustomEvent = CustomEventBk;

  directiveSpy.restore();
});

// validate-message-for

test("validate-message-for directive - shows validation message", () => {
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

  const callback = directiveSpy.getCall(2).args[1] as Function;

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

  expect(mockElement.textContent).toBe("Error message");

  callback(
    mockElement as any,
    { expression: "#notFound" } as DirectiveData,
    { effect: (fn: Function) => fn() } as unknown as DirectiveUtilities,
  );

  expect(mockElement.textContent).toBe("");

  delete (globalThis as any).document;
  directiveSpy.restore();
});
