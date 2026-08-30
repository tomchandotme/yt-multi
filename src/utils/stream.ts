import { parseYouTubeId } from "./youtube";

export type Stream = { kind: "youtube"; id: string };

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
	const id = parseYouTubeId(input);
	if (!id) return null;
	return { kind: "youtube", id };
}

export function isStream(value: unknown): value is Stream {
	if (typeof value !== "object" || value === null) return false;
	const record = value as Record<string, unknown>;
	return record.kind === "youtube" && typeof record.id === "string" && parseYouTubeId(record.id) === record.id;
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
