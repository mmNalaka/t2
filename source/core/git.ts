import { execSync } from "node:child_process";
import path from "node:path";
import fs from "node:fs";

/**
 * Checks if a directory is a git repository
 */
export function isGitRepo(repoPath: string): boolean {
	const gitDir = path.join(repoPath, ".git");
	return fs.existsSync(gitDir);
}

/**
 * Initializes a git repository in the vault
 */
export function initRepo(repoPath: string): void {
	if (isGitRepo(repoPath)) {
		return;
	}

	try {
		execSync("git init", {
			cwd: repoPath,
			stdio: "pipe",
		});

		execSync('git config user.name "Notes Vault"', {
			cwd: repoPath,
			stdio: "pipe",
		});

		execSync('git config user.email "vault@local"', {
			cwd: repoPath,
			stdio: "pipe",
		});

		// Create initial commit
		const readmePath = path.join(repoPath, "README.md");
		if (!fs.existsSync(readmePath)) {
			fs.writeFileSync(
				readmePath,
				"# Notes Vault\n\nThis vault contains your notes managed by the terminal notes app.\n",
			);
		}

		execSync("git add README.md", {
			cwd: repoPath,
			stdio: "pipe",
		});

		execSync('git commit -m "chore: initialize vault"', {
			cwd: repoPath,
			stdio: "pipe",
		});
	} catch (error) {
		console.error("Failed to initialize git repo:", error);
		throw error;
	}
}

/**
 * Commits all changes in the vault
 */
export function commitAll(repoPath: string, message: string): void {
	if (!isGitRepo(repoPath)) {
		initRepo(repoPath);
	}

	try {
		execSync("git add -A", {
			cwd: repoPath,
			stdio: "pipe",
		});

		const status = execSync("git status --porcelain", {
			cwd: repoPath,
			encoding: "utf-8",
		});

		if (status.trim()) {
			execSync(`git commit -m "${message}"`, {
				cwd: repoPath,
				stdio: "pipe",
			});
		}
	} catch (error) {
		console.error("Failed to commit changes:", error);
	}
}

/**
 * Adds a remote repository
 */
export function addRemote(repoPath: string, name: string, url: string): void {
	if (!isGitRepo(repoPath)) {
		throw new Error("Not a git repository");
	}

	try {
		execSync(`git remote add ${name} ${url}`, {
			cwd: repoPath,
			stdio: "pipe",
		});
	} catch (error) {
		console.error("Failed to add remote:", error);
		throw error;
	}
}

/**
 * Pushes changes to remote
 */
export function push(
	repoPath: string,
	remote = "origin",
	branch = "main",
): void {
	if (!isGitRepo(repoPath)) {
		throw new Error("Not a git repository");
	}

	try {
		execSync(`git push ${remote} ${branch}`, {
			cwd: repoPath,
			stdio: "pipe",
		});
	} catch (error) {
		console.error("Failed to push:", error);
		throw error;
	}
}

/**
 * Pulls changes from remote
 */
export function pull(
	repoPath: string,
	remote = "origin",
	branch = "main",
): void {
	if (!isGitRepo(repoPath)) {
		throw new Error("Not a git repository");
	}

	try {
		execSync(`git pull ${remote} ${branch}`, {
			cwd: repoPath,
			stdio: "pipe",
		});
	} catch (error) {
		console.error("Failed to pull:", error);
		throw error;
	}
}

/**
 * Gets the git status summary
 */
export function getStatus(repoPath: string): string {
	if (!isGitRepo(repoPath)) {
		return "Not a git repository";
	}

	try {
		return execSync("git status --short", {
			cwd: repoPath,
			encoding: "utf-8",
		});
	} catch (error) {
		return "Error getting status";
	}
}
