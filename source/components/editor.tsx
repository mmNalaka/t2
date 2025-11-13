import {Box, Text, useInput} from 'ink';
import {TitledBox, titleStyles} from '@mishieck/ink-titled-box';
import {memo, useState, useEffect} from 'react';
import SelectInput from 'ink-select-input';
import MultiSelect from './multi-select.js';
import TextInput from 'ink-text-input';
import TerminalEditor from './terminal-editor.js';

import {useTheme} from '../hooks/use-theme.js';
import {renderMarkdown} from '../lib/markdown.js';
import {resolveVaultPath, ensureVaultStructure, readAllNotes, createNote, deleteNote, type Note} from '../core/index.js';


export default memo(function Editor() {
	const {colors} = useTheme();
	const vaultPath = resolveVaultPath();
	
	const [activePane, setActivePane] = useState<'notes' | 'preview' | 'todos'>(
		'notes',
	);
	const [notes, setNotes] = useState<Note[]>([]);
	const [selectedNoteIndex, setSelectedNoteIndex] = useState(0);
	const [currentNoteContent, setCurrentNoteContent] = useState('');
	const [isCreatingNote, setIsCreatingNote] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [noteTitle, setNoteTitle] = useState(
		new Date().toISOString().split('T')[0] || '',
	);
	const [message, setMessage] = useState('');
	
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
	
	// Update preview when selected note changes
	useEffect(() => {
		if (notes.length > 0 && selectedNoteIndex < notes.length) {
			const note = notes[selectedNoteIndex];
			if (note) {
				setCurrentNoteContent(note.body);
			}
		}
	}, [selectedNoteIndex, notes]);

	function handleSelect(item: {label: string; value: string}) {
		const index = notes.findIndex(n => n.path === item.value);
		if (index >= 0) {
			setSelectedNoteIndex(index);
		}
	}
	
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

	const handleSubmit = (_: any) => {};

	const handleCreateNoteSubmit = async () => {
		try {
			await createNote(vaultPath, noteTitle);
			await refreshNotes();
			setMessage('Note created successfully');
			setIsCreatingNote(false);
			setNoteTitle(new Date().toISOString().split('T')[0] || '');
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
			setMessage('Note deleted');
		} catch (error) {
			setMessage(`Error deleting note: ${error}`);
		}
	};
	
	const handleEditClose = async () => {
		setIsEditing(false);
		await refreshNotes();
		setMessage('Note saved');
	};

	useInput(input => {
		if (isCreatingNote || isEditing) {
			return; // Don't process other inputs while creating note or editing
		}
		if (input === '1') {
			setActivePane('notes');
			return;
		}
		if (input === '2') {
			setActivePane('preview');
			return;
		}
		if (input === '3') {
			setActivePane('todos');
			return;
		}
		if (input === 'n') {
			setIsCreatingNote(true);
			return;
		}
		if (input === 'd') {
			handleDeleteNote();
			return;
		}
		if (input === 'e') {
			if (notes.length > 0) {
				setIsEditing(true);
			}
			return;
		}
	});

	return (
		<>
			<Box>
				<TitledBox
					titles={[`1: 🗒️ Notes (${notes.length})`]}
					titleStyles={titleStyles['rounded']}
					width={32}
					flexDirection="column"
					borderStyle="round"
					borderColor={
						activePane === 'notes' ? colors.primary : colors.secondary
					}
					paddingX={1}
				>
					<SelectInput
						items={notes.map(note => ({
							label: note.meta.title || note.path.split('/').pop() || 'Untitled',
							value: note.path,
						}))}
						onSelect={handleSelect}
						isFocused={activePane === 'notes'}
					/>
				</TitledBox>
				<TitledBox
					titles={[`2: 👀 Preview ${notes[selectedNoteIndex]?.meta.title || ''}`]}
					titleStyles={titleStyles['rounded']}
					flexGrow={1}
					flexDirection="column"
					borderStyle="round"
					borderColor={
						activePane === 'preview' ? colors.primary : colors.secondary
					}
					paddingX={1}
					marginLeft={1}
				>
					<Text>{currentNoteContent ? renderMarkdown(currentNoteContent) : 'No note selected'}</Text>
				</TitledBox>
			</Box>
			<TitledBox
				titles={[`3: 📝 TODOs (0)`]}
				titleStyles={titleStyles['rounded']}
				flexGrow={1}
				flexDirection="column"
				borderStyle="round"
				borderColor={activePane === 'todos' ? colors.primary : colors.secondary}
			>
				<MultiSelect
					items={[]}
					onSubmit={handleSubmit}
					isFocused={activePane === 'todos'}
				/>
			</TitledBox>
			<Box
				flexGrow={1}
				flexDirection="column"
				borderStyle="round"
				borderColor={colors.info}
				paddingX={1}
			>
				<Text>
					{activePane === 'notes' && '1: '}
					n:new-note e:edit /:search d:delete arrows:navigate
					space:toggle-first-task
				</Text>
				{message && <Text color="yellow">{message}</Text>}
			</Box>
			{isEditing && notes.length > 0 && notes[selectedNoteIndex] && (
				<TerminalEditor
					filePath={notes[selectedNoteIndex].path}
					onClose={handleEditClose}
				/>
			)}
			{isCreatingNote && (
				<TitledBox
					titles={[` 🆕 New Note`]}
					titleStyles={titleStyles['rounded']}
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
