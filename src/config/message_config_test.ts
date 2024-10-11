import { assertEquals } from "jsr:@std/assert";
import { formatMessageConfig } from "./message_config.ts";

Deno.test("formatMessageConfig correctly formats input with single and multiple messages", () => {
  const input = {
    valueMissing: "singleMessage",
    typeMismatch: ["message1", "message2"],
  };

  const expected = {
    valueMissing: ["singleMessage"],
    typeMismatch: ["message1", "message2"],
  };

  assertEquals(formatMessageConfig(input), expected);
});
