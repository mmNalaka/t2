import { ThemeContext } from "./hooks/use-theme.js";
import { ThemePreset } from "./types/ui.types.js";
import { themes } from "./config/theme.config.js";
import Editor from "./components/editor.js";
import Welcome from "./components/welcome.js";

type Props = {
	name: string | undefined;
};

const themeContextValue = {
	currentTheme: "synthwave-84" as ThemePreset,
	colors: themes["synthwave-84"].colors,
	setCurrentTheme: () => {},
};

export default function App(_: Props) {
	return (
		<ThemeContext.Provider value={themeContextValue}>
			<Welcome />
			<Editor />
		</ThemeContext.Provider>
	);
}
