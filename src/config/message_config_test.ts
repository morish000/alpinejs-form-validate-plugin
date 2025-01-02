import { formatMessageConfig } from "./message_config";

test("formatMessageConfig correctly formats input with single and multiple messages", () => {
  const input = {
    valueMissing: "singleMessage",
    typeMismatch: ["message1", "message2"],
  };

  const expected = {
    valueMissing: ["singleMessage"],
    typeMismatch: ["message1", "message2"],
  };

  expect(formatMessageConfig(input)).toEqual(expected)
});
