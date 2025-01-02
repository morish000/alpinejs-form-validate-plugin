import { spy } from "sinon";
import { debounce } from "./debounce";

test("debounce: executes function after specified wait time", async () => {
  const func = spy(() => { });
  const debounced = debounce({} as EventTarget, func, 100);

  debounced();
  debounced();
  expect(func.callCount).toBe(0);

  await new Promise((resolve) => setTimeout(resolve, 150));
  expect(func.callCount).toBe(1);
  expect(func.getCall(0).args).toEqual([undefined]);

  debounced.cancel();
});

test("debounce: executes immediately if immediate flag is true", async () => {
  const func = spy(() => { });
  const debounced = debounce({} as EventTarget, func, 100, true);

  const evt = new CustomEvent("test");
  debounced(evt);
  expect(func.callCount).toBe(1);
  expect(func.getCall(0).args).toEqual([evt]);

  await new Promise((resolve) => setTimeout(resolve, 150));
  expect(func.callCount).toBe(1);
  expect(func.getCall(0).args).toEqual([evt]);

  debounced();
  expect(func.callCount).toBe(2);
  debounced.cancel();
});
