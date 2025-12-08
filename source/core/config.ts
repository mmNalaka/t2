import path from "node:path";
import os from "node:os";
import { loadConfig } from "./preferences.js";

/**
 * Resolves the vault path from environment or defaults to ~/.notes
 */
export function resolveVaultPath(vaultPath?: string): string {
	if (vaultPath) {
		return path.resolve(vaultPath);
	}

	// Check user preferences first
	const config = loadConfig();
	if (config.vaultPath) {
		return path.resolve(config.vaultPath);
	}

	const envPath = process.env["NOTES_VAULT"] || process.env["VAULT_PATH"];
	if (envPath) {
		return path.resolve(envPath);
	}

	return path.join(os.homedir(), ".notes");
}
