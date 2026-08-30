import { useEffect, useState } from "react";
import { StreamBar } from "./components/StreamBar";
import { StreamGrid } from "./components/StreamGrid";
import { loadStreams, saveStreams } from "./utils/storage";

function App() {
	const [streams, setStreams] = useState<string[]>(() => loadStreams());

	useEffect(() => {
		saveStreams(streams);
	}, [streams]);

	function handleAdd(videoId: string) {
		setStreams((prev) => [...prev, videoId]);
	}

	function handleRemove(videoId: string) {
		setStreams((prev) => prev.filter((id) => id !== videoId));
	}

	return (
		<div className="app">
			<StreamBar streams={streams} onAdd={handleAdd} onRemove={handleRemove} />
			<StreamGrid streams={streams} />
		</div>
	);
}

export default App;
