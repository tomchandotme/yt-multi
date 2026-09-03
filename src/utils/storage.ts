import { isStream, parseStream, parseTwitchChannel, uniqueStreams, type Stream } from "./stream";

const STORAGE_KEY = "yt-multi:streams";
const LABELS_KEY = "yt-multi:labels-pinned";
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

type StoredV2 = {
	v: 2;
	streams: Stream[];
	savedAt: number;
};

export function loadStreams(): Stream[] {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];

		const parsed: unknown = JSON.parse(raw);
		const savedAt = readSavedAt(parsed);
		if (savedAt === null) return [];

		if (Date.now() - savedAt > MAX_AGE_MS) {
			localStorage.removeItem(STORAGE_KEY);
			return [];
		}

		return readStreams(parsed);
	} catch {
		return [];
	}
}

export function saveStreams(streams: Stream[]): void {
	try {
		const payload: StoredV2 = {
			v: 2,
			streams,
			savedAt: Date.now(),
		};
		localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
	} catch {
		// quota exceeded or storage disabled
	}
}

export function loadLabelsPinned(): boolean {
	try {
		const raw = localStorage.getItem(LABELS_KEY);
		if (raw === "0") return false;
		if (raw === "1") return true;
		return true;
	} catch {
		return true;
	}
}

export function saveLabelsPinned(pinned: boolean): void {
	try {
		localStorage.setItem(LABELS_KEY, pinned ? "1" : "0");
	} catch {
		// quota exceeded or storage disabled
	}
}

function readSavedAt(value: unknown): number | null {
	if (typeof value !== "object" || value === null) return null;
	const savedAt = (value as Record<string, unknown>).savedAt;
	return Number.isFinite(savedAt) ? Number(savedAt) : null;
}

function readStreams(value: unknown): Stream[] {
	if (typeof value !== "object" || value === null) return [];
	const record = value as Record<string, unknown>;
	if (!Array.isArray(record.streams)) return [];

	const parsed =
		record.v === 2
			? record.streams.flatMap((item) => {
					const stream = canonicalizeStream(item);
					return stream ? [stream] : [];
				})
			: record.streams.flatMap((id) => {
					const stream = typeof id === "string" ? parseStream(id) : null;
					return stream ? [stream] : [];
				});

	return uniqueStreams(parsed);
}

function canonicalizeStream(value: unknown): Stream | null {
	if (!isStream(value)) return null;
	if (value.kind !== "twitch") return value;
	const id = parseTwitchChannel(`https://twitch.tv/${value.id}`);
	if (!id) return null;
	return { kind: "twitch", id };
}