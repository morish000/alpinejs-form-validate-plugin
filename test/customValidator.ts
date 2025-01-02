import type { ValidateFunctions } from "../src/types/functions_types.ts";
import { JSDOM } from "jsdom";
import { fireEvent } from "@testing-library/dom";
import validator from "validator";
import { createCustomFieldValidator } from "../src/functions/index";
import { createValidatePlugin } from "../src/alpinejs_form_validate_plugin";

const {
  window,
  window: {
    document,
    CustomEvent,
    MutationObserver,
    HTMLInputElement,
    HTMLSelectElement,
  },
} = new JSDOM(
  `<!DOCTYPE html>
  <html>
    <head>
      <title>Custom Validator</title>
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
globalThis.HTMLInputElement = HTMLInputElement;
globalThis.HTMLSelectElement = HTMLSelectElement;

// const { default: Alpine } = await import("alpinejs");
// This workaround is necessary to ensure compatibility when running with Jest
const Alpine = ((await import("alpinejs")) as unknown as any).Alpine;

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

Alpine.plugin(createValidatePlugin({
  defaultFunctionsOptions: {
    customFieldValidators: [
      createCustomFieldValidator(validator as unknown as ValidateFunctions),
      createCustomFieldValidator({
        maxFileSize: (value: any, size) =>
          value.length == 1 && value[0].size < size,
      }),
    ],
  },
}));
Alpine.start();
await waitAlpineInitialized();

test("custom validators", async () => {
  document.body.innerHTML = `
    <form x-validate-form autocomplete="off" novalidate>
      <input id="text-1" name="text-1" type="text" required x-validate="{
          onInput: true,
          v: {
            contains: {
              v: ['abc', { ignoreCase: true}],
              m: 'Please include \\\'abc\\\'.'
            }
          },
          m: {
            valueMissing: \`\${$el.name} is required\`,
          }
        }" />
      <p id="p-1" x-validate-message-for="#text-1"></p>
      <input id="text-2" name="text-2" type="text" required x-validate="{
          onInput: true,
          v: {
            isUppercase: 'Please enter in uppercase.'
          },
          m: {
            valueMissing: \`\${$el.name} is required\`,
          }
        }" />
      <p id="p-2" x-validate-message-for="#text-2"></p>
      <input id="file-1" name="file-1" type="file" x-validate="{
          v: {
            maxFileSize: {
              v : 256,
              m : 'Please select a file smaller than 256 bytes'
            }
          }
        }" />
      <p id="p-3" x-validate-message-for="#file-1"></p>
      <input id="submit" type="submit" value="Submit" />
    </form>
  `;
  await new Promise((resolve) => setTimeout(resolve, 1));

  const text1 = document.getElementById("text-1") as HTMLInputElement;
  const text2 = document.getElementById("text-2") as HTMLInputElement;
  const file1 = document.getElementById("file-1") as HTMLInputElement;
  const p1 = document.getElementById("p-1") as HTMLElement;
  const p2 = document.getElementById("p-2") as HTMLElement;
  const p3 = document.getElementById("p-3") as HTMLElement;
  const submit = document.getElementById("submit") as HTMLElement;

  fireEvent.click(submit);
  await new Promise((resolve) => setTimeout(resolve, 1));
  expect(text1.validationMessage).toBe("text-1 is required");
  expect(p1.textContent).toBe("text-1 is required");
  expect(text2.validationMessage).toBe("text-2 is required");
  expect(p2.textContent).toBe("text-2 is required");
  expect(file1.validationMessage).toBe("");
  expect(p3.textContent).toBe("");
  expect(text1.validity.valid).toBe(false);
  expect(text2.validity.valid).toBe(false);
  expect(file1.validity.valid);

  fireEvent.input(text1, {
    target: { value: "a" },
  });
  fireEvent.input(text2, {
    target: { value: "a" },
  });

  let file = new File([new Uint8Array(256)], "example.txt", {
    type: "text/plain",
  });

  fireEvent.change(file1, {
    target: { files: [file] },
  });

  await new Promise((resolve) => setTimeout(resolve, 1));
  expect(text1.validationMessage).toBe("Please include 'abc'.");
  expect(p1.textContent).toBe("Please include 'abc'.");
  expect(text2.validationMessage).toBe("Please enter in uppercase.");
  expect(p2.textContent).toBe("Please enter in uppercase.");
  expect(
    file1.validationMessage).toBe(
      "Please select a file smaller than 256 bytes",
    );
  expect(
    p3.textContent).toBe(
      "Please select a file smaller than 256 bytes",
    );
  expect(text1.validity.valid).toBe(false);
  expect(text2.validity.valid).toBe(false);
  expect(file1.validity.valid).toBe(false);

  fireEvent.input(text1, {
    target: { value: "-abc-" },
  });
  fireEvent.input(text2, {
    target: { value: "ABC" },
  });

  file = new File([new Uint8Array(255)], "example.txt", {
    type: "text/plain",
  });

  fireEvent.change(file1, {
    target: { files: [file] },
  });

  await new Promise((resolve) => setTimeout(resolve, 1));

  expect(text1.validationMessage).toBe("");
  expect(p1.textContent).toBe("");
  expect(text2.validationMessage).toBe("");
  expect(p2.textContent).toBe("");
  expect(
    file1.validationMessage).toBe(
      "",
    );
  expect(p3.textContent).toBe("");
  expect(text1.validity.valid);
  expect(text2.validity.valid);
  expect(file1.validity.valid);

  document.body.innerHTML = "";
});
