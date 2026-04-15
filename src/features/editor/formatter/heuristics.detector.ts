import { logger } from '@/shared/utils/logger'
import type { EditorLanguage } from '../editor.config'

export class HeuristicsDetector {
	detectFromHeuristics(code: string): EditorLanguage | null {
		const goUniquePatterns = [
			/\bfunc\s+\w+\s*\(/,
			/\bgo\s+\w+/,
			/\bdefer\s+/,
			/\bchan\s+/,
			/\bselect\s*{/,
			/\bgoroutine/,
			/\b:=\s*/,
			/\brange\s+/,
		]

		const goUniqueMatches = goUniquePatterns.filter((p) => p.test(code)).length

		if (goUniqueMatches >= 1) {
			logger.info('🔍 Go unique patterns found:', goUniqueMatches)
			return 'go'
		}

		const javaUniquePatterns = [
			/\bpublic\s+(class|interface|enum)/,
			/\bimport\s+java\./,
			/\bthrows\s+\w+/,
			/\bsynchronized\s+/,
			/\bextends\s+/,
			/\bimplements\s+/,
			/\b(private|protected)\s+(static\s+)?(final\s+)?(class|interface|enum|void|int|String)/,
		]

		const javaUniqueMatches = javaUniquePatterns.filter((p) =>
			p.test(code),
		).length

		if (javaUniqueMatches >= 1) {
			logger.info('🔍 Java unique patterns found:', javaUniqueMatches)
			return 'java'
		}

		if (code.includes('def ') || /\bimport\s+\w+/.test(code)) return 'python'

		const tsPatterns = [
			/interface\s+\w+/,
			/type\s+\w+\s*=/,
			/enum\s+\w+/,
			/:\s*(string|number|boolean)/,
			/<\w+.*>\s*\(/,
			/as\s+\w+/,
			/satisfies\s+\w+/,
		]
		if (tsPatterns.some((p) => p.test(code))) return 'typescript'

		if (
			code.includes('import React') ||
			code.includes('function') ||
			code.includes('const ') ||
			code.includes('let ')
		)
			return 'javascript'

		if (code.includes('fn ') || code.includes('let mut')) return 'rust'
		if (
			code.includes('<?php') ||
			(code.includes('namespace ') && code.includes(';'))
		)
			return 'php'
		if (code.includes('#include') || code.includes('int main')) return 'cpp'
		if (
			code.includes('using System') ||
			(code.includes('namespace ') && code.includes('{'))
		)
			return 'csharp'
		if (code.includes('SELECT') || code.includes('FROM')) return 'sql'
		if (code.includes('<html>') || code.includes('<div>')) return 'html'

		const cssPatterns = [
			/\.\w+\s*{/,
			/#\w+\s*{/,
			/@\w+/,
			/(color|font-size|margin):\s*\w+/,
		]
		if (cssPatterns.some((p) => p.test(code))) return 'css'

		const yamlPatterns = [/^\s*\w+:\s*[\w\-"'{}[\]]/, /apiVersion:/, /kind:/]
		const lines = code.split('\n').filter((l) => l.trim())
		const hasYamlStructure = lines.some(
			(l) => /^\s+\w+:\s/.test(l) && !l.includes('"') && !l.includes("'"),
		)
		if (yamlPatterns.some((p) => p.test(code)) || hasYamlStructure)
			return 'yaml'

		const jsonPatterns = [/"\w+"\s*:/, /'\w+'\s*:/, /\[\s*{/, /{\s*"[^"]+"\s*:/]
		const looksLikeJson =
			jsonPatterns.some((p) => p.test(code)) ||
			(code.includes('{') &&
				code.includes('}') &&
				!code.includes('function') &&
				!code.includes('const') &&
				(code.includes('"') || code.includes("'")))
		if (looksLikeJson) return 'json'

		return null
	}
}
