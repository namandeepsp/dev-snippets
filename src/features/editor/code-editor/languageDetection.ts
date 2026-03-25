import type { EditorLanguage } from '../editor.config'
import { SUPPORTED_LANGUAGES } from '../editor.config'

type HighlightApi = {
	registerLanguage: (name: string, language: unknown) => void
	highlightAuto: (
		code: string,
		languages?: string[],
	) => { language?: string | null }
}

const HIGHLIGHT_LANGUAGE_IMPORTS: Record<
	string,
	() => Promise<{ default: unknown }>
> = {
	javascript: () => import('highlight.js/lib/languages/javascript'),
	typescript: () => import('highlight.js/lib/languages/typescript'),
	json: () => import('highlight.js/lib/languages/json'),
	xml: () => import('highlight.js/lib/languages/xml'),
	css: () => import('highlight.js/lib/languages/css'),
	python: () => import('highlight.js/lib/languages/python'),
	java: () => import('highlight.js/lib/languages/java'),
	cpp: () => import('highlight.js/lib/languages/cpp'),
	rust: () => import('highlight.js/lib/languages/rust'),
	php: () => import('highlight.js/lib/languages/php'),
	sql: () => import('highlight.js/lib/languages/sql'),
	markdown: () => import('highlight.js/lib/languages/markdown'),
	yaml: () => import('highlight.js/lib/languages/yaml'),
	bash: () => import('highlight.js/lib/languages/bash'),
	shell: () => import('highlight.js/lib/languages/shell'),
	go: () => import('highlight.js/lib/languages/go'),
	ruby: () => import('highlight.js/lib/languages/ruby'),
	csharp: () => import('highlight.js/lib/languages/csharp'),
	dockerfile: () => import('highlight.js/lib/languages/dockerfile'),
}

const HIGHLIGHT_LANGUAGE_ALLOWLIST = Object.keys(HIGHLIGHT_LANGUAGE_IMPORTS)

const HIGHLIGHT_TO_EDITOR_LANGUAGE: Record<string, EditorLanguage> = {
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

let highlightReady: Promise<HighlightApi> | null = null

const getHighlightApi = async (): Promise<HighlightApi> => {
	if (!highlightReady) {
		highlightReady = (async () => {
			const coreModule = await import('highlight.js/lib/core')
			const hljs = coreModule.default as HighlightApi

			const languageEntries = await Promise.all(
				Object.entries(HIGHLIGHT_LANGUAGE_IMPORTS).map(
					async ([name, loader]) => [name, (await loader()).default] as const,
				),
			)

			for (const [name, language] of languageEntries) {
				hljs.registerLanguage(name, language)
			}

			return hljs
		})()
	}
	return highlightReady
}

const detectLanguageFromHeuristics = (code: string): EditorLanguage | null => {
	const typeScriptPatterns = [
		/interface\s+\w+/,
		/type\s+\w+\s*=/,
		/enum\s+\w+/,
		/:\s*(string|number|boolean|any|unknown|never|void)/,
		/<\w+.*>\s*\(/,
		/as\s+\w+/,
		/satisfies\s+\w+/,
		/readonly\s+\w+/,
		/Private\s+\w+/,
		/Public\s+\w+/,
		/Protected\s+\w+/,
		/Abstract\s+\w+/,
	]

	const hasTypeScriptSyntax = typeScriptPatterns.some((pattern) =>
		pattern.test(code),
	)

	const reactTSPatterns = [
		/React\.(FC|Component|ReactElement)/,
		/ReactNode/,
		/JSX\.Element/,
		/useState<\w+>/,
		/useEffect.*:\s*\w+/,
	]

	const hasReactTSPatterns = reactTSPatterns.some((pattern) =>
		pattern.test(code),
	)

	if (hasTypeScriptSyntax || hasReactTSPatterns) {
		return 'typescript'
	}

	if (
		code.includes('import React') ||
		code.includes('from "react"') ||
		code.includes("from 'react'")
	) {
		return 'javascript'
	}

	if (
		code.includes('function') ||
		code.includes('const ') ||
		code.includes('let ')
	) {
		return 'javascript'
	}

	if (code.includes('def ')) {
		return 'python'
	}

	if (code.includes('package ') || code.includes('public class')) {
		return 'java'
	}

	if (code.includes('fn ') || code.includes('let mut')) {
		return 'rust'
	}

	if (code.includes('func ') && code.includes('package ')) {
		return 'go'
	}

	if (
		code.includes('<?php') ||
		(code.includes('namespace ') && code.includes(';'))
	) {
		return 'php'
	}

	if (code.includes('#include') || code.includes('int main')) {
		return 'cpp'
	}

	if (
		code.includes('using System') ||
		(code.includes('namespace ') && code.includes('{'))
	) {
		return 'csharp'
	}

	if (
		code.includes('SELECT') ||
		code.includes('FROM') ||
		code.includes('WHERE')
	) {
		return 'sql'
	}

	if (code.includes('<html>') || code.includes('<div>')) {
		return 'html'
	}

	if (
		code.includes('{') &&
		code.includes('}') &&
		!code.includes('function') &&
		!code.includes('const')
	) {
		return 'json'
	}

	return null
}

const detectLanguageFromApi = async (
	code: string,
): Promise<EditorLanguage | null> => {
	try {
		const response = await fetch('/api/format/detect', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ code }),
		})

		if (!response.ok) return null

		const data = (await response.json()) as {
			language?: string | null
		}

		const detected =
			typeof data?.language === 'string' ? data.language.toLowerCase() : null

		if (!detected) return null

		return SUPPORTED_LANGUAGES.includes(detected as EditorLanguage)
			? (detected as EditorLanguage)
			: null
	} catch (_err) {
		return null
	}
}

