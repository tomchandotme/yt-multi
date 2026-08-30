import { parseTwitchChannel } from "./stream";

const titleCache = new Map<string, string>();

export function parseTwitchTitle(value: string): string | null {
	const title = value.trim();
	if (!title) return null;
	if (/^user not found:/i.test(title)) return null;
	return title;
}

export async function fetchTwitchTitle(
	channel: string,
	signal?: AbortSignal,
): Promise<string | null> {
	const parsed = parseTwitchChannel(`https://twitch.tv/${channel}`);
	if (!parsed) return null;

	const cached = titleCache.get(parsed);
	if (cached !== undefined) return cached;

	const endpoint = `https://decapi.me/twitch/title/${encodeURIComponent(parsed)}`;

	try {
		const response = await fetch(endpoint, { signal });
		if (!response.ok) return null;
		const title = parseTwitchTitle(await response.text());
		if (title) titleCache.set(parsed, title);
		return title;
	} catch {
		return null;
	}
}
