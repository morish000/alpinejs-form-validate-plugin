import type { Debounce, Throttle } from "../types/utils_types";
import type { FieldValidationConfig } from "../types/config_types";
import { spy } from "sinon";
import { JSDOM } from "jsdom";
import { createInputRateLimitter } from "./input_rate_limitter";
import { debounce } from "../utils/debounce";
import { throttle } from "../utils/throttle";

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

const mockDebounce: Debounce = (
  _el,
  func,
  _wait,
  _immediate: boolean = false,
) => {
  const r = (e?: Event | undefined) => func(e);
  r.cancel = () => { };
  return r;
};

const mockThrottle: Throttle = (
  _el,
  func,
  _wait,
  _options,
) => {
  const r = (e?: Event | undefined) => func(e);
  r.cancel = () => { };
  return r;
};

test("createInputRateLimitter - Returns the handler unchanged for invalid inputLimit values", () => {
  const rateLimitter = createInputRateLimitter(debounce, throttle);
  const el = createDummyElement();
  const handler = () => { };
  expect(
    rateLimitter(
      el,
      handler,
      { inputLimit: null } as unknown as FieldValidationConfig,
    )).toEqual(
      handler
    );
  expect(
    rateLimitter(el, handler, { inputLimit: "none" } as FieldValidationConfig)).toEqual(
      handler,
    );
  expect(
    rateLimitter(
      el,
      handler,
      { inputLimit: ":" } as unknown as FieldValidationConfig,
    )).toEqual(
      handler,
    );
});

test("createInputRateLimitter - Throws an error for unknown inputLimit", () => {
  const rateLimitter = createInputRateLimitter(debounce, throttle);
  const el = createDummyElement();
  const handler = () => { };

  expect(
    () =>
      rateLimitter(
        el,
        handler,
        { inputLimit: "unknown" } as unknown as FieldValidationConfig,
      )).toThrow(
        "Input rate limitter not found: unknown.",
      );
});

test("createInputRateLimitter - Correctly calls debounce when inputLimit is 'debounce'", () => {
  const spyDebounce = spy(mockDebounce);
  const spyThrottle = spy(mockThrottle);
  const rateLimitter = createInputRateLimitter(spyDebounce, spyThrottle);
  const el = createDummyElement();
  const spyHandler = spy(() => { });
  expect(
    rateLimitter(el, spyHandler, {
      inputLimit: "debounce",
      inputLimitOpts: {
        debounce: {
          wait: 250,
        },
      },
    } as FieldValidationConfig)).not.toEqual(
      spyHandler,
    );
  expect(spyDebounce.callCount).toBe(1);
  expect(spyThrottle.callCount).toBe(0);
  expect(spyDebounce.getCall(0).args).toEqual([el, spyHandler, 250, undefined]);
});

test("createInputRateLimitter - Handles debounce with custom wait time and immediate execution", () => {
  const spyDebounce = spy(mockDebounce);
  const spyThrottle = spy(mockThrottle);
  const rateLimitter = createInputRateLimitter(spyDebounce, spyThrottle);
  const el = createDummyElement();
  const spyHandler = spy(() => { });
  expect(
    rateLimitter(el, spyHandler, {
      inputLimit: "debounce:1000",
      inputLimitOpts: {
        debounce: {
          wait: 2000,
          immediate: true,
        },
      },
    } as unknown as FieldValidationConfig)).not.toEqual(
      spyHandler,
    );
  expect(spyDebounce.callCount).toBe(1);
  expect(spyThrottle.callCount).toBe(0);
  expect(spyDebounce.getCall(0).args).toEqual([el, spyHandler, 1000, true]);
});

test("createInputRateLimitter - Validates debounce with wait time and no immediate execution", () => {
  const spyDebounce = spy(mockDebounce);
  const spyThrottle = spy(mockThrottle);
  const rateLimitter = createInputRateLimitter(spyDebounce, spyThrottle);
  const el = createDummyElement();
  const spyHandler = spy(() => { });
  expect(
    rateLimitter(el, spyHandler, {
      inputLimit: "debounce",
      inputLimitOpts: {
        debounce: {
          wait: 2000,
          immediate: false,
        },
      },
    } as FieldValidationConfig)).not.toEqual(
      spyHandler,
    );
  expect(spyDebounce.callCount).toBe(1);
  expect(spyThrottle.callCount).toBe(0);
  expect(spyDebounce.getCall(0).args).toEqual([el, spyHandler, 2000, false]);
});

test("createInputRateLimitter - Correctly calls throttle when inputLimit is 'throttle'", () => {
  const spyDebounce = spy(mockDebounce);
  const spyThrottle = spy(mockThrottle);
  const rateLimitter = createInputRateLimitter(spyDebounce, spyThrottle);
  const el = createDummyElement();
  const spyHandler = spy(() => { });
  expect(
    rateLimitter(el, spyHandler, {
      inputLimit: "throttle",
      inputLimitOpts: {
        throttle: {
          wait: 500,
        },
      },
    } as FieldValidationConfig)).not.toEqual(
      spyHandler,
    );
  expect(spyDebounce.callCount).toBe(0);
  expect(spyThrottle.callCount).toBe(1);
  expect(spyThrottle.getCall(0).args).toEqual([el, spyHandler, 500, undefined]);
});

test("createInputRateLimitter - Tests throttle behavior with custom wait time and options", () => {
  const spyDebounce = spy(mockDebounce);
  const spyThrottle = spy(mockThrottle);
  const rateLimitter = createInputRateLimitter(spyDebounce, spyThrottle);
  const el = createDummyElement();
  const spyHandler = spy(() => { });
  expect(
    rateLimitter(el, spyHandler, {
      inputLimit: "throttle:1000",
      inputLimitOpts: {
        throttle: {
          wait: 2000,
          options: {
            leading: true,
            trailing: false,
          },
        },
      },
    } as unknown as FieldValidationConfig)).not.toEqual(
      spyHandler,
    );
  expect(spyDebounce.callCount).toBe(0);
  expect(spyThrottle.callCount).toBe(1);
  expect(
    spyThrottle.getCall(0).args).toEqual(
      [el, spyHandler, 1000, {
        leading: true,
        trailing: false,
      }]);
});

test("createInputRateLimitter - Confirms throttle with specific leading and trailing configurations", () => {
  const spyDebounce = spy(mockDebounce);
  const spyThrottle = spy(mockThrottle);
  const rateLimitter = createInputRateLimitter(spyDebounce, spyThrottle);
  const el = createDummyElement();
  const spyHandler = spy(() => { });
  expect(
    rateLimitter(el, spyHandler, {
      inputLimit: "throttle",
      inputLimitOpts: {
        throttle: {
          wait: 2000,
          options: {
            leading: false,
            trailing: true,
          },
        },
      },
    } as FieldValidationConfig)).not.toEqual(
      spyHandler,
    );
  expect(spyDebounce.callCount).toBe(0);
  expect(spyThrottle.callCount).toBe(1);
  expect(spyThrottle.getCall(0).args).toEqual(
    [el, spyHandler, 2000, {
      leading: false,
      trailing: true,
    }]
  );
});
