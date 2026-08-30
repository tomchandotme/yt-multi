import { describe, expect, test } from "bun:test";
import { parseTwitchTitle } from "./twitch";

describe("parseTwitchTitle", () => {
	test("reads a non-empty title string", () => {
		expect(parseTwitchTitle("  ranked grind  ")).toBe("ranked grind");
	});

	test("rejects missing, blank, or not-found responses", () => {
		expect(parseTwitchTitle("")).toBeNull();
		expect(parseTwitchTitle("   ")).toBeNull();
		expect(parseTwitchTitle("User not found: nope")).toBeNull();
	});
});
