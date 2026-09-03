interface YouTubeEmbedProps {
	videoId: string;
	title: string;
	width: number;
	height: number;
}

export function YouTubeEmbed({ videoId, title, width, height }: YouTubeEmbedProps) {
	return (
		<iframe
			src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&playsinline=1`}
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
