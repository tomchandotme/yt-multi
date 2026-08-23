const ASPECT_RATIO = 16 / 9;

export interface OptimalLayout {
	cols: number;
	rows: number;
	tileWidth: number;
	tileHeight: number;
}

export function computeOptimalLayout(count: number, width: number, height: number): OptimalLayout {
	if (count === 0 || width <= 0 || height <= 0) {
		return { cols: 0, rows: 0, tileWidth: 0, tileHeight: 0 };
	}

	let best: OptimalLayout = { cols: 1, rows: count, tileWidth: 0, tileHeight: 0 };
	let bestArea = 0;

	for (let rows = 1; rows <= count; rows++) {
		const cols = Math.ceil(count / rows);
		const cellWidth = width / cols;
		const cellHeight = height / rows;

		let tileWidth = cellWidth;
		let tileHeight = tileWidth / ASPECT_RATIO;

		if (tileHeight > cellHeight) {
			tileHeight = cellHeight;
			tileWidth = tileHeight * ASPECT_RATIO;
		}

		const area = tileWidth * tileHeight;
		if (area > bestArea) {
			bestArea = area;
			best = { cols, rows, tileWidth, tileHeight };
		}
	}

	return best;
}
