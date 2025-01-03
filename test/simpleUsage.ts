import { JSDOM } from "jsdom";
import { fireEvent } from "@testing-library/dom";
import {
  createValidatePluginDefault,
} from "../src/alpinejs_form_validate_plugin";

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
      <title>Simple Usage</title>
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

Alpine.plugin(createValidatePluginDefault);
Alpine.start();
await waitAlpineInitialized();

test("Required Check for Text", async () => {
  document.body.innerHTML = `
  <form x-validate-form autocomplete="off" novalidate>
    <input id="text-1" name="text-1" type="text" required
      x-validate="{
        onInput: true,
        m: {
          valueMissing: \`\${$el.name} is required\`,
        }
      }" />
    <p id="p-1" x-validate-message-for="#text-1"></p>
    <input id="submit" type="submit" value="Submit" />
  </form>
  `;
  await new Promise((resolve) => setTimeout(resolve, 1));

  const text1 = document.getElementById("text-1") as HTMLInputElement;
  const p1 = document.getElementById("p-1") as HTMLElement;
  const submit = document.getElementById("submit") as HTMLElement;

  fireEvent.click(submit);
  await new Promise((resolve) => setTimeout(resolve, 1));
  expect(text1.validationMessage).toBe("text-1 is required");
  expect(p1.textContent).toBe("text-1 is required");
  expect(text1.validity.valid).toBe(false);

  fireEvent.input(text1, {
    target: { value: "test" },
  });
  await new Promise((resolve) => setTimeout(resolve, 1));
  expect(text1.validationMessage).toBe("");
  expect(p1.textContent).toBe("");
  expect(text1.validity.valid);

  document.body.innerHTML = "";
});

test("Required Check for Text Area", async () => {
  document.body.innerHTML = `
  <form x-validate-form autocomplete="off" novalidate>
    <textarea id="text-1" name="text-1" required
      x-validate="{
        m: {
          valueMissing: \`\${$el.name} is required\`,
        }
      }"></textarea>
    <p id="p-1" x-validate-message-for="#text-1"></p>
    <input id="submit" type="submit" value="Submit" />
  </form>
  `;
  await new Promise((resolve) => setTimeout(resolve, 1));

  const text1 = document.getElementById("text-1") as HTMLInputElement;
  const p1 = document.getElementById("p-1") as HTMLElement;
  const submit = document.getElementById("submit") as HTMLElement;

  fireEvent.click(submit);
  await new Promise((resolve) => setTimeout(resolve, 1));
  expect(text1.validationMessage).toBe("text-1 is required");
  expect(p1.textContent).toBe("text-1 is required");
  expect(text1.validity.valid).toBe(false);

  fireEvent.change(text1, {
    target: { value: "test" },
  });
  await new Promise((resolve) => setTimeout(resolve, 1));
  expect(text1.validationMessage).toBe("");
  expect(p1.textContent).toBe("");
  expect(text1.validity.valid);

  document.body.innerHTML = "";
});

test("Required Check for Radio Buttons", async () => {
  document.body.innerHTML = `
  <form x-validate-form autocomplete="off" novalidate>
    <input id="radio-1" name="radio-1" type="radio" value="radio-1" required
      x-validate="{
        m: {
          valueMissing: \`\${$el.name} is required\`,
        }
      }" />
    <input id="radio-2" name="radio-1" type="radio" value="radio-2" />
    <p id="p-1" x-validate-message-for="#radio-1"></p>
    <input id="submit" type="submit" value="Submit" />
  </form>
  `;
  await new Promise((resolve) => setTimeout(resolve, 1));

  const radio1 = document.getElementById("radio-1") as HTMLInputElement;
  const radio2 = document.getElementById("radio-2") as HTMLInputElement;
  const p1 = document.getElementById("p-1") as HTMLElement;
  const submit = document.getElementById("submit") as HTMLElement;

  fireEvent.click(submit);
  await new Promise((resolve) => setTimeout(resolve, 1));
  expect(radio1.validationMessage).toBe("radio-1 is required");
  expect(p1.textContent).toBe("radio-1 is required");
  expect(radio1.validity.valid).toBe(false);

  fireEvent.change(radio2, {
    target: { checked: true },
  });
  await new Promise((resolve) => setTimeout(resolve, 1));
  expect(radio1.validationMessage).toBe("");
  expect(p1.textContent).toBe("");
  expect(radio1.validity.valid);

  document.body.innerHTML = "";
});

