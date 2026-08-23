import { useState } from "react";
import { StreamBar } from "./components/StreamBar";
import { StreamGrid } from "./components/StreamGrid";

function App() {
	const [streams, setStreams] = useState<string[]>([]);

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
