import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type DragEvent, type KeyboardEvent } from "react";
import { computeOptimalLayout, LABEL_STRIP_PX } from "../utils/layout";
import { parseGridIndex, streamKey, type Stream } from "../utils/stream";
import { fetchTwitchTitle } from "../utils/twitch";
import { fetchVideoTitle } from "../utils/youtube";
import { TwitchEmbed } from "./TwitchEmbed";
import { YouTubeEmbed } from "./YouTubeEmbed";

interface StreamGridProps {
	streams: Stream[];
	onRemove: (stream: Stream) => void;
	onReorder: (from: number, to: number) => void;
	onFocusInput: () => void;
	labelsPinned: boolean;
}

export function StreamGrid({
	streams,
	onRemove,
	onReorder,
	onFocusInput,
	labelsPinned,
}: StreamGridProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [size, setSize] = useState({ width: 0, height: 0 });

	useLayoutEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const rect = container.getBoundingClientRect();
		if (rect.width > 0 && rect.height > 0) {
			setSize({ width: rect.width, height: rect.height });
		}

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

	const [dragging, setDragging] = useState(false);
	const layout = computeOptimalLayout(
		streams.length,
		size.width,
		size.height,
		labelsPinned ? LABEL_STRIP_PX : 0,
	);

	if (streams.length === 0) {
		return (
			<div ref={containerRef} className="stream-grid stream-grid--empty">
				<button
					type="button"
					className="stream-grid__well"
					onClick={onFocusInput}
				>
					Paste a YouTube or Twitch link
				</button>
			</div>
		);
	}

	const gridClass = [
		"stream-grid",
		labelsPinned ? "stream-grid--labels" : "",
		dragging ? "stream-grid--dragging" : "",
	]
		.filter(Boolean)
		.join(" ");
	const ready = layout.cols > 0 && layout.rows > 0;

	return (
		<div
			ref={containerRef}
			className={gridClass}
			style={{
				gridTemplateColumns: ready ? `repeat(${layout.cols}, 1fr)` : undefined,
				gridTemplateRows: ready ? `repeat(${layout.rows}, 1fr)` : undefined,
				["--label-strip"]: `${LABEL_STRIP_PX}px`,
			} as CSSProperties}
		>
			{ready
				? streams.map((stream, index) => (
						<StreamCell
							key={streamKey(stream)}
							index={index}
							cols={layout.cols}
							stream={stream}
							width={Math.floor(layout.tileWidth)}
							height={Math.floor(layout.tileHeight)}
							labelsPinned={labelsPinned}
							acceptDrop={dragging}
							onRemove={onRemove}
							onReorder={onReorder}
							onDragActive={setDragging}
						/>
					))
				: null}
		</div>
	);
}

interface StreamCellProps {
	index: number;
	cols: number;
	stream: Stream;
	width: number;
	height: number;
	labelsPinned: boolean;
	acceptDrop: boolean;
	onRemove: (stream: Stream) => void;
	onReorder: (from: number, to: number) => void;
	onDragActive: (active: boolean) => void;
}

function fetchStreamTitle(stream: Stream, signal: AbortSignal) {
	if (stream.kind === "youtube") return fetchVideoTitle(stream.id, signal);
	if (stream.kind === "twitch") return fetchTwitchTitle(stream.id, signal);
	const _never: never = stream;
	return _never;
}

function StreamCell({
	index,
	cols,
	stream,
	width,
	height,
	labelsPinned,
	acceptDrop,
	onRemove,
	onReorder,
	onDragActive,
}: StreamCellProps) {
	const [title, setTitle] = useState<string | null>(null);

	useEffect(() => {
		const abort = new AbortController();
		fetchStreamTitle(stream, abort.signal).then((next) => {
			if (!abort.signal.aborted && next) setTitle(next);
		});
		return () => abort.abort();
	}, [stream]);

	const label = title ?? stream.id;
	const playerHeight = labelsPinned
		? Math.max(1, height - LABEL_STRIP_PX)
		: height;

	function handleDragStart(event: DragEvent<HTMLButtonElement>) {
		event.dataTransfer.setData("text/plain", String(index));
		event.dataTransfer.effectAllowed = "move";
		onDragActive(true);
	}

	function handleDragEnd() {
		onDragActive(false);
	}

	function handleDragOver(event: DragEvent<HTMLDivElement>) {
		if (!acceptDrop) return;
		event.preventDefault();
		event.dataTransfer.dropEffect = "move";
	}

	function handleDrop(event: DragEvent<HTMLDivElement>) {
		event.preventDefault();
		onDragActive(false);
		if (!acceptDrop) return;
		const from = parseGridIndex(event.dataTransfer.getData("text/plain"));
		if (from === null) return;
		onReorder(from, index);
	}

	function handleHandleKey(event: KeyboardEvent<HTMLButtonElement>) {
		if (event.key === "ArrowLeft") {
			event.preventDefault();
			onReorder(index, index - 1);
			return;
		}
		if (event.key === "ArrowRight") {
			event.preventDefault();
			onReorder(index, index + 1);
			return;
		}
		if (event.key === "ArrowUp") {
			event.preventDefault();
			onReorder(index, index - cols);
			return;
		}
		if (event.key === "ArrowDown") {
			event.preventDefault();
			onReorder(index, index + cols);
		}
	}

	return (
		<div
			className="stream-cell"
			onDragOver={handleDragOver}
			onDrop={handleDrop}
		>
			<div
				className="stream-cell__frame"
				style={{ width, height }}
			>
				<div className="stream-cell__overlay">
					<button
						type="button"
						className="stream-cell__handle"
						draggable
						aria-label={`Move ${label}`}
						onDragStart={handleDragStart}
						onDragEnd={handleDragEnd}
						onKeyDown={handleHandleKey}
					>
						::
					</button>
					<span className="stream-cell__title" title={label}>
						{label}
					</span>
					<button
						type="button"
						className="stream-cell__remove"
						onClick={() => onRemove(stream)}
						aria-label={`Remove ${label}`}
					>
						Remove
					</button>
				</div>
				{width > 0 && height > 0 ? (
					<StreamPlayer
						stream={stream}
						title={label}
						width={width}
						height={playerHeight}
					/>
				) : null}
			</div>
		</div>
	);
}

function StreamPlayer({
	stream,
	title,
	width,
	height,
}: {
	stream: Stream;
	title: string;
	width: number;
	height: number;
}) {
	if (stream.kind === "youtube") {
		return (
			<YouTubeEmbed
				videoId={stream.id}
				title={title}
				width={width}
				height={height}
			/>
		);
	}
	if (stream.kind === "twitch") {
		return (
			<TwitchEmbed
				channel={stream.id}
				title={title}
				width={width}
				height={height}
			/>
		);
	}
	const _never: never = stream;
	return _never;
}
