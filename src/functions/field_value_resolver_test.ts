import {
  assert,
  assertEquals,
  assertFalse,
  assertStrictEquals,
  assertThrows,
} from "jsr:@std/assert";
import { createFieldValueResolver } from "./field_value_resolver.ts";
// @deno-types="@types/jsdom"
import { JSDOM } from "jsdom";
import { fireEvent } from "@testing-library/dom";

const {
  window,
} = new JSDOM(
  "<!DOCTYPE html><html><body></body></html>",
);

const HTMLInputElementBackup = globalThis.HTMLInputElement;
const HTMLSelectElementBackup = globalThis.HTMLSelectElement;

const setup = () => {
  globalThis.HTMLInputElement = window.HTMLInputElement;
  globalThis.HTMLSelectElement = window.HTMLSelectElement;
};

const teardown = () => {
  globalThis.HTMLInputElement = HTMLInputElementBackup;
  globalThis.HTMLSelectElement = HTMLSelectElementBackup;
};

function createDummyElement(
  type: string = "text",
  name: string = "dummy",
): HTMLInputElement {
  const el = window.document.createElement("input");
  el.type = type;
  el.name = name;
  return el;
}

Deno.test("createFieldValueResolver - resolve()/isEmpty() with text input", () => {
  const { resolve, isEmpty } = createFieldValueResolver();
  const form = window.document.createElement("form");
  const el = createDummyElement();
  el.value = "test value";
  form.appendChild(el);
  assertStrictEquals(resolve(el), "test value");
  assertFalse(isEmpty(resolve(el)));
});

Deno.test("createFieldValueResolver - resolve() with checked radio input", () => {
  const { resolve, isEmpty } = createFieldValueResolver();
  const form = window.document.createElement("form");
  const el1 = createDummyElement("radio", "test");
  el1.value = "radio1";
  el1.checked = true;
  form.appendChild(el1);
  const el2 = createDummyElement("radio", "test");
  el2.value = "radio2";
  form.appendChild(el2);
  assertStrictEquals(resolve(el1), "radio1");
  assertFalse(isEmpty(resolve(el1)));
});

Deno.test("createFieldValueResolver - resolve() with unchecked radio input", () => {
  const { resolve, isEmpty } = createFieldValueResolver();
  const form = window.document.createElement("form");
  const el1 = createDummyElement("radio", "test");
  el1.value = "radio1";
  form.appendChild(el1);
  const el2 = createDummyElement("radio", "test");
  el2.value = "radio2";
  form.appendChild(el2);
  assertStrictEquals(resolve(el1), "");
  assert(isEmpty(resolve(el1)));
});

Deno.test("createFieldValueResolver - resolve() with multiple checked checkboxes", () => {
  const { resolve, isEmpty } = createFieldValueResolver();
  const form = window.document.createElement("form");
  const el1 = createDummyElement("checkbox", "test");
  el1.value = "1";
  el1.checked = true;
  const el2 = createDummyElement("checkbox", "test");
  el2.value = "2";
  el2.checked = true;
  form.appendChild(el1);
  form.appendChild(el2);
  assertEquals(resolve(el1), ["1", "2"]);
  assertFalse(isEmpty(resolve(el1)));
});

Deno.test("createFieldValueResolver - resolve() with unchecked checkboxes", () => {
  const { resolve, isEmpty } = createFieldValueResolver();
  const form = window.document.createElement("form");
  const el1 = createDummyElement("checkbox", "test");
  el1.value = "1";
  const el2 = createDummyElement("checkbox", "test");
  el2.value = "2";
  form.appendChild(el1);
  form.appendChild(el2);
  assertEquals(resolve(el1), []);
  assert(isEmpty(resolve(el1)));
});

Deno.test("createFieldValueResolver - resolve() with single selected file", () => {
  setup();

  const { resolve, isEmpty } = createFieldValueResolver();
  const form = window.document.createElement("form");
  const el = createDummyElement("file", "test");
  form.appendChild(el);

  const file = new File(["dummy content"], "example.txt", {
    type: "text/plain",
  });

  fireEvent.change(el, {
    target: { files: [file] },
  });

  assertStrictEquals(resolve(el).length, 1);
  assertStrictEquals((resolve(el)[0] as File).name, "example.txt");
  assertFalse(isEmpty(resolve(el)));

  teardown();
});

Deno.test("createFieldValueResolver - resolve() with multiple selected files", () => {
  setup();

  const { resolve, isEmpty } = createFieldValueResolver();
  const form = window.document.createElement("form");
  const el = createDummyElement("file", "test");
  el.multiple = true;
  form.appendChild(el);

  const file1 = new File(["dummy content 1"], "example1.txt", {
    type: "text/plain",
  });
  const file2 = new File(["dummy content 2"], "example2.txt", {
    type: "text/plain",
  });

  fireEvent.change(el, {
    target: { files: [file1, file2] },
  });

  assertStrictEquals(resolve(el).length, 2);
  assertStrictEquals((resolve(el)[0] as File).name, "example1.txt");
  assertStrictEquals((resolve(el)[1] as File).name, "example2.txt");
  assertFalse(isEmpty(resolve(el)));

  teardown();
});

