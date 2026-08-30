import { describe, expect, test } from "bun:test";
import { attemptAdd } from "./youtube";

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
