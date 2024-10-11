import { throttle } from "./throttle.ts";
import { assertSpyCall, assertSpyCalls, spy } from "jsr:@std/testing/mock";

Deno.test("throttle: executes function at most once during the wait period", async () => {
  const func = spy(() => {});
  const throttled = throttle({} as EventTarget, func, 100);

  throttled();
  assertSpyCalls(func, 1);
  assertSpyCall(func, 0, { args: [undefined] });

  const evt = new CustomEvent("test");
  throttled(evt);
  assertSpyCalls(func, 1);

  await new Promise((resolve) => setTimeout(resolve, 150));
  assertSpyCalls(func, 2);
  assertSpyCall(func, 1, { args: [evt] });

  throttled.cancel();
});

Deno.test("throttle: adheres to leading and trailing options", async () => {
  const func = spy(() => {});
  const throttled = throttle({} as EventTarget, func, 100, {
    leading: false,
    trailing: true,
  });

  throttled();
  assertSpyCalls(func, 0);

  await new Promise((resolve) => setTimeout(resolve, 150));
  assertSpyCalls(func, 1);
  assertSpyCall(func, 0, { args: [undefined] });

  throttled();
  assertSpyCalls(func, 1);

  await new Promise((resolve) => setTimeout(resolve, 150));
  assertSpyCalls(func, 2);
  assertSpyCall(func, 1, { args: [undefined] });

  throttled.cancel();
});

Deno.test("throttle: does not execute on trailing edge when trailing is false", async () => {
  const func = spy(() => {});
  const throttled = throttle({} as EventTarget, func, 100, {
    leading: true,
    trailing: false,
  });

  throttled();
  assertSpyCalls(func, 1);
  assertSpyCall(func, 0, { args: [undefined] });

  throttled();
  assertSpyCalls(func, 1);

  await new Promise((resolve) => setTimeout(resolve, 150));
  assertSpyCalls(func, 1);

  throttled();
  assertSpyCalls(func, 2);
  assertSpyCall(func, 1, { args: [undefined] });

  throttled.cancel();
});

Deno.test("throttle: makes no call when both leading and trailing are false", async () => {
  const func = spy(() => {});
  const throttled = throttle({} as EventTarget, func, 100, {
    leading: false,
    trailing: false,
  });

  throttled();
  assertSpyCalls(func, 0);

  await new Promise((resolve) => setTimeout(resolve, 150));
  assertSpyCalls(func, 0);

  throttled();
  assertSpyCalls(func, 1);

  await new Promise((resolve) => setTimeout(resolve, 150));
  assertSpyCalls(func, 1);

  throttled.cancel();
});
