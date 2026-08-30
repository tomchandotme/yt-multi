interface TwitchEmbedProps {
	channel: string;
	title: string;
	width: number;
	height: number;
}

export function TwitchEmbed({ channel, title, width, height }: TwitchEmbedProps) {
	const parent = window.location.hostname;
	return (
		<iframe
			src={`https://player.twitch.tv/?channel=${encodeURIComponent(channel)}&parent=${encodeURIComponent(parent)}&muted=true`}
			title={title}
			width={width}
			height={height}
			allow="autoplay; encrypted-media; picture-in-picture"
			allowFullScreen
			tabIndex={-1}
			style={{ border: "none", display: "block" }}
		/>
	);
}
