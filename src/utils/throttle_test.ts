import { spy } from "sinon";
import { throttle } from "./throttle";

test("throttle: executes function at most once during the wait period", async () => {
  const func = spy(() => { });
  const throttled = throttle({} as EventTarget, func, 100);

  throttled();
  expect(func.callCount).toBe(1);
  expect(func.getCall(0).args).toEqual([undefined]);

  const evt = new CustomEvent("test");
  throttled(evt);
  expect(func.callCount).toBe(1);

  await new Promise((resolve) => setTimeout(resolve, 150));
  expect(func.callCount).toBe(2);
  expect(func.getCall(1).args).toEqual([evt]);

  throttled.cancel();
});

test("throttle: adheres to leading and trailing options", async () => {
  const func = spy(() => { });
  const throttled = throttle({} as EventTarget, func, 100, {
    leading: false,
    trailing: true,
  });

  throttled();
  expect(func.callCount).toBe(0);

  await new Promise((resolve) => setTimeout(resolve, 150));
  expect(func.callCount).toBe(1);
  expect(func.getCall(0).args).toEqual([undefined]);

  throttled();
  expect(func.callCount).toBe(1);

  await new Promise((resolve) => setTimeout(resolve, 150));
  expect(func.callCount).toBe(2);
  expect(func.getCall(1).args).toEqual([undefined]);

  throttled.cancel();
});

test("throttle: does not execute on trailing edge when trailing is false", async () => {
  const func = spy(() => { });
  const throttled = throttle({} as EventTarget, func, 100, {
    leading: true,
    trailing: false,
  });

  throttled();
  expect(func.callCount).toBe(1);
  expect(func.getCall(0).args).toEqual([undefined]);

  throttled();
  expect(func.callCount).toBe(1);

  await new Promise((resolve) => setTimeout(resolve, 150));
  expect(func.callCount).toBe(1);

  throttled();
  expect(func.callCount).toBe(2);
  expect(func.getCall(1).args).toEqual([undefined]);

  throttled.cancel();
});

test("throttle: makes no call when both leading and trailing are false", async () => {
  const func = spy(() => { });
  const throttled = throttle({} as EventTarget, func, 100, {
    leading: false,
    trailing: false,
  });

  throttled();
  expect(func.callCount).toBe(0);

  await new Promise((resolve) => setTimeout(resolve, 150));
  expect(func.callCount).toBe(0);

  throttled();
  expect(func.callCount).toBe(1);

  await new Promise((resolve) => setTimeout(resolve, 150));
  expect(func.callCount).toBe(1);

  throttled.cancel();
});
