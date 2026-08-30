import { describe, expect, test } from "bun:test";
import {
	addStream,
	attemptAdd,
	isStream,
	moveStream,
	parseStream,
} from "./stream";

const VALID_ID = "dQw4w9WgXcQ";
const yt = { kind: "youtube" as const, id: VALID_ID };

describe("parseStream", () => {
	test("youtube urls", () => {
		expect(parseStream(VALID_ID)).toEqual(yt);
		expect(parseStream(`https://youtu.be/${VALID_ID}`)).toEqual(yt);
		expect(parseStream("https://twitch.tv/twitch")).toBeNull();
		expect(parseStream("https://www.bilibili.com/video/BV1B7411m7LV")).toBeNull();
	});
});

describe("isStream", () => {
	test("accepts youtube only", () => {
		expect(isStream(yt)).toBe(true);
		expect(isStream({ kind: "twitch", id: "twitch" })).toBe(false);
		expect(isStream({ kind: "youtube", id: "nope" })).toBe(false);
	});
});

describe("attemptAdd", () => {
	test("empty", () => {
		expect(attemptAdd("", [])).toEqual({ kind: "empty" });
		expect(attemptAdd("   ", [])).toEqual({ kind: "empty" });
	});

	test("ok and duplicate", () => {
		expect(attemptAdd(VALID_ID, [])).toEqual({ kind: "ok", stream: yt });
		expect(attemptAdd(VALID_ID, [yt])).toEqual({ kind: "duplicate", stream: yt });
	});

	test("invalid", () => {
		expect(attemptAdd("https://example.com/watch?v=nope", [])).toEqual({
			kind: "invalid",
		});
		expect(attemptAdd("https://twitch.tv/twitch", [])).toEqual({ kind: "invalid" });
	});
});

describe("addStream", () => {
	test("skip invalid and duplicate", () => {
		const existing = [yt];
		expect(addStream(existing, "")).toBe(existing);
		expect(addStream(existing, yt)).toBe(existing);
	});

	test("append", () => {
		expect(addStream([], VALID_ID)).toEqual([yt]);
	});
});

describe("moveStream", () => {
	const a = { kind: "youtube" as const, id: "aaaaaaaaaaa" };
	const b = { kind: "youtube" as const, id: "bbbbbbbbbbb" };
	const c = { kind: "youtube" as const, id: "ccccccccccc" };

	test("swaps by index", () => {
		expect(moveStream([a, b, c], 0, 2)).toEqual([b, c, a]);
	});

	test("same index returns the same array", () => {
		const existing = [a, b];
		expect(moveStream(existing, 0, 0)).toBe(existing);
	});

	test("out of range returns the same array", () => {
		const existing = [a, b];
		expect(moveStream(existing, 0, 2)).toBe(existing);
	});
});
