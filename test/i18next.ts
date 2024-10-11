import { JSDOM } from "jsdom";
import { assertStrictEquals } from "jsr:@std/assert";
import { fireEvent } from "@testing-library/dom";
import i18next, { type InitOptions } from "i18next";
import i18nextFsBackend from "i18next-fs-backend";
import { createI18NextPlugin } from "../src/i18next/alpinejs_i18next_plugin.ts";

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
      <title>i18next</title>
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

const { default: Alpine } = await import("alpinejs");

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
  Alpine.start();
});

i18next.on("failedLoading", (lng, ns, msg) => {
  console.error(`failedLoading ${lng}, ${ns}, ${msg}`);
});

const i18nextOptions: InitOptions = {
  fallbackLng: "en",
  ns: ["message"],
  defaultNS: "message",
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

Deno.test("i18next", async () => {
  document.body.innerHTML = `
    <p id="p-1" x-text="$t('greeting', { name: 'morish000'})"></p>
    <p id="p-2" x-i18next-text="['greeting', { name: 'morish000'}]"></p>
    <button id="en" @click="$i18next().changeLanguage('en')">English</button>
    <button id="ja" @click="$i18next().changeLanguage('ja')">Japanese</button>
  `;
  await new Promise((resolve) => setTimeout(resolve, 1));

  const p1 = document.getElementById("p-1") as HTMLElement;
  const p2 = document.getElementById("p-2") as HTMLElement;
  const en = document.getElementById("en") as HTMLInputElement;
  const ja = document.getElementById("ja") as HTMLInputElement;
  assertStrictEquals(p1.textContent, "Hello, morish000!");
  assertStrictEquals(p2.textContent, "Hello, morish000!");

  fireEvent.click(ja);
  await new Promise((resolve) => setTimeout(resolve, 1));
  assertStrictEquals(p1.textContent, "こんにちは, morish000!");
  assertStrictEquals(p2.textContent, "こんにちは, morish000!");

  fireEvent.click(en);
  await new Promise((resolve) => setTimeout(resolve, 1));
  assertStrictEquals(p1.textContent, "Hello, morish000!");
  assertStrictEquals(p2.textContent, "Hello, morish000!");

  document.body.innerHTML = "";
});
