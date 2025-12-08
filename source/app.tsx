import { useState } from "react";
import { ThemeContext } from "./hooks/use-theme.js";
import type { ThemePreset } from "./types/ui.types.js";
import { themes } from "./config/theme.config.js";
import Editor from "./components/editor.js";
import Welcome from "./components/welcome.js";
import Configuration from "./components/configuration.js";
import { loadConfig } from "./core/preferences.js";

type Props = {
	name: string | undefined;
	config?: boolean;
};

export default function App({ config }: Props) {
	const userConfig = loadConfig();
	const [currentTheme, setCurrentTheme] = useState<ThemePreset>(
		userConfig.theme,
	);

	const themeContextValue = {
		currentTheme,
		colors: themes[currentTheme].colors,
		setCurrentTheme,
	};

	if (config) {
		return (
			<ThemeContext.Provider value={themeContextValue}>
				<Configuration />
			</ThemeContext.Provider>
		);
	}

	return (
		<ThemeContext.Provider value={themeContextValue}>
			<Welcome />
			<Editor />
		</ThemeContext.Provider>
	);
}
