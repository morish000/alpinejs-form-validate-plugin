import { debounce } from "./debounce.ts";
import { assertSpyCall, assertSpyCalls, spy } from "jsr:@std/testing/mock";

Deno.test("debounce: executes function after specified wait time", async () => {
  const func = spy(() => {});
  const debounced = debounce({} as EventTarget, func, 100);

  debounced();
  debounced();
  assertSpyCalls(func, 0);

  await new Promise((resolve) => setTimeout(resolve, 150));
  assertSpyCalls(func, 1);
  assertSpyCall(func, 0, { args: [undefined] });

  debounced.cancel();
});

Deno.test("debounce: executes immediately if immediate flag is true", async () => {
  const func = spy(() => {});
  const debounced = debounce({} as EventTarget, func, 100, true);

  const evt = new CustomEvent("test");
  debounced(evt);
  assertSpyCalls(func, 1);
  assertSpyCall(func, 0, { args: [evt] });

  await new Promise((resolve) => setTimeout(resolve, 150));
  assertSpyCalls(func, 1);
  assertSpyCall(func, 0, { args: [evt] });

  debounced();
  assertSpyCalls(func, 2);
  debounced.cancel();
});
