import { spy } from "sinon";
import { createMessageResolver } from "./message_resolver";

test("createMessageResolver - resolve() returns first argument as string", () => {
  const resolver = createMessageResolver();
  const spyAddUpdateListener = spy(resolver, "addUpdateListener");
  const spyRemoveUpdateListener = spy(resolver, "removeUpdateListener");

  resolver.addUpdateListener(() => { });
  resolver.removeUpdateListener(() => { });

  expect(spyAddUpdateListener.callCount).toBe(1);
  expect(spyRemoveUpdateListener.callCount).toBe(1);
  expect(resolver.resolve("message", 123)).toBe("message");
  expect(resolver.resolve()).toBe("");

  spyAddUpdateListener.restore();
  spyRemoveUpdateListener.restore();
});
