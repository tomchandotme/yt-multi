interface BilibiliEmbedProps {
	bvid: string;
	title: string;
	width: number;
	height: number;
}

export function BilibiliEmbed({ bvid, title, width, height }: BilibiliEmbedProps) {
	return (
		<iframe
			src={`https://player.bilibili.com/player.html?bvid=${encodeURIComponent(bvid)}&muted=1`}
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
