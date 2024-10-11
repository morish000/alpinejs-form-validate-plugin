import { assertStrictEquals } from "jsr:@std/assert";
import { assertSpyCalls, spy } from "jsr:@std/testing/mock";
import { createI18NextMessageResolver } from "./i18next_message_resolver.ts";
import type { i18n, TOptions } from "i18next";
import type { AlpineWithWatch } from "../types/alpine_types.ts";

Deno.test("i18NextMessageResolver: creates a message resolver correctly", () => {
  const i18nMock = {
    exists: (key: string) => key === "existKey",
    t: (key: string, _options?: TOptions) => `translated: ${key}`,
  } as unknown as i18n;

  const exists = spy(i18nMock, "exists");
  const t = spy(i18nMock, "t");

  const AlpineMock = {
    watch: (_o: () => void, _c: () => void) => {},
  } as unknown as AlpineWithWatch;

  const watch = spy(AlpineMock, "watch");

  const store = {
    timestamp: 123,
    i18next: () => i18nMock,
  };

  const resolver = createI18NextMessageResolver(store)(AlpineMock);

  assertStrictEquals((watch.calls[0].args[0] as () => void)(), 123);

  const listener = spy(() => {});

  resolver.addUpdateListener(listener);

  (watch.calls[0].args[1] as () => void)();
  assertSpyCalls(listener, 1);

  resolver.removeUpdateListener(listener);

  (watch.calls[0].args[1] as () => void)();
  assertSpyCalls(listener, 1);

  assertStrictEquals(resolver.resolve("existKey"), "translated: existKey");
  assertStrictEquals(resolver.resolve("nonExistKey"), "nonExistKey");

  assertSpyCalls(exists, 2);
  assertSpyCalls(t, 1);

  exists.restore();
  t.restore();
  watch.restore();
});
