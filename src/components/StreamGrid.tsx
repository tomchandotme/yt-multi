import { useEffect, useRef, useState, type DragEvent, type KeyboardEvent } from "react";
import { computeOptimalLayout } from "../utils/layout";
import { streamKey, type Stream } from "../utils/stream";
import { fetchVideoTitle } from "../utils/youtube";
import { TwitchEmbed } from "./TwitchEmbed";
import { YouTubeEmbed } from "./YouTubeEmbed";
import { BilibiliEmbed } from "./BilibiliEmbed";

interface StreamGridProps {
	streams: Stream[];
	onRemove: (stream: Stream) => void;
	onReorder: (from: number, to: number) => void;
	onFocusInput: () => void;
	labelsPinned: boolean;
}

const LABEL_STRIP_PX = 28;

export function StreamGrid({
	streams,
	onRemove,
	onReorder,
	onFocusInput,
	labelsPinned,
}: StreamGridProps) {
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
					Paste a YouTube, Twitch, or Bilibili link
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

	return (
		<div
			ref={containerRef}
			className={gridClass}
			style={{
				gridTemplateColumns: `repeat(${layout.cols}, 1fr)`,
				gridTemplateRows: `repeat(${layout.rows}, 1fr)`,
			}}
		>
			{streams.map((stream, index) => (
				<StreamCell
					key={streamKey(stream)}
					index={index}
					stream={stream}
					width={Math.floor(layout.tileWidth)}
					height={Math.floor(layout.tileHeight)}
					labelsPinned={labelsPinned}
					onRemove={onRemove}
					onReorder={onReorder}
					onDragActive={setDragging}
				/>
			))}
		</div>
	);
}

interface StreamCellProps {
	index: number;
	stream: Stream;
	width: number;
	height: number;
	labelsPinned: boolean;
	onRemove: (stream: Stream) => void;
	onReorder: (from: number, to: number) => void;
	onDragActive: (active: boolean) => void;
}

function StreamCell({
	index,
	stream,
	width,
	height,
	labelsPinned,
	onRemove,
	onReorder,
	onDragActive,
}: StreamCellProps) {
	const [title, setTitle] = useState<string | null>(null);

	useEffect(() => {
		if (stream.kind !== "youtube") return;
		const abort = new AbortController();
		fetchVideoTitle(stream.id, abort.signal).then((next) => {
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
		event.preventDefault();
		event.dataTransfer.dropEffect = "move";
	}

	function handleDrop(event: DragEvent<HTMLDivElement>) {
		event.preventDefault();
		onDragActive(false);
		const from = Number(event.dataTransfer.getData("text/plain"));
		if (!Number.isInteger(from)) return;
		onReorder(from, index);
	}

	function handleHandleKey(event: KeyboardEvent<HTMLButtonElement>) {
		if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
			event.preventDefault();
			onReorder(index, index - 1);
			return;
		}
		if (event.key === "ArrowRight" || event.key === "ArrowDown") {
			event.preventDefault();
			onReorder(index, index + 1);
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
				<StreamPlayer
					stream={stream}
					title={label}
					width={width}
					height={playerHeight}
				/>
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
	if (stream.kind === "bilibili") {
		return (
			<BilibiliEmbed
				bvid={stream.id}
				title={title}
				width={width}
				height={height}
			/>
		);
	}
	const _never: never = stream;
	return _never;
}
