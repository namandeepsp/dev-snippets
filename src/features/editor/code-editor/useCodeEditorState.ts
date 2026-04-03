import { useRef, useState } from 'react'

/**
 * State management for CodeEditor component.
 * Handles: copied status, formatting errors, error accordion.
 */
export function useCodeEditorState() {
	const [copied, setCopied] = useState(false)
	const [formattingErrors, setFormattingErrors] = useState<string[]>([])
	const [isErrorAccordionOpen, setIsErrorAccordionOpen] = useState(false)
	const errorAccordionRef = useRef<HTMLDivElement>(null)
	const editorRef = useRef<HTMLDivElement>(null)

	const handleFormattingError = (error: string) => {
		setFormattingErrors([error])
		setIsErrorAccordionOpen(true)
	}

	const clearFormattingErrors = () => {
		setFormattingErrors([])
		setIsErrorAccordionOpen(false)
	}

	const handleErrorButtonClick = () => {
		setIsErrorAccordionOpen(true)
		// Scroll to the error accordion
		setTimeout(() => {
			errorAccordionRef.current?.scrollIntoView({
				behavior: 'smooth',
				block: 'nearest',
			})
		}, 100)
	}

	return {
		// State
		copied,
		formattingErrors,
		isErrorAccordionOpen,
		errorAccordionRef,
		editorRef,
		// Setters
		setCopied,
		setFormattingErrors,
		setIsErrorAccordionOpen,
		// Handlers
		handleFormattingError,
		clearFormattingErrors,
		handleErrorButtonClick,
	}
}
