import { beforeEach, describe, expect, test } from "bun:test";
import {
	loadLabelsPinned,
	loadStreams,
	saveLabelsPinned,
	saveStreams,
} from "./storage";

const STORAGE_KEY = "yt-multi:streams";
const VALID_ID = "dQw4w9WgXcQ";
const yt = { kind: "youtube" as const, id: VALID_ID };
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

const memory = new Map<string, string>();

const memoryStorage = {
	getItem(key: string) {
		return memory.get(key) ?? null;
	},
	setItem(key: string, value: string) {
		memory.set(key, value);
	},
	removeItem(key: string) {
		memory.delete(key);
	},
};

beforeEach(() => {
	memory.clear();
	Object.defineProperty(globalThis, "localStorage", {
		value: memoryStorage,
		configurable: true,
	});
});

describe("loadStreams", () => {
	test("returns empty when nothing is stored", () => {
		expect(loadStreams()).toEqual([]);
	});

	test("returns empty for invalid JSON", () => {
		memory.set(STORAGE_KEY, "{not json");
		expect(loadStreams()).toEqual([]);
	});

	test("returns empty when savedAt is not a finite number", () => {
		memory.set(STORAGE_KEY, `{"streams":["${VALID_ID}"],"savedAt":1e999}`);
		expect(loadStreams()).toEqual([]);
	});

	test("returns empty and clears storage when older than 24 hours", () => {
		memory.set(
			STORAGE_KEY,
			JSON.stringify({
				streams: [VALID_ID],
				savedAt: Date.now() - MAX_AGE_MS - 1,
			}),
		);
		expect(loadStreams()).toEqual([]);
		expect(memory.has(STORAGE_KEY)).toBe(false);
	});

	test("migrates v1 string ids", () => {
		memory.set(
			STORAGE_KEY,
			JSON.stringify({
				streams: [VALID_ID, "not-an-id", VALID_ID],
				savedAt: Date.now() - 1000,
			}),
		);
		expect(loadStreams()).toEqual([yt, yt]);
	});

	test("loads v2 streams and drops unknown kinds", () => {
		memory.set(
			STORAGE_KEY,
			JSON.stringify({
				v: 2,
				streams: [yt, { kind: "nope", id: "x" }],
				savedAt: Date.now() - 1000,
			}),
		);
		expect(loadStreams()).toEqual([yt]);
	});
});

describe("saveStreams", () => {
	test("round-trips ids through loadStreams as v2", () => {
		saveStreams([yt]);
		expect(loadStreams()).toEqual([yt]);
		const raw = JSON.parse(memory.get(STORAGE_KEY) ?? "{}") as { v?: number };
		expect(raw.v).toBe(2);
	});
});

describe("labels pinned", () => {
	test("defaults on when nothing is stored", () => {
		expect(loadLabelsPinned()).toBe(true);
	});

	test("round-trips off and on", () => {
		saveLabelsPinned(false);
		expect(loadLabelsPinned()).toBe(false);
		saveLabelsPinned(true);
		expect(loadLabelsPinned()).toBe(true);
	});

	test("does not share the streams key", () => {
		saveLabelsPinned(false);
		saveStreams([yt]);
		expect(loadLabelsPinned()).toBe(false);
		expect(loadStreams()).toEqual([yt]);
	});
});
