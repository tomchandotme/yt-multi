import { describe, expect, test } from "bun:test";
import { parseOEmbedTitle } from "./youtube";

describe("parseOEmbedTitle", () => {
	test("reads a non-empty title string", () => {
		expect(parseOEmbedTitle({ title: "  LEC vs LCK  " })).toBe("LEC vs LCK");
	});

	test("rejects missing or blank titles", () => {
		expect(parseOEmbedTitle(null)).toBeNull();
		expect(parseOEmbedTitle({})).toBeNull();
		expect(parseOEmbedTitle({ title: 1 })).toBeNull();
		expect(parseOEmbedTitle({ title: "   " })).toBeNull();
	});
});
