import {ThemeContext} from './hooks/use-theme.js';
import {ThemePreset} from './types/ui.types.js';
import {themes} from './config/theme.config.js';
import Editor from './components/editor.js';

type Props = {
	name: string | undefined;
};

const themeContextValue = {
	currentTheme: 'tokyo-night' as ThemePreset,
	colors: themes['tokyo-night'].colors,
	setCurrentTheme: () => {},
};

export default function App(_: Props) {
	return (
		<ThemeContext.Provider value={themeContextValue}>
			<Editor />
		</ThemeContext.Provider>
	);
}
