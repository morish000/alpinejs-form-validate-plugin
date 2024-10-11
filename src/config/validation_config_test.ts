import { assertEquals, assertThrows } from "jsr:@std/assert";
import { formatValidationConfig } from "./validation_config.ts";
import type { ValidatorFunction } from "../types/config_types.ts";

const trueValidator: ValidatorFunction = (_el, _value) => {
  return true;
};

Deno.test("formatValidationConfig transforms abbreviated format to full format", () => {
  const input = {
    key1: [trueValidator, "message1"],
    key2: [trueValidator, ["message2a", "message2b"]],
    key3: "message3",
    key4: ["message4a", "message4b"],
    key5: {
      v: trueValidator,
      m: "message5",
    },
    key6: {
      v: { validate6a: "validate6a" },
      m: ["messag6a", "message6b"],
    },
    key7: {
      v: ["validate7a", "validate7b"],
      m: ["message7a", "message7b"],
    },
    key8: {
      m: ["message8a", "message8b"],
    },
  };

  const expected = {
    key1: { v: trueValidator, m: ["message1"] },
    key2: { v: trueValidator, m: ["message2a", "message2b"] },
    key3: { v: [], m: ["message3"] },
    key4: { v: [], m: ["message4a", "message4b"] },
    key5: { v: trueValidator, m: ["message5"] },
    key6: {
      v: [{ validate6a: "validate6a" }],
      m: ["messag6a", "message6b"],
    },
    key7: {
      v: ["validate7a", "validate7b"],
      m: ["message7a", "message7b"],
    },
    key8: {
      v: [],
      m: ["message8a", "message8b"],
    },
  };

  assertEquals(formatValidationConfig(input), expected);
});

Deno.test("formatValidationConfig throws error for missing messages", () => {
  // Testing because the type definition should error when 'm' is missing, but it doesn't.
  const input = {
    key1: {
      v: [],
    },
  };

  assertThrows(
    () => formatValidationConfig(input),
    Error,
    "Message undefined. validation key: key1",
  );
});
