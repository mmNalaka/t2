import path from 'node:path';
import os from 'node:os';

/**
 * Resolves the vault path from environment or defaults to ~/.notes
 */
export function resolveVaultPath(vaultPath?: string): string {
	if (vaultPath) {
		return path.resolve(vaultPath);
	}
	
	const envPath = process.env['NOTES_VAULT'] || process.env['VAULT_PATH'];
	if (envPath) {
		return path.resolve(envPath);
	}
	
	return path.join(os.homedir(), '.notes');
}
