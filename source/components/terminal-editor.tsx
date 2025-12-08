import { useEffect } from "react";
import { spawn } from "node:child_process";
import { Text } from "ink";

type Props = {
	filePath: string;
	onClose: () => void;
};

export default function TerminalEditor({ filePath, onClose }: Props) {
	useEffect(() => {
		const editor = process.env["EDITOR"] || process.env["VISUAL"] || "nvim";

		const child = spawn(editor, [filePath], {
			stdio: "inherit",
		});

		child.on("exit", () => {
			onClose();
		});

		child.on("error", (error) => {
			console.error("Failed to open editor:", error);
			onClose();
		});

		return () => {
			if (!child.killed) {
				child.kill();
			}
		};
	}, [filePath, onClose]);

	return <Text>Opening editor...</Text>;
}
