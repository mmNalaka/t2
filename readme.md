# Terminal Notes App 📝

A beautiful terminal-based note-taking app with git-backed storage, similar to [nb](https://xwmx.github.io/nb/).

## ✨ Features

- 📝 **Markdown notes** with live preview
- 🎨 **Beautiful terminal UI** with multiple themes
- 📂 **Local vault storage** with automatic organization
- 🔄 **Git-backed** with auto-commits on every change
- 🌐 **Remote sync** support (push/pull to GitHub, GitLab, etc.)
- ⌨️ **Keyboard-driven** workflow
- 📅 **Date-based note naming** with auto-numbering
- 🔍 **Quick navigation** and search
- ✏️ **External editor** support (nvim, vim, nano, etc.)

## 🚀 Install

```bash
npm install --global t2
```

## 📖 Usage

### Starting the App

```bash
t2
```

The app will automatically create a vault at `~/.notes` and initialize it as a git repository.

### Custom Vault Location

Set the vault path using environment variables:

```bash
export VAULT_PATH=/path/to/your/notes
t2
```

Or:

```bash
export NOTES_VAULT=/path/to/your/notes
t2
```

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `1` | Focus Notes pane |
| `2` | Focus Preview pane |
| `3` | Focus TODOs pane |
| `n` | Create new note |
| `e` | Edit selected note |
| `d` | Delete selected note |
| `↑/↓` | Navigate notes |
| `Enter` | Select note |
| `Ctrl+C` | Quit |

## 📝 Creating Notes

1. Press `n` to open the create note dialog
2. Enter a title (defaults to today's date: `YYYY-MM-DD`)
3. Press `Enter` to create

Notes are automatically named by date:
- First note of the day: `2025-11-13.md`
- Second note: `2025-11-13-2.md`
- Third note: `2025-11-13-3.md`

## ✏️ Editing Notes

1. Select a note using arrow keys
2. Press `e` to open in your editor
3. Make changes and save
4. Changes are auto-committed to git

The app uses your `$EDITOR` or `$VISUAL` environment variable, defaulting to `nvim`.

To set your preferred editor:

```bash
export EDITOR=nano  # or vim, emacs, code, etc.
```

## 🌐 Git Remote Sync

The vault is automatically initialized as a git repository. You can sync it with a remote repository (GitHub, GitLab, Bitbucket, etc.).

### Initial Setup

1. Create a repository on your git hosting service (GitHub, GitLab, etc.)

2. Add the remote to your vault:

```bash
cd ~/.notes
git remote add origin https://github.com/yourusername/notes.git
git branch -M main
git push -u origin main
```

### Pushing Changes

After making changes in the app, push to remote:

```bash
cd ~/.notes
git push
```

### Pulling Changes

If you edit notes from another device, pull changes:

```bash
cd ~/.notes
git pull
```

### Auto-Sync Script

Create a script for automatic sync (optional):

```bash
#!/bin/bash
# ~/.local/bin/notes-sync

cd ~/.notes
git pull --rebase
git push

echo "Notes synced!"
```

Make it executable:

```bash
chmod +x ~/.local/bin/notes-sync
```

Run it periodically or before/after using the app.

### Using Git Hooks

You can set up git hooks to auto-sync. Create `~/.notes/.git/hooks/post-commit`:

```bash
#!/bin/bash
git push origin main &
```

Make it executable:

```bash
chmod +x ~/.notes/.git/hooks/post-commit
```

## 📂 Vault Structure

```
~/.notes/
├── .git/              # Git repository
├── README.md          # Vault info
└── notes/             # Your notes
    ├── 2025-11-13.md
    ├── 2025-11-13-2.md
    └── ...
```

## 📄 Note Format

Notes use Markdown with YAML frontmatter:

```markdown
---
title: My Note Title
created: 2025-11-13T20:00:00.000Z
modified: 2025-11-13T20:30:00.000Z
pinnedAt: 2025-11-13T20:15:00.000Z
---

# My Note Title

Your content here...

## Lists

- Item 1
- Item 2

## Code

\`\`\`javascript
console.log('Hello, world!');
\`\`\`

## TODOs

- [x] Completed task
- [ ] Pending task
```

## 🎨 Themes

Current theme: `tokyo-night`

To change themes, edit `/source/app.tsx`:

```typescript
colors: themes['cherry-blossom'].colors,
// or 'synthwave-84', 'tokyo-night', etc.
```

## 🔧 Development

```bash
# Install dependencies
npm install

# Run in development
npm start

# Build
npm run build

# Test
npm test
```

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit PRs.

## 📝 License

MIT

## 🙏 Acknowledgments

Inspired by [nb](https://xwmx.github.io/nb/) - a command-line note-taking tool.
