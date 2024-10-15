// deno-lint-ignore-file no-explicit-any
import { assertEquals, assertStrictEquals } from "jsr:@std/assert";
import { assertSpyCall, assertSpyCalls, spy } from "jsr:@std/testing/mock";
import { createMessageStore } from "./message_store.ts";
import type {
  FormFieldElements,
  MessageResolver,
} from "../types/functions_types.ts";
// @deno-types="@types/alpinejs"
import type { Alpine } from "alpinejs";

const mockAlpine = {
  reactive: (value: object) => value,
} as unknown as Alpine;

Deno.test("createMessageStore - delete and clear", () => {
  const createStore = createMessageStore(mockAlpine);
  const store = createStore({
    messageResolver: {
      addUpdateListener: () => {},
      removeUpdateListener: () => {},
      resolve: (_args: any) => "resolved message",
    },
  });

  const mockElement = { id: "field1" } as unknown as FormFieldElements;
  let handleMessage = spy((_msg: string) => {});

  store.create(mockElement, handleMessage);
  store.delete(mockElement);

  assertStrictEquals(store.get(mockElement), "");
  assertSpyCalls(handleMessage, 2);

  handleMessage = spy((_msg: string) => {});

  store.create(mockElement, handleMessage);
  store.set(mockElement, ["message"]);
  store.clear(mockElement);
  assertStrictEquals(store.get(mockElement), "");
  assertSpyCalls(handleMessage, 3);
});

Deno.test("createMessageStore - execute updateListener", () => {
  const createStore = createMessageStore(mockAlpine);
  let count = 0;
  const addUpdateListener = spy((_callback: () => void) => {});
  const resolve = spy((..._args) => {
    count++;
    switch (count) {
      case 1:
        return "";
      default:
        return `test-${count}`;
    }
  });
  const container = {} as any;
  const store = createStore({
    messageResolver: {
      addUpdateListener,
      removeUpdateListener: () => {},
      resolve,
    } as unknown as MessageResolver,
  }, container);

  const mockElement1 = { id: "field1" } as unknown as FormFieldElements;
  const mockElement2 = { id: "field2" } as unknown as FormFieldElements;
  const mockElement3 = { id: "field3" } as unknown as FormFieldElements;
  const handleMessage1 = spy((_msg: string) => {});
  const handleMessage2 = spy((_msg: string) => {});
  const handleMessage3 = spy((_msg: string) => {});

  store.create(mockElement1, handleMessage1);
  store.create(mockElement2, handleMessage2);
  store.create(mockElement3, handleMessage3);

  store.set(mockElement1, []);
  store.set(mockElement2, []);
  store.set(mockElement3, ["test3"]);

  assertSpyCalls(resolve, 3);
  assertSpyCall(resolve, 0, { args: [], returned: "" });
  assertSpyCall(resolve, 1, { args: [], returned: "test-2" });
  assertSpyCall(resolve, 2, { args: ["test3"], returned: "test-3" });

  assertStrictEquals(container[mockElement1.id].value, "");
  assertEquals(container[mockElement1.id].param, []);

  assertStrictEquals(container[mockElement2.id].value, "test-2");
  assertEquals(container[mockElement2.id].param, []);

  assertStrictEquals(container[mockElement3.id].value, "test-3");
  assertEquals(container[mockElement3.id].param, ["test3"]);

  addUpdateListener.calls[0].args[0]();

  assertSpyCalls(resolve, 5);
  assertSpyCall(resolve, 3, { args: [], returned: "test-4" });
  assertSpyCall(resolve, 4, { args: ["test3"], returned: "test-5" });

  assertStrictEquals(container[mockElement1.id].value, "");
  assertEquals(container[mockElement1.id].param, []);

  assertStrictEquals(container[mockElement2.id].value, "test-4");
  assertEquals(container[mockElement2.id].param, []);

  assertStrictEquals(container[mockElement3.id].value, "test-5");
  assertEquals(container[mockElement3.id].param, ["test3"]);
});
