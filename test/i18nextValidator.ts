// @deno-types="@types/jsdom"
import { JSDOM } from "jsdom";
import { assert, assertFalse, assertStrictEquals } from "jsr:@std/assert";
import { fireEvent } from "@testing-library/dom";
import i18next, { type InitOptions } from "i18next";
import i18nextFsBackend from "i18next-fs-backend";
import { createI18NextPlugin } from "../src/i18next/alpinejs_i18next_plugin.ts";
import { createI18NextMessageResolver } from "../src/i18next/i18next_message_resolver.ts";
import { createValidatePlugin } from "../src/alpinejs_form_validate_plugin.ts";

const __dirname = new URL(".", import.meta.url).pathname;

const {
  window,
  window: {
    document,
    CustomEvent,
    MutationObserver,
  },
} = new JSDOM(
  `<!DOCTYPE html>
  <html>
    <head>
      <title>i18next validator</title>
    </head>
    <body>
    </body>
  </html>`,
);

delete (globalThis as { window?: unknown }).window;
(globalThis as { window?: unknown }).window = window;

globalThis.document = document;
globalThis.MutationObserver = MutationObserver;
globalThis.CustomEvent = CustomEvent;

// @deno-types="@types/alpinejs"
const { Alpine } = await import("alpinejs");

const alpineInitializeWaiter = () => {
  let alpineInitialized = false;

  document.addEventListener("alpine:init", () => {
    alpineInitialized = true;
  }, { once: true });

  return async function waitAlpineInitialized() {
    if (!alpineInitialized) {
      await new Promise((resolve) => {
        document.addEventListener("alpine:init", resolve, { once: true });
      });
    }
  };
};

const waitAlpineInitialized = alpineInitializeWaiter();

i18next.on("initialized", () => {
  const i18nStore = Alpine.reactive(
    {
      timestamp: Date.now(),
      i18next: () => i18next,
    },
  );
  Alpine.plugin(createI18NextPlugin(i18nStore));
  Alpine.plugin(createValidatePlugin({
    defaultFunctionsOptions: {
      messageResolver: createI18NextMessageResolver(i18nStore)(Alpine),
    },
  }));
  Alpine.start();
});

i18next.on("failedLoading", (lng, ns, msg) => {
  console.error(`failedLoading ${lng}, ${ns}, ${msg}`);
});

const i18nextOptions: InitOptions = {
  fallbackLng: "en",
  ns: ["validate"],
  defaultNS: "validate",
  preload: ["en", "ja"],
  load: "languageOnly",
  backend: {
    loadPath: `${__dirname}data/locales/{{ns}}/{{lng}}.json`,
  },
};

i18next
  .use(i18nextFsBackend)
  .init(i18nextOptions);

await waitAlpineInitialized();

Deno.test("i18next validator", async () => {
  document.body.innerHTML = `
  <form x-validate-form autocomplete="off" novalidate>
    <input id="text-1" name="text-1" type="text" required x-validate="{
        onInput: true,
        v: {
          validate: {
            v: (el, value) => value.length > 1,
            m: ['moreThanChars', { count: 2 }]
          }
        },
        m: {
          valueMissing: ['required', { name: $el.name }],
        }
      }" />
    <p id="p-1" x-validate-message-for="#text-1"></p>
    <input id="submit" type="submit" value="Submit" />
  </form>
  <button id="en" @click="$i18next().changeLanguage('en')">English</button>
  <button id="ja" @click="$i18next().changeLanguage('ja')">Japanese</button>
  `;
  await new Promise((resolve) => setTimeout(resolve, 1));

  const text1 = document.getElementById("text-1") as HTMLInputElement;
  const p1 = document.getElementById("p-1") as HTMLElement;
  const en = document.getElementById("en") as HTMLInputElement;
  const ja = document.getElementById("ja") as HTMLInputElement;
  const submit = document.getElementById("submit") as HTMLInputElement;

  fireEvent.click(submit);
  await new Promise((resolve) => setTimeout(resolve, 1));
  assertStrictEquals(text1.validationMessage, "This value is required. text-1");
  assertStrictEquals(p1.textContent, "This value is required. text-1");
  assertFalse(text1.validity.valid);

  fireEvent.click(ja);
  await new Promise((resolve) => setTimeout(resolve, 1));
  assertStrictEquals(text1.validationMessage, "この値は必須です。text-1");
  assertStrictEquals(p1.textContent, "この値は必須です。text-1");
  assertFalse(text1.validity.valid);

  fireEvent.click(en);
  fireEvent.change(text1, {
    target: { value: "a" },
  });
  await new Promise((resolve) => setTimeout(resolve, 1));
  assertStrictEquals(
    text1.validationMessage,
    "Please enter at least 2 characters.",
  );
  assertStrictEquals(p1.textContent, "Please enter at least 2 characters.");
  assertFalse(text1.validity.valid);

  fireEvent.click(ja);
  await new Promise((resolve) => setTimeout(resolve, 1));
  assertStrictEquals(text1.validationMessage, "2 文字以上で入力してください。");
  assertStrictEquals(p1.textContent, "2 文字以上で入力してください。");
  assertFalse(text1.validity.valid);

  fireEvent.change(text1, {
    target: { value: "ab" },
  });
  await new Promise((resolve) => setTimeout(resolve, 1));
  assertStrictEquals(text1.validationMessage, "");
  assertStrictEquals(p1.textContent, "");
  assert(text1.validity.valid);

  document.body.innerHTML = "";
});
