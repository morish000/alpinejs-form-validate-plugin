import type { Alpine } from "alpinejs";
import type {
  FormFieldElements,
  MessageResolver,
} from "../types/functions_types";
import { spy } from "sinon";
import { createMessageStore } from "./message_store";

const mockAlpine = {
  reactive: (value: object) => value,
} as unknown as Alpine;

test("createMessageStore - delete and clear", () => {
  const createStore = createMessageStore(mockAlpine);
  const store = createStore({
    messageResolver: {
      addUpdateListener: () => { },
      removeUpdateListener: () => { },
      resolve: (_args: any) => "resolved message",
    },
  });

  const mockElement = { id: "field1" } as unknown as FormFieldElements;
  let handleMessage = spy((_msg: string) => { });

  store.create(mockElement, handleMessage);
  store.delete(mockElement);

  expect(store.get(mockElement)).toBe("");
  expect(handleMessage.callCount).toBe(2);

  handleMessage = spy((_msg: string) => { });

  store.create(mockElement, handleMessage);
  store.set(mockElement, ["message"]);
  store.clear(mockElement);
  expect(store.get(mockElement)).toBe("");
  expect(handleMessage.callCount).toBe(3);
});

test("createMessageStore - execute updateListener", () => {
  const createStore = createMessageStore(mockAlpine);
  let count = 0;
  const addUpdateListener = spy((_callback: () => void) => { });
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
      removeUpdateListener: () => { },
      resolve,
    } as unknown as MessageResolver,
  }, container);

  const mockElement1 = { id: "field1" } as unknown as FormFieldElements;
  const mockElement2 = { id: "field2" } as unknown as FormFieldElements;
  const mockElement3 = { id: "field3" } as unknown as FormFieldElements;
  const handleMessage1 = spy((_msg: string) => { });
  const handleMessage2 = spy((_msg: string) => { });
  const handleMessage3 = spy((_msg: string) => { });

  store.create(mockElement1, handleMessage1);
  store.create(mockElement2, handleMessage2);
  store.create(mockElement3, handleMessage3);

  store.set(mockElement1, []);
  store.set(mockElement2, []);
  store.set(mockElement3, ["test3"]);

  expect(resolve.callCount).toBe(3);
  expect(resolve.getCall(0).args).toEqual([]);
  expect(resolve.getCall(0).returnValue).toBe("");
  expect(resolve.getCall(1).args).toEqual([]);
  expect(resolve.getCall(1).returnValue).toBe("test-2");
  expect(resolve.getCall(2).args).toEqual(["test3"]);
  expect(resolve.getCall(2).returnValue).toBe("test-3");

  expect(container[mockElement1.id].value).toBe("");
  expect(container[mockElement1.id].param).toEqual([]);

  expect(container[mockElement2.id].value).toBe("test-2");
  expect(container[mockElement2.id].param).toEqual([]);

  expect(container[mockElement3.id].value).toBe("test-3");
  expect(container[mockElement3.id].param).toEqual(["test3"]);

  addUpdateListener.getCall(0).args[0]();

  expect(resolve.callCount).toBe(5);
  expect(resolve.getCall(3).args).toEqual([]);
  expect(resolve.getCall(3).returnValue).toBe("test-4");
  expect(resolve.getCall(4).args).toEqual(["test3"]);
  expect(resolve.getCall(4).returnValue).toBe("test-5");

  expect(container[mockElement1.id].value).toBe("");
  expect(container[mockElement1.id].param).toEqual([]);

  expect(container[mockElement2.id].value).toBe("test-4");
  expect(container[mockElement2.id].param).toEqual([]);

  expect(container[mockElement3.id].value).toBe("test-5");
  expect(container[mockElement3.id].param).toEqual(["test3"]);
});
