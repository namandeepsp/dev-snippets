import type { EditorLanguage } from '@/features/editor/editor.config'
import type { Extension } from '@codemirror/state'

export const loadLanguageExtension = async (
	lang: EditorLanguage,
): Promise<Extension> => {
	switch (lang) {
		case 'javascript': {
			const { javascript } = await import('@codemirror/lang-javascript')
			return javascript({ jsx: true })
		}
		case 'typescript': {
			const { javascript } = await import('@codemirror/lang-javascript')
			return javascript({ typescript: true, jsx: true })
		}
		case 'json': {
			const { json } = await import('@codemirror/lang-json')
			return json()
		}
		case 'html': {
			const { html } = await import('@codemirror/lang-html')
			return html()
		}
		case 'css': {
			const { css } = await import('@codemirror/lang-css')
			return css()
		}
		case 'python': {
			const { python } = await import('@codemirror/lang-python')
			return python()
		}
		case 'java': {
			const { java } = await import('@codemirror/lang-java')
			return java()
		}
		case 'cpp': {
			const { cpp } = await import('@codemirror/lang-cpp')
			return cpp()
		}
		case 'rust': {
			const { rust } = await import('@codemirror/lang-rust')
			return rust()
		}
		case 'php': {
			const { php } = await import('@codemirror/lang-php')
			return php()
		}
		case 'sql': {
			const { sql } = await import('@codemirror/lang-sql')
			return sql()
		}
		case 'markdown': {
			const { markdown } = await import('@codemirror/lang-markdown')
			return markdown()
		}
		case 'go':
		case 'yaml':
		case 'ruby':
		case 'csharp':
		case 'bash':
		case 'dockerfile':
		default: {
			const { javascript } = await import('@codemirror/lang-javascript')
			return javascript()
		}
	}
}

export const loadThemeExtension = async (
	theme: 'dark' | 'light',
): Promise<Extension> => {
	if (theme === 'dark') {
		const { vscodeDark } = await import('@uiw/codemirror-theme-vscode')
		return vscodeDark
	}
	const { sublime } = await import('@uiw/codemirror-theme-sublime')
	return sublime
}
