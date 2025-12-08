import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import type { ThemePreset } from "../types/ui.types.js";
import { defaultTheme, themes } from "../config/theme.config.js";

export interface UserConfig {
	vaultPath?: string;
	theme: ThemePreset;
}

const CONFIG_DIR = path.join(os.homedir(), ".t2");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

export function loadConfig(): UserConfig {
	try {
		if (!fs.existsSync(CONFIG_FILE)) {
			return {
				theme: defaultTheme,
			};
		}
		const content = fs.readFileSync(CONFIG_FILE, "utf-8");
		const config = JSON.parse(content);

		// Validate theme
		const theme =
			config.theme && themes[config.theme as ThemePreset]
				? (config.theme as ThemePreset)
				: defaultTheme;

		return {
			theme,
			vaultPath: config.vaultPath,
		};
	} catch (_) {
		return {
			theme: defaultTheme,
		};
	}
}

export function saveConfig(config: UserConfig): void {
	if (!fs.existsSync(CONFIG_DIR)) {
		fs.mkdirSync(CONFIG_DIR, { recursive: true });
	}
	fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}
