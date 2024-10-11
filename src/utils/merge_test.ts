// deno-lint-ignore-file no-explicit-any
import { merge } from "./merge.ts";
import { assertStrictEquals } from "jsr:@std/assert";

Deno.test("merge: deeply merges objects", () => {
  const obj1 = { a: 1, b: { c: 2 } };
  const obj2 = { b: { d: 3 }, e: 4 };

  const result = merge<{ [key: string]: any }>(obj1, obj2);

  assertStrictEquals(result.a, 1);
  assertStrictEquals(result.b.c, 2);
  assertStrictEquals(result.b.d, 3);
  assertStrictEquals(result.e, 4);
});

Deno.test("merge: does not override with undefined", () => {
  const obj1 = { a: 1, b: { c: 2 } };
  const obj2 = { a: undefined, b: undefined };

  const result = merge<{ [key: string]: any }>(obj1, obj2);

  assertStrictEquals(result.a, 1);
  assertStrictEquals(result.b.c, 2);
});

Deno.test("merge: does not override with null", () => {
  const obj1 = { a: 1, b: { c: 2 } };
  const obj2 = { a: null, b: null };

  const result = merge<{ [key: string]: any }>(obj1, obj2);

  assertStrictEquals(result.a, 1);
  assertStrictEquals(result.b.c, 2);
});

Deno.test("merge: maintains original values with empty override", () => {
  const obj1 = { a: 1, b: { c: 2 } };
  const obj2 = {};

  const result = merge<{ [key: string]: any }>(obj1, obj2);

  assertStrictEquals(result.a, 1);
  assertStrictEquals(result.b.c, 2);
});

Deno.test("merge: merges multiple objects sequentially", () => {
  const obj1 = { a: 1 };
  const obj2 = { b: 2 };
  const obj3 = { c: 3 };

  const result = merge<{ [key: string]: any }>(obj1, obj2, obj3);

  assertStrictEquals(result.a, 1);
  assertStrictEquals(result.b, 2);
  assertStrictEquals(result.c, 3);
});

Deno.test("merge: overrides functions correctly", () => {
  const f1a = () => "1a";
  const f1b = () => "1b";
  const f2a = () => "2a";
  const f2c = () => "2c";
  const obj1 = { a: f1a, b: f1b };
  const obj2 = { a: f2a, c: f2c };

  const result = merge<{ [key: string]: any }>(obj1, obj2);

  assertStrictEquals(result.a(), "2a");
  assertStrictEquals(result.b(), "1b");
  assertStrictEquals(result.c(), "2c");
});
