import { assertStrictEquals } from "jsr:@std/assert";
import { assertSpyCalls, spy } from "jsr:@std/testing/mock";
import { createMessageResolver } from "./message_resolver.ts";

Deno.test("createMessageResolver - resolve() returns first argument as string", () => {
  const resolver = createMessageResolver();
  const spyAddUpdateListener = spy(resolver, "addUpdateListener");
  const spyRemoveUpdateListener = spy(resolver, "removeUpdateListener");

  resolver.addUpdateListener(() => {});
  resolver.removeUpdateListener(() => {});

  assertSpyCalls(spyAddUpdateListener, 1);
  assertSpyCalls(spyRemoveUpdateListener, 1);
  assertStrictEquals(resolver.resolve("message", 123), "message");
  assertStrictEquals(resolver.resolve(), "");

  spyAddUpdateListener.restore();
  spyRemoveUpdateListener.restore();
});