test("File Size Check (multiple=false)", async () => {
  document.body.innerHTML = `
  <form x-validate-form autocomplete="off" novalidate>
    <input id="file-1" name="file-1" type="file"
      x-validate="{
        v: {
          validate_1: [(el, value) => value.length == 1 && value[0].size < 256, 'Please select a file smaller than 256 bytes'],
        },
      }" />
    <p id="p-1" x-validate-message-for="#file-1"></p>
    <input id="submit" type="submit" value="Submit" />
  </form>
  `;
  await new Promise((resolve) => setTimeout(resolve, 1));

  const file1 = document.getElementById("file-1") as HTMLInputElement;
  const p1 = document.getElementById("p-1") as HTMLElement;
  const submit = document.getElementById("submit") as HTMLElement;

  let file = new File([new Uint8Array(256)], "example.txt", {
    type: "text/plain",
  });

  fireEvent.change(file1, {
    target: { files: [file] },
  });

  fireEvent.click(submit);
  await new Promise((resolve) => setTimeout(resolve, 1));

  expect(
    file1.validationMessage).toBe(
      "Please select a file smaller than 256 bytes",
    );
  expect(
    p1.textContent).toBe(
      "Please select a file smaller than 256 bytes",
    );
  expect(file1.validity.valid).toBe(false);

  file = new File([new Uint8Array(255)], "example.txt", {
    type: "text/plain",
  });

  fireEvent.change(file1, {
    target: { files: [file] },
  });
  await new Promise((resolve) => setTimeout(resolve, 1));

  expect(file1.validationMessage).toBe("");
  expect(p1.textContent).toBe("");
  expect(file1.validity.valid);

  document.body.innerHTML = "";
});

test("SELECT (multiple=true) - Require more than two selections", async () => {
  document.body.innerHTML = `
  <form x-validate-form autocomplete="off" novalidate>
  <select id="select-1" name="select-1" multiple required
      x-validate="{
        v: {
          validate: [(el, value) => value.length > 1, 'Please select at least two options'],
        },
        m: {
          valueMissing: 'Please select at least two options'
        }
      }">
      <option value="check-1">Option 1</option>
      <option value="check-2">Option 2</option>
      <option value="check-3">Option 3</option>
    </select>
    <p id="p-1" x-validate-message-for="#select-1"></p>
    <input id="submit" type="submit" value="Submit" />
  </form>
  `;
  await new Promise((resolve) => setTimeout(resolve, 1));

  const select1 = document.getElementById("select-1") as HTMLSelectElement;
  const p1 = document.getElementById("p-1") as HTMLElement;
  const submit = document.getElementById("submit") as HTMLElement;

  fireEvent.click(submit);
  await new Promise((resolve) => setTimeout(resolve, 1));
  expect(
    select1.validationMessage).toBe(
      "Please select at least two options",
    );
  expect(
    p1.textContent).toBe(
      "Please select at least two options",
    );
  expect(select1.validity.valid).toBe(false);

  select1.options[0].selected = true;
  fireEvent.change(select1);
  await new Promise((resolve) => setTimeout(resolve, 1));
  expect(
    select1.validationMessage).toBe(
      "Please select at least two options",
    );
  expect(
    p1.textContent).toBe(
      "Please select at least two options",
    );
  expect(select1.validity.valid).toBe(false);

  select1.options[1].selected = true;
  fireEvent.change(select1);
  await new Promise((resolve) => setTimeout(resolve, 1));
  expect(
    select1.validationMessage).toBe(
      "",
    );
  expect(
    p1.textContent).toBe(
      "",
    );
  expect(select1.validity.valid);

  document.body.innerHTML = "";
});

test("Checkbox Example - Require more than two selections", async () => {
  document.body.innerHTML = `
  <form x-validate-form autocomplete="off" novalidate>
    <input id="check-1" name="check-1" value="check-1" type="checkbox" required
      x-validate="{
        v: {
          validate: [(el, value) => value.length > 1, 'Please select at least two options'],
        },
        m: {
          valueMissing: 'Please select at least two options'
        }
      }" />
    <input id="check-2" name="check-1" value="check-2" type="checkbox" />
    <p id="p-1" x-validate-message-for="#check-1"></p>
    <input id="submit" type="submit" value="Submit" />
  </form>
  `;
  await new Promise((resolve) => setTimeout(resolve, 1));

  const check1 = document.getElementById("check-1") as HTMLInputElement;
  const check2 = document.getElementById("check-2") as HTMLInputElement;
  const p1 = document.getElementById("p-1") as HTMLElement;
  const submit = document.getElementById("submit") as HTMLElement;

  fireEvent.click(submit);
  await new Promise((resolve) => setTimeout(resolve, 1));
  expect(
    check1.validationMessage).toBe(
      "Please select at least two options",
    );
  expect(
    p1.textContent).toBe(
      "Please select at least two options",
    );
  expect(check1.validity.valid).toBe(false);

  fireEvent.change(check1, {
    target: {
      checked: true,
    },
  });
  await new Promise((resolve) => setTimeout(resolve, 1));
  expect(
    check1.validationMessage).toBe(
      "Please select at least two options",
    );
  expect(
    p1.textContent).toBe(
      "Please select at least two options",
    );
  expect(check1.validity.valid).toBe(false);

  fireEvent.change(check2, {
    target: {
      checked: true,
    },
  });
  await new Promise((resolve) => setTimeout(resolve, 1));
  expect(
    check1.validationMessage).toBe(
      "",
    );
  expect(
    p1.textContent).toBe(
      "",
    );
  expect(check1.validity.valid);

  document.body.innerHTML = "";
});
