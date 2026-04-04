export type EditorShortcut = {
	label: string
	keys: string[]
}

type BuildEditorShortcutsOptions = {
	includeSave: boolean
	includeFormat: boolean
	includeCopyPaste: boolean
	includeShortcutsHelp: boolean
	shortcutsHelpKeys?: string[]
	keymaps: {
		search: boolean
		history: boolean
		fold: boolean
		completion: boolean
		lint: boolean
		closeBrackets: boolean
	}
}

export function buildEditorShortcuts({
	includeSave,
	includeFormat,
	includeCopyPaste,
	includeShortcutsHelp,
	shortcutsHelpKeys,
	keymaps,
}: BuildEditorShortcutsOptions): EditorShortcut[] {
	const shortcuts: EditorShortcut[] = []

	if (includeSave) {
		shortcuts.push({ label: 'Save snippet', keys: ['Ctrl+S / Cmd+S'] })
	}

	if (includeFormat) {
		shortcuts.push({ label: 'Format code', keys: ['Shift+Alt+F'] })
	}

	if (includeCopyPaste) {
		shortcuts.push(
			{ label: 'Copy', keys: ['Ctrl+C / Cmd+C'] },
			{ label: 'Paste', keys: ['Ctrl+V / Cmd+V'] },
		)
	}

	if (includeShortcutsHelp) {
		shortcuts.push({
			label: 'Show shortcuts',
			keys: shortcutsHelpKeys?.length
				? shortcutsHelpKeys
				: ['Ctrl+Shift+/ / Cmd+Shift+/'],
		})
	}

	if (keymaps.search) {
		shortcuts.push(
			{ label: 'Find', keys: ['Ctrl+F / Cmd+F'] },
			{ label: 'Find next', keys: ['F3', 'Ctrl+G / Cmd+G'] },
			{
				label: 'Find previous',
				keys: ['Shift+F3', 'Shift+Ctrl+G / Shift+Cmd+G'],
			},
			{ label: 'Go to line', keys: ['Ctrl+Alt+G / Cmd+Alt+G'] },
			{ label: 'Select next occurrence', keys: ['Ctrl+D / Cmd+D'] },
		)
	}

	if (keymaps.history) {
		shortcuts.push(
			{ label: 'Undo', keys: ['Ctrl+Z / Cmd+Z'] },
			{
				label: 'Redo',
				keys: [
					'Ctrl+Y (Win/Linux)',
					'Cmd+Shift+Z (macOS)',
					'Ctrl+Shift+Z (Linux)',
				],
			},
			{ label: 'Undo selection', keys: ['Ctrl+U / Cmd+U'] },
			{
				label: 'Redo selection',
				keys: ['Alt+U (Win/Linux)', 'Cmd+Shift+U (macOS)'],
			},
		)
	}

	if (keymaps.fold) {
		shortcuts.push(
			{
				label: 'Fold code',
				keys: ['Ctrl+Shift+[', 'Cmd+Alt+[ (macOS)'],
			},
			{
				label: 'Unfold code',
				keys: ['Ctrl+Shift+]', 'Cmd+Alt+] (macOS)'],
			},
			{ label: 'Fold all', keys: ['Ctrl+Alt+['] },
			{ label: 'Unfold all', keys: ['Ctrl+Alt+]'] },
		)
	}

	if (keymaps.completion) {
		shortcuts.push(
			{
				label: 'Show completions',
				keys: ['Ctrl+Space', 'Alt+` (macOS)', 'Alt+I (macOS)'],
			},
			{ label: 'Accept completion', keys: ['Enter'] },
			{ label: 'Close completion', keys: ['Escape'] },
			{ label: 'Next completion', keys: ['ArrowDown', 'PageDown'] },
			{ label: 'Previous completion', keys: ['ArrowUp', 'PageUp'] },
		)
	}

	if (keymaps.lint) {
		shortcuts.push(
			{ label: 'Open lint panel', keys: ['Ctrl/Cmd+Shift+M'] },
			{ label: 'Next diagnostic', keys: ['F8'] },
		)
	}

	if (keymaps.closeBrackets) {
		shortcuts.push({ label: 'Delete bracket pair', keys: ['Backspace'] })
	}

	return shortcuts
}
