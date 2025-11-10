import {Box, Text, useInput} from 'ink';
import {TitledBox, titleStyles} from '@mishieck/ink-titled-box';
import {memo, useState} from 'react';
import SelectInput from 'ink-select-input';
import MultiSelect from './multi-select.js';
import TextInput from 'ink-text-input';

import {useTheme} from '../hooks/use-theme.js';
import {renderMarkdown} from '../lib/markdown.js';

const items = [
	{
		label: '2025-11-06-1',
		value: '2025-11-06-1',
	},
	{
		label: '2025-11-06-2',
		value: '2025-11-06-2',
	},
	{
		label: '2025-11-06-3',
		value: '2025-11-06-3',
	},
];

const todos = [
	{
		label: 'First',
		value: 'first',
	},
	{
		label: 'Second',
		value: 'second',
	},
	{
		label: 'Third',
		value: 'third',
	},
];

const markdownContent = `
# Hello World
Description of the note

\`\`\`ts
const x = 1;
\`\`\`

## Lists

- First
- Second
- Third

## Links

- [Google](https://google.com)
- [GitHub](https://github.com)

## TODOs

- [x] First
- [ ] Second
- [ ] Third
`;

export default memo(function Editor() {
	const {colors} = useTheme();
	const [activePane, setActivePane] = useState<'notes' | 'preview' | 'todos'>(
		'notes',
	);
	const [selectedNote, setSelectedNote] = useState<{
		label: string;
		value: string;
	} | null>();
	const [isCreatingNote, setIsCreatingNote] = useState(false);
	const [noteTitle, setNoteTitle] = useState(
		new Date().toISOString().split('T')[0] || '',
	);

	function handleSelect(item: {label: string; value: string}) {
		setSelectedNote(item);
	}

	const handleSubmit = (_: any) => {};

	const handleCreateNoteSubmit = () => {
		// TODO: implement note creation
		setIsCreatingNote(false);
		setNoteTitle(new Date().toISOString().split('T')[0] || '');
	};

	useInput(input => {
		if (isCreatingNote) {
			return; // Don't process other inputs while creating note
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
		2;
	});

	return (
		<>
			<Box>
				<TitledBox
					titles={[`1: 🗒️ Notes (0)`]}
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
						items={items}
						onSelect={handleSelect}
						isFocused={activePane === 'notes'}
					/>
				</TitledBox>
				<TitledBox
					titles={[`2: 👀 Preview ${selectedNote?.label ?? ''}`]}
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
					<Text>{renderMarkdown(markdownContent)}</Text>
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
					items={todos}
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
			</Box>
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