Deno.test("createFieldValueResolver - resolve() with no selected file", () => {
  setup();

  const { resolve, isEmpty } = createFieldValueResolver();
  const form = window.document.createElement("form");
  const el = createDummyElement("file", "test");

  form.appendChild(el);
  assertStrictEquals(resolve(el).length, 0);
  assert(isEmpty(resolve(el)));

  teardown();
});

Deno.test("createFieldValueResolver - resolve() handles null file value gracefully", () => {
  setup();

  const { resolve, isEmpty } = createFieldValueResolver();
  const form = window.document.createElement("form");
  const el = createDummyElement("file", "test");

  fireEvent.change(el, {
    target: { files: null },
  });

  form.appendChild(el);
  assertStrictEquals(resolve(el).length, 0);
  assert(isEmpty(resolve(el)));

  teardown();
});

Deno.test("createFieldValueResolver - resolve() with select multiple and selections", () => {
  setup();

  const { resolve, isEmpty } = createFieldValueResolver();
  const form = window.document.createElement("form");
  const select = window.document.createElement("select");
  select.multiple = true;

  const option1 = window.document.createElement("option");
  option1.value = "option1";
  option1.selected = true;
  select.appendChild(option1);

  const option2 = window.document.createElement("option");
  option2.value = "option2";
  option2.selected = true;
  select.appendChild(option2);

  form.appendChild(select);
  assertEquals(resolve(select), ["option1", "option2"]);
  assertFalse(isEmpty(resolve(select)));

  teardown();
});

Deno.test("createFieldValueResolver - resolve() with select multiple and no selection", () => {
  setup();

  const { resolve, isEmpty } = createFieldValueResolver();
  const form = window.document.createElement("form");
  const select = window.document.createElement("select");
  select.multiple = true;

  const option1 = window.document.createElement("option");
  option1.value = "option1";
  select.appendChild(option1);

  const option2 = window.document.createElement("option");
  option2.value = "option2";
  select.appendChild(option2);

  form.appendChild(select);
  assertEquals(resolve(select), []);
  assert(isEmpty(resolve(select)));

  teardown();
});

Deno.test("createFieldValueResolver - resolve() with single select and selected option", () => {
  setup();

  const { resolve, isEmpty } = createFieldValueResolver();
  const form = window.document.createElement("form");
  const select = window.document.createElement("select");

  const option1 = window.document.createElement("option");
  option1.value = "option1";
  option1.selected = true;
  select.appendChild(option1);

  const option2 = window.document.createElement("option");
  option2.value = "option2";
  select.appendChild(option2);

  form.appendChild(select);
  assertStrictEquals(resolve(select), "option1");
  assertFalse(isEmpty(resolve(select)));

  teardown();
});

Deno.test("createFieldValueResolver - resolve() with single select and no selection", () => {
  setup();

  const { resolve, isEmpty } = createFieldValueResolver();
  const form = window.document.createElement("form");
  const select = window.document.createElement("select");

  form.appendChild(select);

  assertStrictEquals(resolve(select), "");
  assert(isEmpty(resolve(select)));

  teardown();
});

Deno.test("createFieldValueResolver - resolve() with textarea containing value", () => {
  const { resolve, isEmpty } = createFieldValueResolver();
  const form = window.document.createElement("form");
  const textarea = window.document.createElement("textarea");
  textarea.value = "Sample text";

  form.appendChild(textarea);
  assertStrictEquals(resolve(textarea), "Sample text");
  assertFalse(isEmpty(resolve(textarea)));
});

Deno.test("createFieldValueResolver - resolve() with empty textarea", () => {
  const { resolve, isEmpty } = createFieldValueResolver();
  const form = window.document.createElement("form");
  const textarea = window.document.createElement("textarea");

  form.appendChild(textarea);
  assertStrictEquals(resolve(textarea), "");
  assert(isEmpty(resolve(textarea)));
});

Deno.test("createFieldValueResolver - resolve() throws error for radio without form", () => {
  const { resolve } = createFieldValueResolver();
  const el = createDummyElement();
  el.type = "radio";
  assertThrows(
    () => {
      resolve(el);
    },
    Error,
    "A form element is required.",
  );
});

Deno.test("createFieldValueResolver - resolve() throws error for checkbox without form", () => {
  const { resolve } = createFieldValueResolver();
  const el = createDummyElement();
  el.type = "checkbox";
  assertThrows(
    () => {
      resolve(el);
    },
    Error,
    "A form element is required.",
  );
});
