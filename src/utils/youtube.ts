const VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

export type AddAttempt =
	| { kind: "empty" }
	| { kind: "invalid" }
	| { kind: "duplicate"; videoId: string }
	| { kind: "ok"; videoId: string };

export function attemptAdd(input: string, existing: readonly string[]): AddAttempt {
	if (!input.trim()) return { kind: "empty" };

	const videoId = parseYouTubeId(input);
	if (!videoId) return { kind: "invalid" };
	if (existing.includes(videoId)) return { kind: "duplicate", videoId };
	return { kind: "ok", videoId };
}

export function addStream(existing: string[], videoId: string): string[] {
	const parsed = parseYouTubeId(videoId);
	if (!parsed || existing.includes(parsed)) return existing;
	return [...existing, parsed];
}

export function parseYouTubeId(input: string): string | null {
	const trimmed = input.trim();
	if (!trimmed) return null;

	if (VIDEO_ID_PATTERN.test(trimmed)) {
		return trimmed;
	}

	try {
		const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
		const host = url.hostname.replace(/^www\./, "");

		if (host === "youtu.be") {
			const id = url.pathname.slice(1).split("/")[0];
			return VIDEO_ID_PATTERN.test(id) ? id : null;
		}

		if (host === "youtube.com" || host === "m.youtube.com") {
			const v = url.searchParams.get("v");
			if (v && VIDEO_ID_PATTERN.test(v)) return v;

			const pathParts = url.pathname.split("/").filter(Boolean);
			const embedIndex = pathParts.indexOf("embed");
			if (embedIndex !== -1 && pathParts[embedIndex + 1]) {
				const id = pathParts[embedIndex + 1];
				return VIDEO_ID_PATTERN.test(id) ? id : null;
			}

			const liveIndex = pathParts.indexOf("live");
			if (liveIndex !== -1 && pathParts[liveIndex + 1]) {
				const id = pathParts[liveIndex + 1];
				return VIDEO_ID_PATTERN.test(id) ? id : null;
			}
		}
	} catch {
		return null;
	}

	return null;
}
