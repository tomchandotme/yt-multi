import { useEffect, useRef, useState } from "react";
import { computeOptimalLayout } from "../utils/layout";
import { YouTubeEmbed } from "./YouTubeEmbed";

interface StreamGridProps {
	streams: string[];
}

export function StreamGrid({ streams }: StreamGridProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [size, setSize] = useState({ width: 0, height: 0 });

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const observer = new ResizeObserver((entries) => {
			const entry = entries[0];
			if (entry) {
				setSize({
					width: entry.contentRect.width,
					height: entry.contentRect.height,
				});
			}
		});

		observer.observe(container);
		return () => observer.disconnect();
	}, []);

	const layout = computeOptimalLayout(streams.length, size.width, size.height);

	if (streams.length === 0) {
		return (
			<div ref={containerRef} className="stream-grid stream-grid--empty">
				<p className="stream-grid__hint">Add a stream above to begin</p>
			</div>
		);
	}

	return (
		<div
			ref={containerRef}
			className="stream-grid"
			style={{
				gridTemplateColumns: `repeat(${layout.cols}, 1fr)`,
				gridTemplateRows: `repeat(${layout.rows}, 1fr)`,
			}}
		>
			{streams.map((id) => (
				<div key={id} className="stream-cell">
					<YouTubeEmbed
						videoId={id}
						width={Math.floor(layout.tileWidth)}
						height={Math.floor(layout.tileHeight)}
					/>
				</div>
			))}
		</div>
	);
}
