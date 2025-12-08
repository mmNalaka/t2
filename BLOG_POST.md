# Introducing t2: The Hacker's Note-Taking Tool 🚀

If you're like me, you live in the terminal. You use Neovim/Vim, run git commands manually, and probably have a dozen tmux sessions open right now. So why leave your comfortable terminal environment just to take a quick note?

Meet **t2**, a beautiful, git-backed terminal note-taking app designed for developers who want speed, simplicity, and full control over their data.

## Why Another Note App?

I wanted something that felt as fast as `ls` or `grep` but looked as good as a modern GUI app. Existing CLI tools were either too bare-bones or required complex setups. **t2** bridges that gap. It combines the power of a CLI with a rich, interactive UI built with React and Ink.

## ✨ Key Features

- **Stay in the Terminal**: No more context switching. Run `t2`, jot down your thoughts, and get back to coding.
- **Git-Backed Everything**: Your notes are just Markdown files in a git repo. Every change is automatically committed. Syncing with GitHub/GitLab is native and effortless.
- **Beautiful UI**: Just because it's a terminal app doesn't mean it has to be ugly. `t2` comes with syntax highlighting, live previews, and multiple themes (Tokyo Night, Synthwave '84, and more).
- **Use Your Own Editor**: While `t2` is great for browsing and managing notes, it respects your workflow. Hit `e` to open any note in your `$EDITOR` (Neovim, Nano, VS Code, etc.).
- **Zero Config Required**: It works out of the box, but it's also fully configurable.

## 🛠️ How It Works

Under the hood, `t2` manages a "vault" directory where your notes live. It automatically handles the file organization (using date-based naming) and git operations.

You can create a new note in seconds:

1. Type `n`
2. Enter a title
3. Start writing

That's it. Your note is saved and committed.

## 🚀 Getting Started

Getting started is as easy as running a single npm command:

```bash
npm install --global t2-notes
```

Once installed, just run:

```bash
t2
```

Want to customize the look? We just shipped a new configuration interface!

```bash
t2 --config
```

From there, you can point `t2` to your existing git repository of notes or change the color theme to match your terminal setup.

## Open Source & Community

`t2` is fully open source. I built this to solve my own itch, but I'd love to see how it fits into your workflow.

Check out the repository on GitHub: [github.com/mmNalaka/t2](https://github.com/mmNalaka/t2)

Check out the npm package on npm: [t2-notes](https://www.npmjs.com/package/t2-notes)

Give it a spin and let me know what you think! Happy hacking! 👨‍💻👩‍💻
