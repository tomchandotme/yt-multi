const VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

const YOUTUBE_HOSTS = new Set([
	"youtube.com",
	"m.youtube.com",
	"music.youtube.com",
	"youtube-nocookie.com",
]);

function youtubeIdFromPath(pathParts: string[], marker: string): string | null {
	const index = pathParts.indexOf(marker);
	if (index === -1) return null;
	const id = pathParts[index + 1];
	if (!id) return null;
	return VIDEO_ID_PATTERN.test(id) ? id : null;
}

export function parseYouTubeId(input: string): string | null {
	const trimmed = input.trim();
	if (!trimmed) return null;

	if (VIDEO_ID_PATTERN.test(trimmed)) {
		return trimmed;
	}

	try {
		const href = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
		const url = new URL(href);
		const host = url.hostname.replace(/^www\./, "");

		if (host === "youtu.be") {
			const id = url.pathname.slice(1).split("/")[0];
			return id && VIDEO_ID_PATTERN.test(id) ? id : null;
		}

		if (!YOUTUBE_HOSTS.has(host)) return null;

		const v = url.searchParams.get("v");
		if (v && VIDEO_ID_PATTERN.test(v)) return v;

		const pathParts = url.pathname.split("/").filter(Boolean);
		for (const marker of ["embed", "live", "shorts"]) {
			const id = youtubeIdFromPath(pathParts, marker);
			if (id) return id;
		}
	} catch {
		return null;
	}

	return null;
}

const titleCache = new Map<string, string>();

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

export function parseOEmbedTitle(value: unknown): string | null {
	if (!isRecord(value)) return null;
	if (typeof value.title !== "string") return null;
	const title = value.title.trim();
	return title.length > 0 ? title : null;
}

export async function fetchVideoTitle(
	videoId: string,
	signal?: AbortSignal,
): Promise<string | null> {
	const parsed = parseYouTubeId(videoId);
	if (!parsed) return null;

	const cached = titleCache.get(parsed);
	if (cached !== undefined) return cached;

	const watchUrl = `https://www.youtube.com/watch?v=${parsed}`;
	const endpoint = `https://noembed.com/embed?url=${encodeURIComponent(watchUrl)}`;

	try {
		const response = await fetch(endpoint, { signal });
		if (!response.ok) return null;
		const title = parseOEmbedTitle(await response.json());
		if (title) titleCache.set(parsed, title);
		return title;
	} catch {
		return null;
	}
}
