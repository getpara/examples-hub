import { simulateVerifyToken } from "../../utils/auth-utils";
import { expect, test } from "bun:test";

test("Valid token with correct prefix and email", () => {
  const token = "SIMULATED.user@example.com";
  const result = simulateVerifyToken(token);
  expect(result).toEqual({ email: "user@example.com" });
});

test("Invalid token prefix", () => {
  const token = "INVALID.user@example.com";
  const result = simulateVerifyToken(token);
  expect(result).toBeNull();
});

test("Missing email in token", () => {
  const token = "SIMULATED.";
  const result = simulateVerifyToken(token);
  expect(result).toBeNull();
});

test("Empty token", () => {
  const token = "";
  const result = simulateVerifyToken(token);
  expect(result).toBeNull();
});

test("Invalid token format without separator", () => {
  const token = "SIMULATED-user@example.com";
  const result = simulateVerifyToken(token);
  expect(result).toBeNull();
});

test("Null token input", () => {
  const token = null as unknown as string;
  const result = simulateVerifyToken(token);
  expect(result).toBeNull();
});
