import { beforeEach, describe, expect, test } from "bun:test";
import { loadStreams, saveStreams } from "./storage";

const STORAGE_KEY = "yt-multi:streams";
const VALID_ID = "dQw4w9WgXcQ";
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

	test("loads valid ids saved within 24 hours", () => {
		memory.set(
			STORAGE_KEY,
			JSON.stringify({
				streams: [VALID_ID, "not-an-id", VALID_ID],
				savedAt: Date.now() - 1000,
			}),
		);
		expect(loadStreams()).toEqual([VALID_ID, VALID_ID]);
	});
});

describe("saveStreams", () => {
	test("round-trips ids through loadStreams", () => {
		saveStreams([VALID_ID]);
		expect(loadStreams()).toEqual([VALID_ID]);
	});
});
