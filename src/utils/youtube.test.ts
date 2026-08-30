import { describe, expect, test } from "bun:test";
import { addStream, attemptAdd, moveStream, parseOEmbedTitle } from "./youtube";

const VALID_ID = "dQw4w9WgXcQ";

describe("attemptAdd", () => {
	test("empty", () => {
		expect(attemptAdd("", [])).toEqual({ kind: "empty" });
		expect(attemptAdd("   ", [])).toEqual({ kind: "empty" });
	});

	test("raw 11-char id", () => {
		expect(attemptAdd(VALID_ID, [])).toEqual({ kind: "ok", videoId: VALID_ID });
	});

	test("youtu.be", () => {
		expect(attemptAdd(`https://youtu.be/${VALID_ID}`, [])).toEqual({
			kind: "ok",
			videoId: VALID_ID,
		});
	});

	test("youtube.com watch URL", () => {
		expect(attemptAdd(`https://www.youtube.com/watch?v=${VALID_ID}`, [])).toEqual({
			kind: "ok",
			videoId: VALID_ID,
		});
	});

	test("live URL", () => {
		expect(attemptAdd(`https://www.youtube.com/live/${VALID_ID}`, [])).toEqual({
			kind: "ok",
			videoId: VALID_ID,
		});
	});

	test("invalid", () => {
		expect(attemptAdd("https://example.com/watch?v=nope", [])).toEqual({ kind: "invalid" });
		expect(attemptAdd("not a link", [])).toEqual({ kind: "invalid" });
	});

	test("duplicate", () => {
		expect(attemptAdd(VALID_ID, [VALID_ID])).toEqual({
			kind: "duplicate",
			videoId: VALID_ID,
		});
		expect(attemptAdd(`https://youtu.be/${VALID_ID}`, [VALID_ID])).toEqual({
			kind: "duplicate",
			videoId: VALID_ID,
		});
	});
});

describe("addStream", () => {
	test("skip-invalid returns the same array", () => {
		const existing = [VALID_ID];
		expect(addStream(existing, "")).toBe(existing);
		expect(addStream(existing, "not a link")).toBe(existing);
	});

	test("skip-duplicate returns the same array", () => {
		const existing = [VALID_ID];
		expect(addStream(existing, VALID_ID)).toBe(existing);
		expect(addStream(existing, `https://youtu.be/${VALID_ID}`)).toBe(existing);
	});

	test("append", () => {
		expect(addStream([], VALID_ID)).toEqual([VALID_ID]);
		expect(addStream(["aaaaaaaaaaa"], VALID_ID)).toEqual(["aaaaaaaaaaa", VALID_ID]);
	});
});

describe("moveStream", () => {
	const a = "aaaaaaaaaaa";
	const b = "bbbbbbbbbbb";
	const c = "ccccccccccc";

	test("swaps by index", () => {
		expect(moveStream([a, b, c], 0, 2)).toEqual([b, c, a]);
		expect(moveStream([a, b, c], 2, 0)).toEqual([c, a, b]);
	});

	test("same index returns the same array", () => {
		const existing = [a, b];
		expect(moveStream(existing, 0, 0)).toBe(existing);
	});

	test("out of range returns the same array", () => {
		const existing = [a, b];
		expect(moveStream(existing, -1, 0)).toBe(existing);
		expect(moveStream(existing, 0, 2)).toBe(existing);
		expect(moveStream(existing, 2, 0)).toBe(existing);
	});
});

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
