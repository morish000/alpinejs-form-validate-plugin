import { merge } from "./merge";

test("merge: deeply merges objects", () => {
  const obj1 = { a: 1, b: { c: 2 } };
  const obj2 = { b: { d: 3 }, e: 4 };

  const result = merge<{ [key: string]: any }>(obj1, obj2);

  expect(result.a).toBe(1);
  expect(result.b.c).toBe(2);
  expect(result.b.d).toBe(3);
  expect(result.e).toBe(4);
});

test("merge: does not override with undefined", () => {
  const obj1 = { a: 1, b: { c: 2 } };
  const obj2 = { a: undefined, b: undefined };

  const result = merge<{ [key: string]: any }>(obj1, obj2);

  expect(result.a).toBe(1);
  expect(result.b.c).toBe(2);
});

test("merge: does not override with null", () => {
  const obj1 = { a: 1, b: { c: 2 } };
  const obj2 = { a: null, b: null };

  const result = merge<{ [key: string]: any }>(obj1, obj2);

  expect(result.a).toBe(1);
  expect(result.b.c).toBe(2);
});

test("merge: maintains original values with empty override", () => {
  const obj1 = { a: 1, b: { c: 2 } };
  const obj2 = {};

  const result = merge<{ [key: string]: any }>(obj1, obj2);

  expect(result.a).toBe(1);
  expect(result.b.c).toBe(2);
});

test("merge: merges multiple objects sequentially", () => {
  const obj1 = { a: 1 };
  const obj2 = { b: 2 };
  const obj3 = { c: 3 };

  const result = merge<{ [key: string]: any }>(obj1, obj2, obj3);

  expect(result.a).toBe(1);
  expect(result.b).toBe(2);
  expect(result.c).toBe(3);
});

test("merge: overrides functions correctly", () => {
  const f1a = () => "1a";
  const f1b = () => "1b";
  const f2a = () => "2a";
  const f2c = () => "2c";
  const obj1 = { a: f1a, b: f1b };
  const obj2 = { a: f2a, c: f2c };

  const result = merge<{ [key: string]: any }>(obj1, obj2);

  expect(result.a()).toBe("2a");
  expect(result.b()).toBe("1b");
  expect(result.c()).toBe("2c");
});
