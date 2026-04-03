import type { EditorLanguage } from '../editor.config'
import { formatterRegistry } from '../formatter/formatter.registry'

/**
 * ============================================================================
 * LANGUAGE DETECTION
 * ============================================================================
 *
 * Language detection for code pasted into the editor.
 * Now delegates to the unified FormatterRegistry for all detection logic.
 */

/**
 * Detect the most appropriate language for pasted code.
 * This is the main entry point for language detection in the editor.
 *
 * @param code - The code to analyze
 * @param currentLanguage - The currently selected language in the editor
 * @param onLanguageDetected - Callback when a different language is detected
 * @returns The detected language (may be the same as currentLanguage)
 */
export async function resolvePasteLanguage(
	code: string,
	currentLanguage: EditorLanguage,
	onLanguageDetected?: (language: EditorLanguage) => void,
): Promise<EditorLanguage> {
	return formatterRegistry.resolvePasteLanguage(
		code,
		currentLanguage,
		onLanguageDetected,
	)
}
