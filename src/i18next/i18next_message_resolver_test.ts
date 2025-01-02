import type { i18n, TOptions } from "i18next";
import type { AlpineWithWatch } from "../types/alpine_types";
import { spy } from "sinon";
import { createI18NextMessageResolver } from "./i18next_message_resolver";

test("i18NextMessageResolver: creates a message resolver correctly", () => {
  const i18nMock = {
    exists: (key: string) => key === "existKey",
    t: (key: string, _options?: TOptions) => `translated: ${key}`,
  } as unknown as i18n;

  const exists = spy(i18nMock, "exists");
  const t = spy(i18nMock, "t");

  const AlpineMock = {
    watch: (_o: () => void, _c: () => void) => { },
  } as unknown as AlpineWithWatch;

  const watch = spy(AlpineMock, "watch");

  const store = {
    timestamp: 123,
    i18next: () => i18nMock,
  };

  const resolver = createI18NextMessageResolver(store)(AlpineMock);

  expect((watch.getCall(0).args[0] as () => void)()).toBe(123);

  const listener = spy(() => { });

  resolver.addUpdateListener(listener);

  (watch.getCall(0).args[1] as () => void)();
  expect(listener.callCount).toBe(1);

  resolver.removeUpdateListener(listener);

  (watch.getCall(0).args[1] as () => void)();
  expect(listener.callCount).toBe(1);

  expect(resolver.resolve("existKey")).toBe("translated: existKey");
  expect(resolver.resolve("nonExistKey")).toBe("nonExistKey");

  expect(exists.callCount).toBe(2);
  expect(t.callCount).toBe(1);

  exists.restore();
  t.restore();
  watch.restore();
});
