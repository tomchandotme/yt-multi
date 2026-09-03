import { describe, expect, test } from "bun:test";
import { parseOEmbedTitle, parseYouTubeId } from "./youtube";

const VALID_ID = "dQw4w9WgXcQ";

describe("parseYouTubeId", () => {
	test("reads watch, share, embed, live, and shorts urls", () => {
		expect(parseYouTubeId(VALID_ID)).toBe(VALID_ID);
		expect(parseYouTubeId(`https://youtu.be/${VALID_ID}`)).toBe(VALID_ID);
		expect(parseYouTubeId(`https://www.youtube.com/watch?v=${VALID_ID}`)).toBe(
			VALID_ID,
		);
		expect(parseYouTubeId(`HTTP://youtube.com/watch?v=${VALID_ID}`)).toBe(
			VALID_ID,
		);
		expect(parseYouTubeId(`https://m.youtube.com/embed/${VALID_ID}`)).toBe(
			VALID_ID,
		);
		expect(parseYouTubeId(`https://www.youtube.com/live/${VALID_ID}`)).toBe(
			VALID_ID,
		);
		expect(parseYouTubeId(`https://www.youtube.com/shorts/${VALID_ID}`)).toBe(
			VALID_ID,
		);
		expect(parseYouTubeId(`https://music.youtube.com/watch?v=${VALID_ID}`)).toBe(
			VALID_ID,
		);
		expect(
			parseYouTubeId(`https://www.youtube-nocookie.com/embed/${VALID_ID}`),
		).toBe(VALID_ID);
	});

	test("rejects unknown hosts and paths", () => {
		expect(parseYouTubeId("https://example.com/watch?v=" + VALID_ID)).toBeNull();
		expect(parseYouTubeId("https://www.youtube.com/channel/UC123")).toBeNull();
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
