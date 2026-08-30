import { useCallback, useEffect, useState, type FormEvent, type Ref } from "react";
import { attemptAdd, parseYouTubeId } from "../utils/youtube";

interface StreamBarProps {
	streams: string[];
	onAdd: (videoId: string) => void;
	inputRef: Ref<HTMLInputElement>;
}

function isEditableTarget(target: EventTarget | null): boolean {
	if (!(target instanceof HTMLElement)) return false;
	if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
		return true;
	}
	return target.isContentEditable;
}

function messageForAttempt(
	kind: "empty" | "invalid" | "duplicate",
): string {
	if (kind === "invalid") return "That isn't a YouTube link";
	if (kind === "duplicate") return "Already on the wall";
	return "Paste a YouTube link";
}

export function StreamBar({ streams, onAdd, inputRef }: StreamBarProps) {
	const [input, setInput] = useState("");
	const [error, setError] = useState("");

	const applyAdd = useCallback(
		(raw: string) => {
			const result = attemptAdd(raw, streams);
			if (result.kind === "ok") {
				onAdd(result.videoId);
				setInput("");
				setError("");
				return;
			}
			setError(messageForAttempt(result.kind));
		},
		[streams, onAdd],
	);

	function handleSubmit(event: FormEvent) {
		event.preventDefault();
		applyAdd(input);
	}

	useEffect(() => {
		function onWindowPaste(event: ClipboardEvent) {
			if (isEditableTarget(event.target)) return;
			const text = event.clipboardData?.getData("text") ?? "";
			if (!text.trim()) return;
			applyAdd(text);
		}

		window.addEventListener("paste", onWindowPaste);
		return () => window.removeEventListener("paste", onWindowPaste);
	}, [applyAdd]);

	return (
		<div className="stream-bar">
			<div className="stream-bar__row">
				<div className="stream-bar__brand">
					<span className="stream-bar__wordmark">yt-multi</span>
					<span className="stream-bar__count">
						{streams.length} on air
					</span>
				</div>
				<form className="stream-bar__form" onSubmit={handleSubmit}>
					<input
						ref={inputRef}
						type="text"
						className="stream-bar__input"
						aria-label="YouTube link"
						placeholder="Paste a YouTube link"
						value={input}
						onChange={(e) => {
							setInput(e.target.value);
							if (error) setError("");
						}}
						onPaste={(event) => {
							const text = event.clipboardData.getData("text");
							if (!parseYouTubeId(text)) return;
							event.preventDefault();
							applyAdd(text);
						}}
					/>
					<button type="submit" className="stream-bar__add">
						Add
					</button>
				</form>
			</div>
			<p className="stream-bar__error" aria-live="polite">
				{error}
			</p>
		</div>
	);
}
