import type { EditorLanguage } from '../editor.config'
import { formatterRegistry } from '../formatter/formatter.registry'

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
