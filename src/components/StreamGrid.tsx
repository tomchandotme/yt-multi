import { useEffect, useRef, useState } from "react";
import { computeOptimalLayout } from "../utils/layout";
import { fetchVideoTitle } from "../utils/youtube";
import { YouTubeEmbed } from "./YouTubeEmbed";

interface StreamGridProps {
	streams: string[];
	onRemove: (videoId: string) => void;
	onFocusInput: () => void;
}

export function StreamGrid({ streams, onRemove, onFocusInput }: StreamGridProps) {
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
				<button
					type="button"
					className="stream-grid__well"
					onClick={onFocusInput}
				>
					Paste a YouTube link
				</button>
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
				<StreamCell
					key={id}
					videoId={id}
					width={Math.floor(layout.tileWidth)}
					height={Math.floor(layout.tileHeight)}
					onRemove={onRemove}
				/>
			))}
		</div>
	);
}

interface StreamCellProps {
	videoId: string;
	width: number;
	height: number;
	onRemove: (videoId: string) => void;
}

function StreamCell({ videoId, width, height, onRemove }: StreamCellProps) {
	const [title, setTitle] = useState<string | null>(null);

	useEffect(() => {
		const abort = new AbortController();
		fetchVideoTitle(videoId, abort.signal).then((next) => {
			if (!abort.signal.aborted && next) setTitle(next);
		});
		return () => abort.abort();
	}, [videoId]);

	const label = title ?? videoId;

	return (
		<div className="stream-cell">
			<div className="stream-cell__overlay">
				<span className="stream-cell__title" title={label}>
					{label}
				</span>
				<button
					type="button"
					className="stream-cell__remove"
					onClick={() => onRemove(videoId)}
					aria-label={`Remove ${label}`}
				>
					Remove
				</button>
			</div>
			<YouTubeEmbed
				videoId={videoId}
				title={label}
				width={width}
				height={height}
			/>
		</div>
	);
}
