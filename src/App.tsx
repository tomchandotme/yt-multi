import { useEffect, useRef, useState } from "react";
import { StreamBar } from "./components/StreamBar";
import { StreamGrid } from "./components/StreamGrid";
import {
	loadLabelsPinned,
	loadStreams,
	saveLabelsPinned,
	saveStreams,
} from "./utils/storage";
import { addStream, moveStream } from "./utils/youtube";

function App() {
	const [streams, setStreams] = useState<string[]>(() => loadStreams());
	const [labelsPinned, setLabelsPinned] = useState(() => loadLabelsPinned());
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		saveStreams(streams);
	}, [streams]);

	useEffect(() => {
		saveLabelsPinned(labelsPinned);
	}, [labelsPinned]);

	function handleAdd(videoId: string) {
		setStreams((prev) => addStream(prev, videoId));
	}

	function handleRemove(videoId: string) {
		setStreams((prev) => prev.filter((id) => id !== videoId));
	}

	function handleReorder(from: number, to: number) {
		setStreams((prev) => moveStream(prev, from, to));
	}

	function handleFocusInput() {
		inputRef.current?.focus();
	}

	function handleClear() {
		setStreams([]);
		handleFocusInput();
	}

	return (
		<div className="app">
			<StreamBar
				streams={streams}
				onAdd={handleAdd}
				onClear={handleClear}
				labelsPinned={labelsPinned}
				onToggleLabels={() => setLabelsPinned((prev) => !prev)}
				inputRef={inputRef}
			/>
			<StreamGrid
				streams={streams}
				onRemove={handleRemove}
				onReorder={handleReorder}
				onFocusInput={handleFocusInput}
				labelsPinned={labelsPinned}
			/>
		</div>
	);
}

export default App;
