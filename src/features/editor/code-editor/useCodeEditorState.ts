import { useEffect, useRef, useState } from 'react'
export function useCodeEditorState(initialErrors?: string[]) {
	const [copied, setCopied] = useState(false)
	const [formattingErrors, setFormattingErrors] = useState<string[]>(
		initialErrors || [],
	)
	const [isErrorAccordionOpen, setIsErrorAccordionOpen] = useState(
		Boolean(initialErrors && initialErrors.length > 0),
	)
	const errorAccordionRef = useRef<HTMLDivElement>(null)
	const editorRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		setFormattingErrors(initialErrors || [])
		setIsErrorAccordionOpen(Boolean(initialErrors && initialErrors.length > 0))
	}, [initialErrors])

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
		setTimeout(() => {
			errorAccordionRef.current?.scrollIntoView({
				behavior: 'smooth',
				block: 'nearest',
			})
		}, 100)
	}

	return {
		copied,
		formattingErrors,
		isErrorAccordionOpen,
		errorAccordionRef,
		editorRef,
		setCopied,
		setFormattingErrors,
		setIsErrorAccordionOpen,
		handleFormattingError,
		clearFormattingErrors,
		handleErrorButtonClick,
	}
}
