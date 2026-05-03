import JSZip from 'jszip'
import type { SnippetFile } from '../../core/snippet.types'

export async function downloadSingleFile(
	file: SnippetFile,
	_snippetTitle: string,
) {
	const element = document.createElement('a')
	const file_blob = new Blob([file.code], { type: 'text/plain' })
	element.href = URL.createObjectURL(file_blob)
	element.download = file.filename
	document.body.appendChild(element)
	element.click()
	document.body.removeChild(element)
	URL.revokeObjectURL(element.href)
}

export async function downloadMultipleFilesAsZip(
	files: SnippetFile[],
	snippetTitle: string,
) {
	const zip = new JSZip()
	const folder = zip.folder(snippetTitle) || zip

	files.forEach((file) => {
		folder.file(file.filename, file.code)
	})

	const blob = await zip.generateAsync({ type: 'blob' })
	const element = document.createElement('a')
	element.href = URL.createObjectURL(blob)
	element.download = `${snippetTitle}.zip`
	document.body.appendChild(element)
	element.click()
	document.body.removeChild(element)
	URL.revokeObjectURL(element.href)
}

export async function exportSnippet(
	files: SnippetFile[],
	snippetTitle: string,
) {
	if (files.length === 1) {
		await downloadSingleFile(files[0], snippetTitle)
	} else {
		await downloadMultipleFilesAsZip(files, snippetTitle)
	}
}
