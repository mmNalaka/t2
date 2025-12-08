import { useState } from "react";
import { Box, Text, useApp } from "ink";
import SelectInput from "ink-select-input";
import TextInput from "ink-text-input";
import {
	loadConfig,
	saveConfig,
	type UserConfig,
} from "../core/preferences.js";
import { themes } from "../config/theme.config.js";
import type { ThemePreset } from "../types/ui.types.js";

export default function Configuration() {
	const { exit } = useApp();
	const [config, setConfig] = useState<UserConfig>(loadConfig());
	const [mode, setMode] = useState<"menu" | "vaultPath" | "theme">("menu");

	const handleMenuSelect = (item: { value: string }) => {
		if (item.value === "vaultPath") {
			setMode("vaultPath");
		} else if (item.value === "theme") {
			setMode("theme");
		} else if (item.value === "exit") {
			saveConfig(config);
			exit();
		}
	};

	if (mode === "vaultPath") {
		return (
			<Box flexDirection="column" padding={1}>
				<Text>Enter Vault Path (Press Enter to confirm):</Text>
				<TextInput
					value={config.vaultPath || ""}
					onChange={(value) => setConfig({ ...config, vaultPath: value })}
					onSubmit={() => setMode("menu")}
				/>
			</Box>
		);
	}

	if (mode === "theme") {
		const themeItems = Object.keys(themes).map((key) => ({
			label: themes[key as ThemePreset].displayName,
			value: key,
		}));

		return (
			<Box flexDirection="column" padding={1}>
				<Text>Select Theme:</Text>
				<SelectInput
					items={themeItems}
					onSelect={(item) => {
						setConfig({ ...config, theme: item.value as ThemePreset });
						setMode("menu");
					}}
				/>
			</Box>
		);
	}

	return (
		<Box
			flexDirection="column"
			padding={1}
			borderStyle="round"
			borderColor="blue"
		>
			<Text bold color="blue">
				Configuration
			</Text>
			<Box height={1} />
			<SelectInput
				items={[
					{
						label: `Vault Path: ${config.vaultPath || "Not set"}`,
						value: "vaultPath",
					},
					{
						label: `Theme: ${themes[config.theme]?.displayName || config.theme}`,
						value: "theme",
					},
					{ label: "Save & Exit", value: "exit" },
				]}
				onSelect={handleMenuSelect}
			/>
		</Box>
	);
}
