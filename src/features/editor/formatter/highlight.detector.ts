import { logger } from '@/shared/utils/logger'
import type { EditorLanguage } from '../editor.config'

/**
 * Highlight.js integration for language detection.
 * Handles dynamic language module loading and detection.
 */
export class HighlightDetector {
	private highlightApi: any = null

	async initialize(): Promise<void> {
		try {
			const coreModule = await import('highlight.js/lib/core')
			const hljs = coreModule.default

			const languages: [string, () => Promise<{ default: unknown }>][] = [
				['javascript', () => import('highlight.js/lib/languages/javascript')],
				['typescript', () => import('highlight.js/lib/languages/typescript')],
				['json', () => import('highlight.js/lib/languages/json')],
				['xml', () => import('highlight.js/lib/languages/xml')],
				['css', () => import('highlight.js/lib/languages/css')],
				['python', () => import('highlight.js/lib/languages/python')],
				['java', () => import('highlight.js/lib/languages/java')],
				['go', () => import('highlight.js/lib/languages/go')],
				['cpp', () => import('highlight.js/lib/languages/cpp')],
				['rust', () => import('highlight.js/lib/languages/rust')],
				['php', () => import('highlight.js/lib/languages/php')],
				['sql', () => import('highlight.js/lib/languages/sql')],
				['markdown', () => import('highlight.js/lib/languages/markdown')],
				['yaml', () => import('highlight.js/lib/languages/yaml')],
				['bash', () => import('highlight.js/lib/languages/bash')],
				['shell', () => import('highlight.js/lib/languages/shell')],
				['ruby', () => import('highlight.js/lib/languages/ruby')],
				['csharp', () => import('highlight.js/lib/languages/csharp')],
				['dockerfile', () => import('highlight.js/lib/languages/dockerfile')],
			]

			const languageEntries = await Promise.all(
				languages.map(
					async ([name, loader]) => [name, (await loader()).default] as const,
				),
			)

			for (const [name, language] of languageEntries) {
				hljs.registerLanguage(name, language as any)
			}

			this.highlightApi = hljs
		} catch (error) {
			logger.warn('Failed to initialize highlight.js', error)
		}
	}

	detectFromHighlight(code: string): EditorLanguage | null {
		if (!this.highlightApi) return null

		try {
			const result = this.highlightApi.highlightAuto(code, [
				'go',
				'java',
				'javascript',
				'typescript',
				'json',
				'xml',
				'css',
				'python',
				'cpp',
				'rust',
				'php',
				'sql',
				'markdown',
				'yaml',
				'bash',
				'shell',
				'ruby',
				'csharp',
				'dockerfile',
			])

			const detected = result?.language
			if (!detected) return null

			const mapping: Record<string, EditorLanguage> = {
				javascript: 'javascript',
				typescript: 'typescript',
				json: 'json',
				xml: 'html',
				html: 'html',
				css: 'css',
				python: 'python',
				java: 'java',
				cpp: 'cpp',
				rust: 'rust',
				php: 'php',
				sql: 'sql',
				markdown: 'markdown',
				yaml: 'yaml',
				bash: 'bash',
				shell: 'bash',
				go: 'go',
				ruby: 'ruby',
				csharp: 'csharp',
				dockerfile: 'dockerfile',
			}

			return mapping[detected] || null
		} catch {
			return null
		}
	}
}
