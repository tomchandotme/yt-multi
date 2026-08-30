import { useEffect, useRef, useState } from "react";
import { StreamBar } from "./components/StreamBar";
import { StreamGrid } from "./components/StreamGrid";
import { loadStreams, saveStreams } from "./utils/storage";
import { addStream } from "./utils/youtube";

function App() {
	const [streams, setStreams] = useState<string[]>(() => loadStreams());
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		saveStreams(streams);
	}, [streams]);

	function handleAdd(videoId: string) {
		setStreams((prev) => addStream(prev, videoId));
	}

	function handleRemove(videoId: string) {
		setStreams((prev) => prev.filter((id) => id !== videoId));
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
				inputRef={inputRef}
			/>
			<StreamGrid
				streams={streams}
				onRemove={handleRemove}
				onFocusInput={handleFocusInput}
			/>
		</div>
	);
}

export default App;
