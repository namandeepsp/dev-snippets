import { logger } from '@/shared/utils/logger'
import type { EditorLanguage } from '../editor.config'

/**
 * Pure heuristic-based language detection using regex patterns.
 * No external dependencies or async operations.
 */
export class HeuristicsDetector {
	detectFromHeuristics(code: string): EditorLanguage | null {
		// Go detection - FIRST and AGGRESSIVE
		// Go has unique keywords that Java doesn't have
		const goUniquePatterns = [
			/\bfunc\s+\w+\s*\(/, // func keyword
			/\bgo\s+\w+/, // go keyword (goroutine)
			/\bdefer\s+/, // defer keyword
			/\bchan\s+/, // chan keyword
			/\bselect\s*{/, // select statement
			/\bgoroutine/, // goroutine
			/\b:=\s*/, // short assignment operator
			/\brange\s+/, // range keyword
		]

		const goUniqueMatches = goUniquePatterns.filter((p) => p.test(code)).length

		// If ANY unique Go pattern is found, it's likely Go
		if (goUniqueMatches >= 1) {
			logger.info('🔍 Go unique patterns found:', goUniqueMatches)
			return 'go'
		}

		// Java detection - SECOND
		// Java has unique keywords that Go doesn't have
		const javaUniquePatterns = [
			/\bpublic\s+(class|interface|enum)/, // public class/interface/enum
			/\bimport\s+java\./, // import java.*
			/\bthrows\s+\w+/, // throws keyword
			/\bsynchronized\s+/, // synchronized keyword
			/\bextends\s+/, // extends keyword
			/\bimplements\s+/, // implements keyword
			/\b(private|protected)\s+(static\s+)?(final\s+)?(class|interface|enum|void|int|String)/, // access modifiers
		]

		const javaUniqueMatches = javaUniquePatterns.filter((p) =>
			p.test(code),
		).length

		// If ANY unique Java pattern is found, it's likely Java
		if (javaUniqueMatches >= 1) {
			logger.info('🔍 Java unique patterns found:', javaUniqueMatches)
			return 'java'
		}

		// Python detection
		if (code.includes('def ') || /\bimport\s+\w+/.test(code)) return 'python'

		// TypeScript detection
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

		// JavaScript detection
		if (
			code.includes('import React') ||
			code.includes('function') ||
			code.includes('const ') ||
			code.includes('let ')
		)
			return 'javascript'

		// Other languages...
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

		// CSS detection
		const cssPatterns = [
			/\.\w+\s*{/,
			/#\w+\s*{/,
			/@\w+/,
			/(color|font-size|margin):\s*\w+/,
		]
		if (cssPatterns.some((p) => p.test(code))) return 'css'

		// YAML detection
		const yamlPatterns = [/^\s*\w+:\s*[\w\-"'{}[\]]/, /apiVersion:/, /kind:/]
		const lines = code.split('\n').filter((l) => l.trim())
		const hasYamlStructure = lines.some(
			(l) => /^\s+\w+:\s/.test(l) && !l.includes('"') && !l.includes("'"),
		)
		if (yamlPatterns.some((p) => p.test(code)) || hasYamlStructure)
			return 'yaml'

		// JSON detection
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
