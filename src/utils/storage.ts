import { parseYouTubeId } from "./youtube";

const STORAGE_KEY = "yt-multi:streams";
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

type StoredStreams = {
	streams: string[];
	savedAt: number;
};

export function loadStreams(): string[] {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];

		const parsed: unknown = JSON.parse(raw);
		if (!isStoredStreams(parsed)) return [];

		if (Date.now() - parsed.savedAt > MAX_AGE_MS) {
			localStorage.removeItem(STORAGE_KEY);
			return [];
		}

		return parsed.streams
			.map((id) => parseYouTubeId(id))
			.filter((id): id is string => id !== null);
	} catch {
		return [];
	}
}

export function saveStreams(streams: string[]): void {
	try {
		const payload: StoredStreams = {
			streams,
			savedAt: Date.now(),
		};
		localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
	} catch {
		// quota exceeded or storage disabled
	}
}

function isStoredStreams(value: unknown): value is StoredStreams {
	if (typeof value !== "object" || value === null) return false;
	const record = value as Record<string, unknown>;
	return (
		Number.isFinite(record.savedAt) &&
		Array.isArray(record.streams) &&
		record.streams.every((id) => typeof id === "string")
	);
}
