import { parseYouTubeId } from "./youtube";

const TWITCH_CHANNEL = /^[a-zA-Z0-9_]{4,25}$/;
const TWITCH_SKIP = new Set([
	"videos",
	"clip",
	"clips",
	"directory",
	"downloads",
	"jobs",
	"p",
	"settings",
	"search",
	"prime",
	"turbo",
]);

export type Stream =
	| { kind: "youtube"; id: string }
	| { kind: "twitch"; id: string };

export type AddAttempt =
	| { kind: "empty" }
	| { kind: "invalid" }
	| { kind: "duplicate"; stream: Stream }
	| { kind: "ok"; stream: Stream };

export function streamKey(stream: Stream): string {
	return `${stream.kind}:${stream.id}`;
}

export function sameStream(a: Stream, b: Stream): boolean {
	return a.kind === b.kind && a.id === b.id;
}

export function parseStream(input: string): Stream | null {
	const twitch = parseTwitchChannel(input);
	if (twitch) return { kind: "twitch", id: twitch };
	const youtubeId = parseYouTubeId(input);
	if (youtubeId) return { kind: "youtube", id: youtubeId };
	return null;
}

export function isStream(value: unknown): value is Stream {
	if (typeof value !== "object" || value === null) return false;
	const record = value as Record<string, unknown>;
	if (record.kind === "youtube") {
		return typeof record.id === "string" && parseYouTubeId(record.id) === record.id;
	}
	if (record.kind === "twitch") {
		return typeof record.id === "string" && TWITCH_CHANNEL.test(record.id);
	}
	return false;
}

export function parseTwitchChannel(input: string): string | null {
	const trimmed = input.trim();
	if (!trimmed) return null;
	try {
		const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
		const host = url.hostname.replace(/^www\./, "");
		if (host === "clips.twitch.tv") return null;
		if (host !== "twitch.tv" && host !== "m.twitch.tv") return null;
		const parts = url.pathname.split("/").filter(Boolean);
		if (parts.length !== 1) return null;
		const channel = parts[0]?.toLowerCase();
		if (!channel || TWITCH_SKIP.has(channel)) return null;
		if (channel.startsWith("videos")) return null;
		return TWITCH_CHANNEL.test(channel) ? channel : null;
	} catch {
		return null;
	}
}

export function attemptAdd(input: string, existing: readonly Stream[]): AddAttempt {
	if (!input.trim()) return { kind: "empty" };

	const stream = parseStream(input);
	if (!stream) return { kind: "invalid" };
	if (existing.some((item) => sameStream(item, stream))) {
		return { kind: "duplicate", stream };
	}
	return { kind: "ok", stream };
}

export function addStream(existing: Stream[], input: string | Stream): Stream[] {
	const stream = typeof input === "string" ? parseStream(input) : input;
	if (!stream) return existing;
	if (existing.some((item) => sameStream(item, stream))) return existing;
	return [...existing, stream];
}

export function moveStream(streams: Stream[], from: number, to: number): Stream[] {
	if (
		from === to ||
		from < 0 ||
		to < 0 ||
		from >= streams.length ||
		to >= streams.length
	) {
		return streams;
	}
	const next = streams.slice();
	const [item] = next.splice(from, 1);
	if (item === undefined) return streams;
	next.splice(to, 0, item);
	return next;
}
