import { describe, expect, test } from "bun:test";
import { computeOptimalLayout } from "./layout";

const ASPECT = 16 / 9;
const STRIP = 28;

describe("computeOptimalLayout", () => {
	test("empty or zero box", () => {
		expect(computeOptimalLayout(0, 800, 450)).toEqual({
			cols: 0,
			rows: 0,
			tileWidth: 0,
			tileHeight: 0,
		});
		expect(computeOptimalLayout(1, 0, 450).tileWidth).toBe(0);
	});

	test("one tile fills a 16:9 box", () => {
		const layout = computeOptimalLayout(1, 1600, 900);
		expect(layout).toEqual({
			cols: 1,
			rows: 1,
			tileWidth: 1600,
			tileHeight: 900,
		});
	});

	test("player stays 16:9 when a name strip is reserved", () => {
		const layout = computeOptimalLayout(3, 400, 900, STRIP);
		const playerHeight = layout.tileHeight - STRIP;
		expect(playerHeight).toBeGreaterThan(0);
		expect(layout.tileWidth / playerHeight).toBeCloseTo(ASPECT, 5);
	});
});
