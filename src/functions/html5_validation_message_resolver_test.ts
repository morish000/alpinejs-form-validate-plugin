import { JSDOM } from "jsdom";
import {
  createHtml5ValidationMessageResolver,
} from "./html5_validation_message_resolver";

const {
  window,
} = new JSDOM(
  "<!DOCTYPE html><html><body></body></html>",
);

function createDummyElement(
  type: string = "text",
  name: string = "dummy",
): HTMLInputElement {
  const el = window.document.createElement("input");
  el.type = type;
  el.name = name;
  return el;
}

test("createHtml5ValidationMessageResolver - Returns null for a valid element", () => {
  const resolver = createHtml5ValidationMessageResolver();
  const el = createDummyElement();
  el.checkValidity = () => true;
  const messages = {};
  expect(resolver(el, messages)).toBe(null);
});

test("createHtml5ValidationMessageResolver - Uses custom validation message when no message resource is found", () => {
  const resolver = createHtml5ValidationMessageResolver();
  const el = createDummyElement();
  el.setCustomValidity("test");
  const messages = {};
  expect(resolver(el, messages)).toEqual(["test"]);
});

test("createHtml5ValidationMessageResolver - Returns configured message for an invalid element", () => {
  const resolver = createHtml5ValidationMessageResolver();
  const el = createDummyElement();

  el.required = true;

  const messages = { valueMissing: ["Value is missing"] };

  expect(resolver(el, messages)).toEqual(["Value is missing"]);
});
