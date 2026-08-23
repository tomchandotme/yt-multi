import { useState, type FormEvent } from "react";
import { parseYouTubeId } from "../utils/youtube";

interface StreamBarProps {
	streams: string[];
	onAdd: (videoId: string) => void;
	onRemove: (videoId: string) => void;
}

export function StreamBar({ streams, onAdd, onRemove }: StreamBarProps) {
	const [input, setInput] = useState("");
	const [error, setError] = useState("");

	function handleSubmit(event: FormEvent) {
		event.preventDefault();
		setError("");

		const videoId = parseYouTubeId(input);
		if (!videoId) {
			setError("Invalid YouTube URL or video ID");
			return;
		}

		if (streams.includes(videoId)) {
			setError("Stream already added");
			return;
		}

		onAdd(videoId);
		setInput("");
	}

	return (
		<div className="stream-bar">
			<form className="stream-bar__form" onSubmit={handleSubmit}>
				<input
					type="text"
					className="stream-bar__input"
					placeholder="Paste YouTube URL or video ID"
					value={input}
					onChange={(e) => {
						setInput(e.target.value);
						if (error) setError("");
					}}
				/>
				<button type="submit" className="stream-bar__add">
					Add
				</button>
			</form>
			{error && <p className="stream-bar__error">{error}</p>}
			{streams.length > 0 && (
				<ul className="stream-bar__chips">
					{streams.map((id) => (
						<li key={id} className="stream-bar__chip">
							<span className="stream-bar__chip-label">{id}</span>
							<button
								type="button"
								className="stream-bar__chip-remove"
								onClick={() => onRemove(id)}
								aria-label={`Remove stream ${id}`}
							>
								×
							</button>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
