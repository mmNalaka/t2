import {useMemo, useState} from 'react';
import {Box, Text, useInput} from 'ink';

export type MultiSelectItem = {
	label: string;
	value: string;
};

type Props = {
	items: MultiSelectItem[];
	onSubmit?: (items: MultiSelectItem[]) => void;
	initialSelectedValues?: string[];
    isFocused?: boolean;
};

export default function MultiSelect({items, onSubmit, initialSelectedValues = [], isFocused = true}: Props) {
	const [cursor, setCursor] = useState(0);
	const [selected, setSelected] = useState<Set<string>>(
		() => new Set(initialSelectedValues),
	);

	const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

	useInput((input, key) => {
		if (key.upArrow) {
			setCursor(c => clamp(c - 1, 0, Math.max(items.length - 1, 0)));
			return;
		}
		if (key.downArrow) {
			setCursor(c => clamp(c + 1, 0, Math.max(items.length - 1, 0)));
			return;
		}
		if (input === ' ') {
			setSelected(prev => {
				const next = new Set(prev);
				const value = items[cursor]?.value;
				if (value !== undefined) {
					if (next.has(value)) next.delete(value);
					else next.add(value);
				}
				return next;
			});
			return;
		}
		if (key.return) {
			const selectedItems = items.filter(i => selected.has(i.value));
			onSubmit?.(selectedItems);
		}
	}, {isActive: isFocused});

	const rows = useMemo(() => {
		return items.map((item, index) => {
			const isActive = index === cursor;
			const isSelected = selected.has(item.value);
			return (
				<Box key={item.value}>
					<Text color={isActive ? 'cyan' : undefined}>
						{isActive ? '>' : ' '} {isSelected ? '[x]' : '[ ]'} {item.label}
					</Text>
				</Box>
			);
		});
	}, [items, cursor, selected]);

	return <Box flexDirection="column">{rows}</Box>;
}
