import fs from "node:fs";
import path from "node:path";
import type { Note, NoteMeta } from "./note.js";
import { commitAll, initRepo } from "./git.js";

const CONFIG_TEMPLATE = `
{
  "theme": "synthwave-84",
  "auto-sync": false,
  "auto-sync-interval": 5
}
`;

/**
 * Ensures the vault directory structure exists
 */
export async function ensureVaultStructure(vaultPath: string): Promise<void> {
	const notesDir = path.join(vaultPath, "notes");
	const configPath = path.join(vaultPath, "t2.config");

	if (!fs.existsSync(vaultPath)) {
		fs.mkdirSync(vaultPath, { recursive: true });
	}

	if (!fs.existsSync(notesDir)) {
		fs.mkdirSync(notesDir, { recursive: true });
	}

	if (!fs.existsSync(configPath)) {
		fs.writeFileSync(configPath, CONFIG_TEMPLATE);
	}

	// Initialize git if not already done
	initRepo(vaultPath);
}

/**
 * Reads a single note from the vault
 */
export async function readNote(notePath: string): Promise<Note> {
	const content = fs.readFileSync(notePath, "utf-8");
	const meta: NoteMeta = {};
	let body = content;

	// Parse YAML frontmatter
	if (content.startsWith("---")) {
		const endOfFrontmatter = content.indexOf("\n---", 3);
		if (endOfFrontmatter !== -1) {
			const frontmatter = content.substring(3, endOfFrontmatter);
			body = content.substring(endOfFrontmatter + 4).trim();

			for (const line of frontmatter.split("\n")) {
				const colonIndex = line.indexOf(":");
				if (colonIndex > 0) {
					const key = line.substring(0, colonIndex).trim();
					const value = line.substring(colonIndex + 1).trim();
					if (key && value) {
						meta[key] = value.replace(/^['"]|['"]$/g, "");
					}
				}
			}
		}
	}

	// Extract tags and links
	const tags = [...body.matchAll(/#([a-zA-Z0-9_-]+)/g)]
		.map((match) => match[1])
		.filter((tag): tag is string => tag !== undefined);
	const links = [...body.matchAll(/\[([^\]]+)\]\([^\)]+\)/g)]
		.map((match) => match[1])
		.filter((link): link is string => link !== undefined);

	return {
		path: notePath,
		meta,
		body,
		tags,
		links,
	};
}

/**
 * Creates a new note in the vault
 */
export async function createNote(
	vaultPath: string,
	title?: string,
): Promise<string> {
	const notesDir = path.join(vaultPath, "notes");

	// Get today's date in YYYY-MM-DD format
	const today = new Date().toISOString().split("T")[0] || "";

	// Check for existing notes with today's date
	let fileName = `${today}.md`;

	if (fs.existsSync(notesDir)) {
		const files = fs.readdirSync(notesDir);
		const todayNotes = files.filter((f) => f.startsWith(today));
		if (todayNotes.length > 0) {
			const noteNumber = todayNotes.length + 1;
			fileName = `${today}-${noteNumber}.md`;
		}
	}

	const notePath = path.join(notesDir, fileName);
	const displayTitle = title || today;

	const content = `---
title: ${displayTitle}
created: ${new Date().toISOString()}
---

# ${displayTitle}

## TODO:
- [ ]
- [ ]
`;

	fs.writeFileSync(notePath, content, "utf-8");

	// Auto-commit
	commitAll(vaultPath, `note: create ${fileName}`);

	return notePath;
}

/**
 * Reads all notes from the vault
 */
export async function readAllNotes(vaultPath: string): Promise<Note[]> {
	const notesDir = path.join(vaultPath, "notes");
	if (!fs.existsSync(notesDir)) {
		return [];
	}

	const files = fs.readdirSync(notesDir);
	const notes: Note[] = [];

	for (const file of files) {
		if (file.endsWith(".md")) {
			const notePath = path.join(notesDir, file);
			try {
				const note = await readNote(notePath);
				notes.push(note);
			} catch (error) {
				console.error(`Failed to read note ${file}:`, error);
			}
		}
	}

	// Sort by pinned status (pinned first), then by name
	return notes.sort((a, b) => {
		if (a.meta.created && b.meta.created) return -1;
		// if (!a.meta.pinnedAt && b.meta.pinnedAt) return 1;
		return a.path.localeCompare(b.path);
	});
}

/**
 * Updates a note's content
 */
export async function updateNote(
	notePath: string,
	content: string,
	vaultPath: string,
): Promise<void> {
	fs.writeFileSync(notePath, content, "utf-8");

	// Auto-commit
	const fileName = path.basename(notePath);
	commitAll(vaultPath, `note: update ${fileName}`);
}

/**
 * Deletes a note from the vault
 */
export async function deleteNote(
	notePath: string,
	vaultPath: string,
): Promise<void> {
	if (fs.existsSync(notePath)) {
		fs.unlinkSync(notePath);

		// Auto-commit
		const fileName = path.basename(notePath);
		commitAll(vaultPath, `note: delete ${fileName}`);
	}
}

/**
 * Pins or unpins a note
 */
export async function setPinned(
	notePath: string,
	pinned: boolean,
	vaultPath: string,
): Promise<void> {
	const note = await readNote(notePath);

	if (pinned) {
		note.meta.pinnedAt = new Date().toISOString();
	} else {
		delete note.meta.pinnedAt;
	}

	// Rebuild content with updated frontmatter
	const frontmatterLines = Object.entries(note.meta).map(
		([key, value]) => `${key}: ${value}`,
	);

	const content = `---
${frontmatterLines.join("\n")}
---

${note.body}
`;

	await updateNote(notePath, content, vaultPath);
}

/**
 * Extracts TODO items from note content
 * Matches: - [ ] Task, [ ] Task, * [ ] Task, etc.
 */
export function extractTodos(
	content: string,
): Array<{ text: string; checked: boolean; index: number }> {
	const lines = content.split("\n");
	const todos: Array<{ text: string; checked: boolean; index: number }> = [];

	lines.forEach((line, index) => {
		// Match: optional whitespace, optional list marker (-, *, +), whitespace, checkbox, text
		const uncheckedMatch = line.match(/^\s*[-*+]?\s*\[ \]\s*(.+)$/);
		const checkedMatch = line.match(/^\s*[-*+]?\s*\[x\]\s*(.+)$/i);

		if (uncheckedMatch && uncheckedMatch[1]) {
			todos.push({
				text: uncheckedMatch[1].trim(),
				checked: false,
				index,
			});
		} else if (checkedMatch && checkedMatch[1]) {
			todos.push({
				text: checkedMatch[1].trim(),
				checked: true,
				index,
			});
		}
	});

	return todos;
}

/**
 * Toggles a TODO item at a specific line index
 */
export async function toggleTodo(
	notePath: string,
	lineIndex: number,
	vaultPath: string,
): Promise<void> {
	const fullContent = fs.readFileSync(notePath, "utf-8");
	const lines = fullContent.split("\n");

	if (lineIndex < 0 || lineIndex >= lines.length) {
		throw new Error("Invalid line index");
	}

	const line = lines[lineIndex];
	if (!line) {
		throw new Error("Line not found");
	}

	// Toggle the checkbox
	if (line.includes("[ ]")) {
		lines[lineIndex] = line.replace("[ ]", "[x]");
	} else if (line.match(/\[x\]/i)) {
		lines[lineIndex] = line.replace(/\[x\]/i, "[ ]");
	} else {
		throw new Error("Line is not a TODO item");
	}

	const newContent = lines.join("\n");
	await updateNote(notePath, newContent, vaultPath);
}
