// deno-lint-ignore-file no-explicit-any
import {
  assert,
  assertNotStrictEquals,
  assertStrictEquals,
} from "jsr:@std/assert";
import { assertSpyCall, assertSpyCalls, spy } from "jsr:@std/testing/mock";
import type {
  Alpine,
  DirectiveData,
  DirectiveUtilities,
  ElementWithXAttributes,
} from "alpinejs";
import type { i18n } from "i18next";
import { createI18NextPlugin } from "./alpinejs_i18next_plugin.ts";

const i18nOnSpy = () => spy((_e: any, _h: () => void) => {});
const i18nTSpy = () => spy((..._p) => "translated text");
const i18nStoreOnSpy = () => spy((_e: any, _h: () => void) => {});

const i18nMock = (
  i18nOn: any,
  i18nT: any,
  i18nStoreOn: any,
): i18n => {
  return {
    on: i18nOn,
    t: i18nT,
    store: {
      on: i18nStoreOn,
    },
    init: () => Promise.resolve(),
    loadResources: () => Promise.resolve(),
    use: () => ({}) as i18n,
    modules: {},
    isInitialized: true,
  } as unknown as i18n;
};

const alpineMock = () => {
  return {
    magic: (..._p: any[]) => {},
    directive: (..._p: any[]) => {},
    mutateDom: (f: () => void) => f(),
  } as unknown as Alpine;
};

Deno.test("createI18NextPlugin initializes correctly", () => {
  const i18nOn = i18nOnSpy();
  const i18nT = i18nTSpy();
  const i18nStoreOn = i18nStoreOnSpy();
  const i18next = i18nMock(i18nOn, i18nT, i18nStoreOn);
  const Alpine = alpineMock();
  const magicSpy = spy(Alpine, "magic");
  const directiveSpy = spy(Alpine, "directive");

  createI18NextPlugin({
    timestamp: 0,
    i18next: () => i18next,
  })(Alpine);

  assertSpyCalls(i18nOn, 2);
  assertStrictEquals(i18nOn.calls[0].args[0], "languageChanged");
  assert(typeof i18nOn.calls[0].args[1] === "function");
  assertStrictEquals(i18nOn.calls[1].args[0], "loaded");
  assert(typeof i18nOn.calls[1].args[1] === "function");

  assertSpyCalls(i18nStoreOn, 2);
  assertStrictEquals(i18nStoreOn.calls[0].args[0], "added");
  assert(typeof i18nStoreOn.calls[0].args[1] === "function");
  assertStrictEquals(i18nStoreOn.calls[1].args[0], "removed");
  assert(typeof i18nStoreOn.calls[1].args[1] === "function");

  assertSpyCalls(magicSpy, 2);
  assertStrictEquals(magicSpy.calls[0].args[0], "t");
  assert(typeof magicSpy.calls[0].args[1] === "function");
  assertStrictEquals(magicSpy.calls[1].args[0], "i18next");
  assert(typeof magicSpy.calls[1].args[1] === "function");

  assertSpyCalls(directiveSpy, 1);
  assertStrictEquals(directiveSpy.calls[0].args[0], "i18next-text");
  assert(typeof directiveSpy.calls[0].args[1] === "function");

  magicSpy.restore();
  directiveSpy.restore();
});

Deno.test("Alpine magic t method translation", () => {
  const i18nOn = i18nOnSpy();
  const i18nT = i18nTSpy();
  const i18nStoreOn = i18nStoreOnSpy();
  const i18next = i18nMock(i18nOn, i18nT, i18nStoreOn);
  const Alpine = alpineMock();
  const magicSpy = spy(Alpine, "magic");

  createI18NextPlugin({
    timestamp: 0,
    i18next: () => i18next,
  })(Alpine);

  const translated = (magicSpy.calls[0].args[1] as any)()("key", {});
  assertStrictEquals(translated, "translated text");

  assertSpyCalls(i18nT, 1);
  assertSpyCall(i18nT, 0, {
    args: ["key", {}],
    returned: "translated text",
  });

  magicSpy.restore();
});

Deno.test("Alpine magic i18next method", () => {
  const i18nOn = i18nOnSpy();
  const i18nT = i18nTSpy();
  const i18nStoreOn = i18nStoreOnSpy();
  const i18next = i18nMock(i18nOn, i18nT, i18nStoreOn);
  const Alpine = alpineMock();
  const magicSpy = spy(Alpine, "magic");

  createI18NextPlugin({
    timestamp: 0,
    i18next: () => i18next,
  })(Alpine);

  assertStrictEquals((magicSpy.calls[1].args[1] as any)()(), i18next);

  magicSpy.restore();
});

Deno.test("Alpine directive i18next-text updates element text", () => {
  const i18nOn = i18nOnSpy();
  const i18nT = i18nTSpy();
  const i18nStoreOn = i18nStoreOnSpy();
  const i18next = i18nMock(i18nOn, i18nT, i18nStoreOn);
  const Alpine = alpineMock();
  const directiveSpy = spy(Alpine, "directive");

  createI18NextPlugin({
    timestamp: 0,
    i18next: () => i18next,
  })(Alpine);

  const el = { textContent: "" } as ElementWithXAttributes;

  const evaluateLater = (_expression: string) => {
    return (callback: (args: [string, any?]) => void) => callback(["key", {}]);
  };

  const effect = (callback: () => void) => callback();

  // deno-lint-ignore ban-types
  (directiveSpy.calls[0].args[1]  as Function)(
    el,
    { expression: "" } as DirectiveData,
    { evaluateLater, effect } as DirectiveUtilities,
  );

  assertStrictEquals(el.textContent, "translated text");

  directiveSpy.restore();
});

Deno.test("i18n event listeners update timestamp on events", async () => {
  const i18nOn = i18nOnSpy();
  const i18nT = i18nTSpy();
  const i18nStoreOn = i18nStoreOnSpy();
  const i18next = i18nMock(i18nOn, i18nT, i18nStoreOn);
  const Alpine = alpineMock();

  const container = {
    timestamp: 0,
    i18next: () => i18next,
  };
  createI18NextPlugin(container)(Alpine);

  await new Promise((resolve) => setTimeout(resolve, 1));
  let timestamp = container.timestamp;
  i18nOn.calls[0].args[1]();
  assertNotStrictEquals(container.timestamp, timestamp);

  await new Promise((resolve) => setTimeout(resolve, 1));
  timestamp = container.timestamp;
  i18nOn.calls[1].args[1]();
  assertNotStrictEquals(container.timestamp, timestamp);

  await new Promise((resolve) => setTimeout(resolve, 1));
  timestamp = container.timestamp;
  i18nStoreOn.calls[0].args[1]();
  assertNotStrictEquals(container.timestamp, timestamp);

  await new Promise((resolve) => setTimeout(resolve, 1));
  timestamp = container.timestamp;
  i18nStoreOn.calls[1].args[1]();
  assertNotStrictEquals(container.timestamp, timestamp);
});
