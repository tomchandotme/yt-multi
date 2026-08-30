import { useEffect, useRef, useState } from "react";
import { StreamBar } from "./components/StreamBar";
import { StreamGrid } from "./components/StreamGrid";
import { loadStreams, saveStreams } from "./utils/storage";

function App() {
	const [streams, setStreams] = useState<string[]>(() => loadStreams());
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		saveStreams(streams);
	}, [streams]);

	function handleAdd(videoId: string) {
		setStreams((prev) => [...prev, videoId]);
	}

	function handleRemove(videoId: string) {
		setStreams((prev) => prev.filter((id) => id !== videoId));
	}

	function handleFocusInput() {
		inputRef.current?.focus();
	}

	return (
		<div className="app">
			<StreamBar streams={streams} onAdd={handleAdd} inputRef={inputRef} />
			<StreamGrid
				streams={streams}
				onRemove={handleRemove}
				onFocusInput={handleFocusInput}
			/>
		</div>
	);
}

export default App;
