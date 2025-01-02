import type {
  Alpine,
  DirectiveData,
  DirectiveUtilities,
  ElementWithXAttributes,
} from "alpinejs";
import type { i18n } from "i18next";
import { spy } from "sinon";
import { createI18NextPlugin } from "./alpinejs_i18next_plugin";

const i18nOnSpy = () => spy((_e: any, _h: () => void) => { });
const i18nTSpy = () => spy((..._p) => "translated text");
const i18nStoreOnSpy = () => spy((_e: any, _h: () => void) => { });

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
    magic: (..._p: any[]) => { },
    directive: (..._p: any[]) => { },
    mutateDom: (f: () => void) => f(),
  } as unknown as Alpine;
};

test("createI18NextPlugin initializes correctly", () => {
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

  expect(i18nOn.callCount).toBe(2);
  expect(i18nOn.getCall(0).args[0]).toBe("languageChanged");
  expect(typeof i18nOn.getCall(0).args[1] === "function");
  expect(i18nOn.getCall(1).args[0]).toBe("loaded");
  expect(typeof i18nOn.getCall(1).args[1] === "function");

  expect(i18nStoreOn.callCount).toBe(2);
  expect(i18nStoreOn.getCall(0).args[0]).toBe("added");
  expect(typeof i18nStoreOn.getCall(0).args[1] === "function");
  expect(i18nStoreOn.getCall(1).args[0]).toBe("removed");
  expect(typeof i18nStoreOn.getCall(1).args[1] === "function");

  expect(magicSpy.callCount).toBe(2);
  expect(magicSpy.getCall(0).args[0]).toBe("t");
  expect(typeof magicSpy.getCall(0).args[1] === "function");
  expect(magicSpy.getCall(1).args[0]).toBe("i18next");
  expect(typeof magicSpy.getCall(1).args[1] === "function");

  expect(directiveSpy.callCount).toBe(1);
  expect(directiveSpy.getCall(0).args[0]).toBe("i18next-text");
  expect(typeof directiveSpy.getCall(0).args[1] === "function");

  magicSpy.restore();
  directiveSpy.restore();
});

test("Alpine magic t method translation", () => {
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

  const translated = (magicSpy.getCall(0).args[1] as any)()("key", {});
  expect(translated).toBe("translated text");

  expect(i18nT.callCount).toBe(1);
  expect(i18nT.getCall(0).args).toEqual(["key", {}]);
  expect(i18nT.getCall(0).returnValue).toEqual("translated text");

  magicSpy.restore();
});

test("Alpine magic i18next method", () => {
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

  expect((magicSpy.getCall(1).args[1] as any)()()).toBe(i18next);

  magicSpy.restore();
});

test("Alpine directive i18next-text updates element text", () => {
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

  (directiveSpy.getCall(0).args[1] as Function)(
    el,
    { expression: "" } as DirectiveData,
    { evaluateLater, effect } as DirectiveUtilities,
  );

  expect(el.textContent).toBe("translated text");

  directiveSpy.restore();
});

test("i18n event listeners update timestamp on events", async () => {
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
  i18nOn.getCall(0).args[1]();
  await new Promise((resolve) => setTimeout(resolve, 1));
  expect(container.timestamp).not.toBe(timestamp);

  await new Promise((resolve) => setTimeout(resolve, 1));
  timestamp = container.timestamp;
  i18nOn.getCall(1).args[1]();
  await new Promise((resolve) => setTimeout(resolve, 1));
  expect(container.timestamp).not.toBe(timestamp);

  await new Promise((resolve) => setTimeout(resolve, 1));
  timestamp = container.timestamp;
  i18nStoreOn.getCall(0).args[1]();
  await new Promise((resolve) => setTimeout(resolve, 1));
  expect(container.timestamp).not.toBe(timestamp);

  await new Promise((resolve) => setTimeout(resolve, 1));
  timestamp = container.timestamp;
  i18nStoreOn.getCall(1).args[1]();
  await new Promise((resolve) => setTimeout(resolve, 1));
  expect(container.timestamp).not.toBe(timestamp);
});
