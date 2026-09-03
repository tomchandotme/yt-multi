import { describe, expect, test } from "bun:test";
import {
	addStream,
	attemptAdd,
	isStream,
	moveStream,
	parseGridIndex,
	parseStream,
	parseTwitchChannel,
	uniqueStreams,
} from "./stream";

const VALID_ID = "dQw4w9WgXcQ";
const yt = { kind: "youtube" as const, id: VALID_ID };

describe("parseStream", () => {
	test("youtube urls", () => {
		expect(parseStream(VALID_ID)).toEqual(yt);
		expect(parseStream(`https://youtu.be/${VALID_ID}`)).toEqual(yt);
		expect(parseStream("https://twitch.tv/twitch")).toEqual({
			kind: "twitch",
			id: "twitch",
		});
		expect(parseStream("https://www.bilibili.com/video/BV1B7411m7LV")).toBeNull();
		expect(parseStream("https://www.twitch.tv/videos/123")).toBeNull();
		expect(parseStream("https://clips.twitch.tv/SomeClip")).toBeNull();
		expect(parseStream(`https://www.youtube.com/shorts/${VALID_ID}`)).toEqual(yt);
	});
});

describe("parseTwitchChannel", () => {
	test("accepts channel urls and names that only start with videos", () => {
		expect(parseTwitchChannel("https://twitch.tv/shroud")).toBe("shroud");
		expect(parseTwitchChannel("HTTP://www.twitch.tv/Shroud")).toBe("shroud");
		expect(parseTwitchChannel("https://twitch.tv/videosloth")).toBe("videosloth");
		expect(parseTwitchChannel("https://twitch.tv/videos")).toBeNull();
		expect(parseTwitchChannel("https://twitch.tv/settings")).toBeNull();
	});
});

describe("isStream", () => {
	test("accepts youtube and twitch", () => {
		expect(isStream(yt)).toBe(true);
		expect(isStream({ kind: "twitch", id: "twitch" })).toBe(true);
		expect(isStream({ kind: "twitch", id: "settings" })).toBe(false);
		expect(isStream({ kind: "twitch", id: "VIDEOS" })).toBe(false);
		expect(isStream({ kind: "bilibili", id: "BV1B7411m7LV" })).toBe(false);
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
		expect(attemptAdd("https://twitch.tv/twitch", [])).toEqual({
			kind: "ok",
			stream: { kind: "twitch", id: "twitch" },
		});
	});
});

describe("addStream", () => {
	test("skip duplicate", () => {
		const existing = [yt];
		expect(addStream(existing, yt)).toBe(existing);
	});

	test("append", () => {
		expect(addStream([], yt)).toEqual([yt]);
	});
});

describe("uniqueStreams", () => {
	test("keeps first occurrence", () => {
		const twitch = { kind: "twitch" as const, id: "twitch" };
		expect(uniqueStreams([yt, twitch, yt])).toEqual([yt, twitch]);
	});
});

describe("parseGridIndex", () => {
	test("reads decimal indexes and rejects empty or hex", () => {
		expect(parseGridIndex("0")).toBe(0);
		expect(parseGridIndex("12")).toBe(12);
		expect(parseGridIndex("")).toBeNull();
		expect(parseGridIndex(" ")).toBeNull();
		expect(parseGridIndex("0x2")).toBeNull();
		expect(parseGridIndex("1e1")).toBeNull();
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
