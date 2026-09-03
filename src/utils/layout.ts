export const LABEL_STRIP_PX = 28;

const ASPECT_RATIO = 16 / 9;

export interface OptimalLayout {
	cols: number;
	rows: number;
	tileWidth: number;
	tileHeight: number;
}

export function computeOptimalLayout(
	count: number,
	width: number,
	height: number,
	chromeHeight = 0,
): OptimalLayout {
	if (count === 0 || width <= 0 || height <= 0) {
		return { cols: 0, rows: 0, tileWidth: 0, tileHeight: 0 };
	}

	let best: OptimalLayout = { cols: 1, rows: count, tileWidth: 0, tileHeight: 0 };
	let bestArea = 0;

	for (let rows = 1; rows <= count; rows++) {
		const cols = Math.ceil(count / rows);
		const cellWidth = width / cols;
		const cellHeight = height / rows;
		const playerMaxHeight = Math.max(0, cellHeight - chromeHeight);

		let playerWidth = cellWidth;
		let playerHeight = playerWidth / ASPECT_RATIO;

		if (playerHeight > playerMaxHeight) {
			playerHeight = playerMaxHeight;
			playerWidth = playerHeight * ASPECT_RATIO;
		}

		const area = playerWidth * playerHeight;
		if (area > bestArea) {
			bestArea = area;
			best = {
				cols,
				rows,
				tileWidth: playerWidth,
				tileHeight: playerHeight + chromeHeight,
			};
		}
	}

	return best;
}
