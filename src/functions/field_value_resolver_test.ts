import { JSDOM } from "jsdom";
import { fireEvent } from "@testing-library/dom";
import { createFieldValueResolver } from "./field_value_resolver";

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

test("createFieldValueResolver - resolve()/isEmpty() with text input", () => {
  const { resolve, isEmpty } = createFieldValueResolver();
  const form = window.document.createElement("form");
  const el = createDummyElement();
  el.value = "test value";
  form.appendChild(el);
  expect(resolve(el)).toBe("test value");
  expect(isEmpty(resolve(el))).toBe(false);
});

test("createFieldValueResolver - resolve() with checked radio input", () => {
  const { resolve, isEmpty } = createFieldValueResolver();
  const form = window.document.createElement("form");
  const el1 = createDummyElement("radio", "test");
  el1.value = "radio1";
  el1.checked = true;
  form.appendChild(el1);
  const el2 = createDummyElement("radio", "test");
  el2.value = "radio2";
  form.appendChild(el2);
  expect(resolve(el1)).toBe("radio1");
  expect(isEmpty(resolve(el1))).toBe(false);
});

test("createFieldValueResolver - resolve() with unchecked radio input", () => {
  const { resolve, isEmpty } = createFieldValueResolver();
  const form = window.document.createElement("form");
  const el1 = createDummyElement("radio", "test");
  el1.value = "radio1";
  form.appendChild(el1);
  const el2 = createDummyElement("radio", "test");
  el2.value = "radio2";
  form.appendChild(el2);
  expect(resolve(el1)).toBe("");
  expect(isEmpty(resolve(el1)));
});

test("createFieldValueResolver - resolve() with multiple checked checkboxes", () => {
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
  expect(resolve(el1)).toEqual(["1", "2"]);
  expect(isEmpty(resolve(el1))).toBe(false);
});

test("createFieldValueResolver - resolve() with unchecked checkboxes", () => {
  const { resolve, isEmpty } = createFieldValueResolver();
  const form = window.document.createElement("form");
  const el1 = createDummyElement("checkbox", "test");
  el1.value = "1";
  const el2 = createDummyElement("checkbox", "test");
  el2.value = "2";
  form.appendChild(el1);
  form.appendChild(el2);
  expect(resolve(el1)).toEqual([]);
  expect(isEmpty(resolve(el1)));
});

test("createFieldValueResolver - resolve() with single selected file", () => {
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

  expect(resolve(el).length).toBe(1);
  expect((resolve(el)[0] as File).name).toBe("example.txt");
  expect(isEmpty(resolve(el))).toBe(false);

  teardown();
});

test("createFieldValueResolver - resolve() with multiple selected files", () => {
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

  expect(resolve(el).length).toBe(2);
  expect((resolve(el)[0] as File).name).toBe("example1.txt");
  expect((resolve(el)[1] as File).name).toBe("example2.txt");
  expect(isEmpty(resolve(el))).toBe(false);

  teardown();
});

test("createFieldValueResolver - resolve() with no selected file", () => {
  setup();

  const { resolve, isEmpty } = createFieldValueResolver();
  const form = window.document.createElement("form");
  const el = createDummyElement("file", "test");

  form.appendChild(el);
  expect(resolve(el).length).toBe(0);
  expect(isEmpty(resolve(el)));

  teardown();
});

test("createFieldValueResolver - resolve() handles null file value gracefully", () => {
  setup();

  const { resolve, isEmpty } = createFieldValueResolver();
  const form = window.document.createElement("form");
  const el = createDummyElement("file", "test");

  fireEvent.change(el, {
    target: { files: null },
  });

  form.appendChild(el);
  expect(resolve(el).length).toBe(0);
  expect(isEmpty(resolve(el)));

  teardown();
});

test("createFieldValueResolver - resolve() with select multiple and selections", () => {
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
  expect(resolve(select)).toEqual(["option1", "option2"]);
  expect(isEmpty(resolve(select))).toBe(false);

  teardown();
});

test("createFieldValueResolver - resolve() with select multiple and no selection", () => {
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
  expect(resolve(select)).toEqual([]);
  expect(isEmpty(resolve(select)));

  teardown();
});

test("createFieldValueResolver - resolve() with single select and selected option", () => {
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
  expect(resolve(select)).toBe("option1");
  expect(isEmpty(resolve(select))).toBe(false);

  teardown();
});

test("createFieldValueResolver - resolve() with single select and no selection", () => {
  setup();

  const { resolve, isEmpty } = createFieldValueResolver();
  const form = window.document.createElement("form");
  const select = window.document.createElement("select");

  form.appendChild(select);

  expect(resolve(select)).toBe("");
  expect(isEmpty(resolve(select)));

  teardown();
});

test("createFieldValueResolver - resolve() with textarea containing value", () => {
  const { resolve, isEmpty } = createFieldValueResolver();
  const form = window.document.createElement("form");
  const textarea = window.document.createElement("textarea");
  textarea.value = "Sample text";

  form.appendChild(textarea);
  expect(resolve(textarea)).toBe("Sample text");
  expect(isEmpty(resolve(textarea))).toBe(false);
});

test("createFieldValueResolver - resolve() with empty textarea", () => {
  const { resolve, isEmpty } = createFieldValueResolver();
  const form = window.document.createElement("form");
  const textarea = window.document.createElement("textarea");

  form.appendChild(textarea);
  expect(resolve(textarea)).toBe("");
  expect(isEmpty(resolve(textarea)));
});

test("createFieldValueResolver - resolve() throws error for radio without form", () => {
  const { resolve } = createFieldValueResolver();
  const el = createDummyElement();
  el.type = "radio";
  expect(
    () => {
      resolve(el);
    }).toThrow(
      "A form element is required.",
    );
});

test("createFieldValueResolver - resolve() throws error for checkbox without form", () => {
  const { resolve } = createFieldValueResolver();
  const el = createDummyElement();
  el.type = "checkbox";
  expect(
    () => {
      resolve(el);
    }).toThrow(
      "A form element is required.",
    );
});
