interface YouTubeEmbedProps {
	videoId: string;
	width: number;
	height: number;
}

export function YouTubeEmbed({ videoId, width, height }: YouTubeEmbedProps) {
	return (
		<iframe
			src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`}
			title={`YouTube stream ${videoId}`}
			width={width}
			height={height}
			allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
			allowFullScreen
			tabIndex={-1}
			style={{ border: "none", display: "block" }}
		/>
	);
}
