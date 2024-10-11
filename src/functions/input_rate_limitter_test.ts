import { assertEquals, assertNotEquals, assertThrows } from "jsr:@std/assert";
import { assertSpyCall, assertSpyCalls, spy } from "jsr:@std/testing/mock";
import { createInputRateLimitter } from "./input_rate_limitter.ts";
import { debounce } from "../utils/debounce.ts";
import { throttle } from "../utils/throttle.ts";
import type { Debounce, Throttle } from "../types/utils_types.ts";
import type { FieldValidationConfig } from "../types/config_types.ts";
import { JSDOM } from "jsdom";

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
  r.cancel = () => {};
  return r;
};

const mockThrottle: Throttle = (
  _el,
  func,
  _wait,
  _options,
) => {
  const r = (e?: Event | undefined) => func(e);
  r.cancel = () => {};
  return r;
};

Deno.test("createInputRateLimitter - Returns the handler unchanged for invalid inputLimit values", () => {
  const rateLimitter = createInputRateLimitter(debounce, throttle);
  const el = createDummyElement();
  const handler = () => {};
  assertEquals(
    rateLimitter(
      el,
      handler,
      { inputLimit: null } as unknown as FieldValidationConfig,
    ),
    handler,
  );
  assertEquals(
    rateLimitter(el, handler, { inputLimit: "none" } as FieldValidationConfig),
    handler,
  );
  assertEquals(
    rateLimitter(
      el,
      handler,
      { inputLimit: ":" } as unknown as FieldValidationConfig,
    ),
    handler,
  );
});

Deno.test("createInputRateLimitter - Throws an error for unknown inputLimit", () => {
  const rateLimitter = createInputRateLimitter(debounce, throttle);
  const el = createDummyElement();
  const handler = () => {};

  assertThrows(
    () =>
      rateLimitter(
        el,
        handler,
        { inputLimit: "unknown" } as unknown as FieldValidationConfig,
      ),
    Error,
    "Input rate limitter not found: unknown.",
  );
});

Deno.test("createInputRateLimitter - Correctly calls debounce when inputLimit is 'debounce'", () => {
  const spyDebounce = spy(mockDebounce);
  const spyThrottle = spy(mockThrottle);
  const rateLimitter = createInputRateLimitter(spyDebounce, spyThrottle);
  const el = createDummyElement();
  const spyHandler = spy(() => {});
  assertNotEquals(
    rateLimitter(el, spyHandler, {
      inputLimit: "debounce",
      inputLimitOpts: {
        debounce: {
          wait: 250,
        },
      },
    } as FieldValidationConfig),
    spyHandler,
  );
  assertSpyCalls(spyDebounce, 1);
  assertSpyCalls(spyThrottle, 0);
  assertSpyCall(
    spyDebounce,
    0,
    {
      args: [el, spyHandler, 250, undefined],
    },
  );
});

Deno.test("createInputRateLimitter - Handles debounce with custom wait time and immediate execution", () => {
  const spyDebounce = spy(mockDebounce);
  const spyThrottle = spy(mockThrottle);
  const rateLimitter = createInputRateLimitter(spyDebounce, spyThrottle);
  const el = createDummyElement();
  const spyHandler = spy(() => {});
  assertNotEquals(
    rateLimitter(el, spyHandler, {
      inputLimit: "debounce:1000",
      inputLimitOpts: {
        debounce: {
          wait: 2000,
          immediate: true,
        },
      },
    } as unknown as FieldValidationConfig),
    spyHandler,
  );
  assertSpyCalls(spyDebounce, 1);
  assertSpyCalls(spyThrottle, 0);
  assertSpyCall(
    spyDebounce,
    0,
    {
      args: [el, spyHandler, 1000, true],
    },
  );
});

Deno.test("createInputRateLimitter - Validates debounce with wait time and no immediate execution", () => {
  const spyDebounce = spy(mockDebounce);
  const spyThrottle = spy(mockThrottle);
  const rateLimitter = createInputRateLimitter(spyDebounce, spyThrottle);
  const el = createDummyElement();
  const spyHandler = spy(() => {});
  assertNotEquals(
    rateLimitter(el, spyHandler, {
      inputLimit: "debounce",
      inputLimitOpts: {
        debounce: {
          wait: 2000,
          immediate: false,
        },
      },
    } as FieldValidationConfig),
    spyHandler,
  );
  assertSpyCalls(spyDebounce, 1);
  assertSpyCalls(spyThrottle, 0);
  assertSpyCall(
    spyDebounce,
    0,
    {
      args: [el, spyHandler, 2000, false],
    },
  );
});

Deno.test("createInputRateLimitter - Correctly calls throttle when inputLimit is 'throttle'", () => {
  const spyDebounce = spy(mockDebounce);
  const spyThrottle = spy(mockThrottle);
  const rateLimitter = createInputRateLimitter(spyDebounce, spyThrottle);
  const el = createDummyElement();
  const spyHandler = spy(() => {});
  assertNotEquals(
    rateLimitter(el, spyHandler, {
      inputLimit: "throttle",
      inputLimitOpts: {
        throttle: {
          wait: 500,
        },
      },
    } as FieldValidationConfig),
    spyHandler,
  );
  assertSpyCalls(spyDebounce, 0);
  assertSpyCalls(spyThrottle, 1);
  assertSpyCall(
    spyThrottle,
    0,
    {
      args: [el, spyHandler, 500, undefined],
    },
  );
});

Deno.test("createInputRateLimitter - Tests throttle behavior with custom wait time and options", () => {
  const spyDebounce = spy(mockDebounce);
  const spyThrottle = spy(mockThrottle);
  const rateLimitter = createInputRateLimitter(spyDebounce, spyThrottle);
  const el = createDummyElement();
  const spyHandler = spy(() => {});
  assertNotEquals(
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
    } as unknown as FieldValidationConfig),
    spyHandler,
  );
  assertSpyCalls(spyDebounce, 0);
  assertSpyCalls(spyThrottle, 1);
  assertSpyCall(
    spyThrottle,
    0,
    {
      args: [el, spyHandler, 1000, {
        leading: true,
        trailing: false,
      }],
    },
  );
});

Deno.test("createInputRateLimitter - Confirms throttle with specific leading and trailing configurations", () => {
  const spyDebounce = spy(mockDebounce);
  const spyThrottle = spy(mockThrottle);
  const rateLimitter = createInputRateLimitter(spyDebounce, spyThrottle);
  const el = createDummyElement();
  const spyHandler = spy(() => {});
  assertNotEquals(
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
    } as FieldValidationConfig),
    spyHandler,
  );
  assertSpyCalls(spyDebounce, 0);
  assertSpyCalls(spyThrottle, 1);
  assertSpyCall(
    spyThrottle,
    0,
    {
      args: [el, spyHandler, 2000, {
        leading: false,
        trailing: true,
      }],
    },
  );
});
