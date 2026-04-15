import { useRef, useState } from 'react'
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
