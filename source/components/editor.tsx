import { Box, Text, useInput } from "ink";
import { TitledBox, titleStyles } from "@mishieck/ink-titled-box";
import { memo, useState, useEffect, useCallback } from "react";
import SelectInput from "ink-select-input";
import MultiSelect from "./multi-select.js";
import TextInput from "ink-text-input";
import TerminalEditor from "./terminal-editor.js";
import fs from "node:fs";

import { useTheme } from "../hooks/use-theme.js";
import { renderMarkdown } from "../lib/markdown.js";
import {
	resolveVaultPath,
	ensureVaultStructure,
	readAllNotes,
	createNote,
	deleteNote,
	extractTodos,
	updateNote,
	type Note,
} from "../core/index.js";

export default memo(function Editor() {
	const { colors } = useTheme();
	const vaultPath = resolveVaultPath();

	const [activePane, setActivePane] = useState<"notes" | "preview" | "todos">(
		"notes",
	);
	const [notes, setNotes] = useState<Note[]>([]);
	const [selectedNoteIndex, setSelectedNoteIndex] = useState(0);
	const [currentNoteContent, setCurrentNoteContent] = useState("");
	const [todos, setTodos] = useState<
		Array<{ text: string; checked: boolean; index: number }>
	>([]);
	const [isCreatingNote, setIsCreatingNote] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [noteTitle, setNoteTitle] = useState(
		new Date().toISOString().split("T")[0] || "",
	);
	const [message, setMessage] = useState("");

	// Clear message after 2 seconds
	const clearMessage = useCallback(() => {
		setTimeout(() => {
			setMessage("");
		}, 4000);
	}, []);

	// Load notes on mount
	useEffect(() => {
		(async () => {
			try {
				await ensureVaultStructure(vaultPath);
				const allNotes = await readAllNotes(vaultPath);
				setNotes(allNotes);
				if (allNotes.length > 0 && allNotes[0]) {
					setCurrentNoteContent(allNotes[0].body);
				}
			} catch (error) {
				setMessage(`Error loading vault: ${error}`);
			}
		})();
	}, [vaultPath]);

	// Update preview and todos when selected note changes
	useEffect(() => {
		if (notes.length > 0 && selectedNoteIndex < notes.length) {
			const note = notes[selectedNoteIndex];
			if (note) {
				setCurrentNoteContent(note.body);
				// Extract todos from the full note content
				try {
					const fullContent = fs.readFileSync(note.path, "utf-8");
					const extractedTodos = extractTodos(fullContent);
					setTodos(extractedTodos);
				} catch (error) {
					setTodos([]);
				}
			}
		}
	}, [selectedNoteIndex, notes]);

	const refreshNotes = async () => {
		try {
			const allNotes = await readAllNotes(vaultPath);
			setNotes(allNotes);
			if (allNotes.length > 0 && allNotes[0]) {
				setSelectedNoteIndex(0);
				setCurrentNoteContent(allNotes[0].body);
			}
		} catch (error) {
			setMessage(`Error refreshing notes: ${error}`);
		}
	};

	const handleSubmit = async (
		items: Array<{ label: string; value: string }>,
	) => {
		if (notes.length === 0 || !notes[selectedNoteIndex]) return;

		try {
			const note = notes[selectedNoteIndex];
			const fullContent = fs.readFileSync(note.path, "utf-8");
			const lines = fullContent.split("\n");

			// Selected line indexes from MultiSelect (these should become checked)
			const selectedIndexes = new Set(
				items.map((item) => parseInt(item.value, 10)),
			);

			for (const todo of todos) {
				const lineIndex = todo.index;
				if (lineIndex < 0 || lineIndex >= lines.length) continue;
				const line = lines[lineIndex];
				if (!line) continue;

				// For lines that are todo items, enforce checked/unchecked
				if (selectedIndexes.has(lineIndex)) {
					// ensure checked
					if (line.includes("[ ]")) {
						lines[lineIndex] = line.replace("[ ]", "[x]");
					} else if (line.match(/\[x\]/i)) {
						// already checked, leave as-is
					} else {
						// not a todo line, skip
					}
				} else {
					// ensure unchecked
					if (line.match(/\[x\]/i)) {
						lines[lineIndex] = line.replace(/\[x\]/i, "[ ]");
					} else if (line.includes("[ ]")) {
						// already unchecked, leave as-is
					} else {
						// not a todo line, skip
					}
				}
			}

			const newContent = lines.join("\n");
			await updateNote(note.path, newContent, vaultPath);
			await refreshNotes();
			setMessage(`Updated ${items.length} todo(s)`);
			clearMessage();
		} catch (error) {
			setMessage(`Error updating todos: ${error}`);
			clearMessage();
		}
	};

	const handleCreateNoteSubmit = async () => {
		try {
			await createNote(vaultPath, noteTitle);
			await refreshNotes();
			setMessage("Note created successfully");
			setIsCreatingNote(false);
			setNoteTitle(new Date().toISOString().split("T")[0] || "");
		} catch (error) {
			setMessage(`Error creating note: ${error}`);
		}
	};

	const handleDeleteNote = async () => {
		if (notes.length === 0) return;
		const noteToDelete = notes[selectedNoteIndex];
		if (!noteToDelete) return;

		try {
			await deleteNote(noteToDelete.path, vaultPath);
			await refreshNotes();
			setMessage("Note deleted");
			setShowDeleteConfirm(false);
		} catch (error) {
			setMessage(`Error deleting note: ${error}`);
			setShowDeleteConfirm(false);
		}
	};

	const handleEditClose = async () => {
		setIsEditing(false);
		await refreshNotes();
		setMessage("Note saved");
	};

	useInput(
		(input, key) => {
			// HIGHEST PRIORITY: Handle pane switching FIRST before anything else
			if (input === "1") {
				setActivePane("notes");
				return;
			}
			if (input === "2") {
				setActivePane("preview");
				return;
			}
			if (input === "3") {
				setActivePane("todos");
				return;
			}

			if (isCreatingNote || isEditing) {
				return; // Don't process other inputs while creating note or editing
			}

			// Handle delete confirmation
			if (showDeleteConfirm) {
				if (input === "y" || input === "Y") {
					handleDeleteNote();
					return;
				}
				if (input === "n" || input === "N" || key.escape) {
					setShowDeleteConfirm(false);
					return;
				}
				return;
			}

			// Handle arrow key navigation in notes pane
			if (activePane === "notes" && notes.length > 0) {
				if (key.upArrow) {
					setSelectedNoteIndex((prev) => Math.max(0, prev - 1));
					return;
				}
				if (key.downArrow) {
					setSelectedNoteIndex((prev) => Math.min(notes.length - 1, prev + 1));
					return;
				}
			}
			if (input === "n") {
				setIsCreatingNote(true);
				return;
			}
			if (input === "d") {
				if (notes.length > 0) {
					setShowDeleteConfirm(true);
				}
				return;
			}
			if (input === "e") {
				if (notes.length > 0) {
					setIsEditing(true);
				}
				return;
			}
		},
		{ isActive: true },
	);

	return (
		<>
			<Box>
				<TitledBox
					titles={[`1:📋 Notes`]}
					titleStyles={titleStyles["rounded"]}
					width={32}
					flexDirection="column"
					borderStyle="round"
					borderColor={
						activePane === "notes" ? colors.primary : colors.secondary
					}
					paddingX={1}
				>
					{notes.length === 0 ? (
						<Box paddingX={1}>
							<Text color="gray">No notes yet. Press 'n' to create one.</Text>
						</Box>
					) : activePane === "notes" &&
						!isCreatingNote &&
						!isEditing &&
						!showDeleteConfirm ? (
						<SelectInput
							key={`select-${selectedNoteIndex}`}
							items={notes.map((note) => ({
								label:
									note.meta.title || note.path.split("/").pop() || "Untitled",
								value: note.path,
							}))}
							isFocused={true}
							initialIndex={selectedNoteIndex}
						/>
					) : (
						<Box flexDirection="column">
							{notes.map((note, idx) => (
								<Text
									key={note.path}
									color={idx === selectedNoteIndex ? "cyan" : undefined}
									dimColor={idx !== selectedNoteIndex}
								>
									{idx === selectedNoteIndex ? "› " : "  "}
									{note.meta.title || note.path.split("/").pop() || "Untitled"}
								</Text>
							))}
						</Box>
					)}
				</TitledBox>
				<TitledBox
					titles={[
						`2: 👀 Preview ${notes[selectedNoteIndex]?.meta.title || ""}`,
					]}
					titleStyles={titleStyles["rounded"]}
					flexGrow={1}
					flexDirection="column"
					borderStyle="round"
					borderColor={
						activePane === "preview" ? colors.primary : colors.secondary
					}
					paddingX={1}
					marginLeft={1}
				>
					<Text>
						{currentNoteContent
							? renderMarkdown(currentNoteContent)
							: "No note selected"}
					</Text>
				</TitledBox>
			</Box>
			<TitledBox
				titles={[`3:📝 TODOs`]}
				titleStyles={titleStyles["rounded"]}
				flexGrow={1}
				flexDirection="column"
				borderStyle="round"
				borderColor={activePane === "todos" ? colors.primary : colors.secondary}
			>
				{todos.length > 0 ? (
					<MultiSelect
						items={todos.map((todo) => ({
							label: todo.text,
							value: todo.index.toString(),
						}))}
						initialSelectedValues={todos
							.filter((todo) => todo.checked)
							.map((todo) => todo.index.toString())}
						onSubmit={handleSubmit}
						isFocused={activePane === "todos"}
					/>
				) : (
					<Box paddingX={1}>
						<Text color="gray">No TODOs in this note</Text>
					</Box>
				)}
			</TitledBox>
			<Box
				flexGrow={1}
				flexDirection="column"
				borderStyle="round"
				borderColor={colors.info}
				paddingX={1}
			>
				<Text>
					{activePane === "notes" && "1: "}
					n:new-note e:edit d:delete arrows:navigate
					{activePane === "todos" && " space:toggle-selected"}
				</Text>
				{message && <Text color="yellow">{message}</Text>}
			</Box>
			{showDeleteConfirm && notes[selectedNoteIndex] && (
				<TitledBox
					titles={[` ⚠️  Confirm Delete`]}
					titleStyles={titleStyles["rounded"]}
					borderStyle="round"
					borderColor={colors.error || "red"}
					marginTop={1}
					paddingX={1}
				>
					<Text>
						Delete note:{" "}
						<Text bold>
							{notes[selectedNoteIndex].meta.title ||
								notes[selectedNoteIndex].path.split("/").pop()}
						</Text>
						?
					</Text>
					<Text color="gray" dimColor>
						Press Y to confirm, N or Esc to cancel
					</Text>
				</TitledBox>
			)}
			{isEditing && notes.length > 0 && notes[selectedNoteIndex] && (
				<TerminalEditor
					filePath={notes[selectedNoteIndex].path}
					onClose={handleEditClose}
				/>
			)}
			{isCreatingNote && (
				<TitledBox
					titles={[` 🆕 New Note`]}
					titleStyles={titleStyles["rounded"]}
					borderStyle="round"
					borderColor={colors.primary}
					marginTop={1}
				>
					<TextInput
						value={noteTitle}
						onChange={setNoteTitle}
						onSubmit={handleCreateNoteSubmit}
						placeholder="Enter note title"
					/>
					<Text color="gray" dimColor>
						Press Enter to create, Esc to cancel
					</Text>
				</TitledBox>
			)}
		</>
	);
});
