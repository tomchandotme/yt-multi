import { useEffect, useRef, useState } from "react";
import { StreamBar } from "./components/StreamBar";
import { StreamGrid } from "./components/StreamGrid";
import {
	loadLabelsPinned,
	loadStreams,
	saveLabelsPinned,
	saveStreams,
} from "./utils/storage";
import { addStream, moveStream, sameStream, type Stream } from "./utils/stream";

function App() {
	const [streams, setStreams] = useState<Stream[]>(() => loadStreams());
	const [labelsPinned, setLabelsPinned] = useState(() => loadLabelsPinned());
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		saveStreams(streams);
	}, [streams]);

	useEffect(() => {
		saveLabelsPinned(labelsPinned);
	}, [labelsPinned]);

	function handleAdd(stream: Stream) {
		setStreams((prev) => addStream(prev, stream));
	}

	function handleRemove(stream: Stream) {
		setStreams((prev) => prev.filter((item) => !sameStream(item, stream)));
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