type DetectionSource = 'heuristic' | 'highlight'

type DetectionResult = {
	language: EditorLanguage | null
	source: DetectionSource | null
}

const isJavaScriptFamily = (language: EditorLanguage) =>
	language === 'javascript' || language === 'typescript'

const detectLanguageFromCode = async (
	code: string,
): Promise<DetectionResult> => {
	const heuristicDetected = detectLanguageFromHeuristics(code)
	if (heuristicDetected) {
		return { language: heuristicDetected, source: 'heuristic' }
	}

	try {
		const hljs = await getHighlightApi()
		const result = hljs.highlightAuto(code, HIGHLIGHT_LANGUAGE_ALLOWLIST)
		const detected =
			typeof result?.language === 'string' ? result.language : null
		if (detected && detected in HIGHLIGHT_TO_EDITOR_LANGUAGE) {
			return {
				language: HIGHLIGHT_TO_EDITOR_LANGUAGE[detected],
				source: 'highlight',
			}
		}
	} catch (_err) {
		// Ignore highlight.js failures and fall back to heuristics.
	}

	return { language: null, source: null }
}

export async function resolvePasteLanguage(
	code: string,
	currentLanguage: EditorLanguage,
	onLanguageDetected?: (language: EditorLanguage) => void,
): Promise<EditorLanguage> {
	const { language: clientDetected, source } =
		await detectLanguageFromCode(code)
	if (clientDetected && clientDetected !== currentLanguage) {
		const shouldAccept =
			source === 'heuristic' ||
			!(
				source === 'highlight' &&
				isJavaScriptFamily(currentLanguage) &&
				!isJavaScriptFamily(clientDetected)
			)

		if (shouldAccept) {
			onLanguageDetected?.(clientDetected)
			return clientDetected
		}
	}

	const apiDetected = await detectLanguageFromApi(code)
	if (apiDetected && apiDetected !== currentLanguage) {
		onLanguageDetected?.(apiDetected)
		return apiDetected
	}

	return currentLanguage
}
