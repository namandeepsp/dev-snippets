export type EditorLanguage =
	| 'javascript'
	| 'typescript'
	| 'json'
	| 'html'
	| 'css'
	| 'go'
	| 'python'
	| 'markdown'
	| 'sql'
	| 'yaml'
	| 'rust'
	| 'ruby'
	| 'php'
	| 'java'
	| 'csharp'
	| 'cpp'
	| 'bash'
	| 'dockerfile'

export type EditorTheme = 'light' | 'dark' | 'system'

export type EditorConfig = {
	label: string
	icon: string
	formatter:
		| 'prettier'
		| 'gofmt'
		| 'black'
		| 'sql-formatter'
		| 'markdown'
		| 'google-java-format'
		| 'none'
	monacoLanguage: string
	color: string
	extensions: string[]
}

export const EDITOR_LANGUAGES: Record<EditorLanguage, EditorConfig> = {
	javascript: {
		label: 'JavaScript',
		icon: '🟨',
		formatter: 'prettier',
		monacoLanguage: 'javascript',
		color: '#f7df1e',
		extensions: ['.js', '.jsx', '.mjs'],
	},
	typescript: {
		label: 'TypeScript',
		icon: '🔷',
		formatter: 'prettier',
		monacoLanguage: 'typescript',
		color: '#3178c6',
		extensions: ['.ts', '.tsx', '.mts'],
	},
	json: {
		label: 'JSON',
		icon: '📋',
		formatter: 'prettier',
		monacoLanguage: 'json',
		color: '#8a4182',
		extensions: ['.json', '.jsonc'],
	},
	html: {
		label: 'HTML',
		icon: '🌐',
		formatter: 'prettier',
		monacoLanguage: 'html',
		color: '#e34c26',
		extensions: ['.html', '.htm'],
	},
	css: {
		label: 'CSS',
		icon: '🎨',
		formatter: 'prettier',
		monacoLanguage: 'css',
		color: '#563d7c',
		extensions: ['.css', '.scss', '.sass', '.less'],
	},
	go: {
		label: 'Go',
		icon: '🐹',
		formatter: 'gofmt',
		monacoLanguage: 'go',
		color: '#00add8',
		extensions: ['.go'],
	},
	python: {
		label: 'Python',
		icon: '🐍',
		formatter: 'black',
		monacoLanguage: 'python',
		color: '#3776ab',
		extensions: ['.py', '.pyw'],
	},
	markdown: {
		label: 'Markdown',
		icon: '📝',
		formatter: 'markdown',
		monacoLanguage: 'markdown',
		color: '#083fa1',
		extensions: ['.md', '.markdown'],
	},
	sql: {
		label: 'SQL',
		icon: '🗄️',
		formatter: 'sql-formatter',
		monacoLanguage: 'sql',
		color: '#e38d13',
		extensions: ['.sql'],
	},
	yaml: {
		label: 'YAML',
		icon: '📄',
		formatter: 'prettier',
		monacoLanguage: 'yaml',
		color: '#cb171e',
		extensions: ['.yml', '.yaml'],
	},
	rust: {
		label: 'Rust',
		icon: '🦀',
		formatter: 'none',
		monacoLanguage: 'rust',
		color: '#dea584',
		extensions: ['.rs'],
	},
	ruby: {
		label: 'Ruby',
		icon: '💎',
		formatter: 'none',
		monacoLanguage: 'ruby',
		color: '#cc342d',
		extensions: ['.rb'],
	},
	php: {
		label: 'PHP',
		icon: '🐘',
		formatter: 'none',
		monacoLanguage: 'php',
		color: '#777bb4',
		extensions: ['.php'],
	},
	java: {
		label: 'Java',
		icon: '☕',
		formatter: 'google-java-format',
		monacoLanguage: 'java',
		color: '#b07219',
		extensions: ['.java'],
	},
	csharp: {
		label: 'C#',
		icon: '🎯',
		formatter: 'none',
		monacoLanguage: 'csharp',
		color: '#178600',
		extensions: ['.cs'],
	},
	cpp: {
		label: 'C++',
		icon: '⚙️',
		formatter: 'none',
		monacoLanguage: 'cpp',
		color: '#f34b7d',
		extensions: ['.cpp', '.hpp', '.cc'],
	},
	bash: {
		label: 'Bash',
		icon: '🐚',
		formatter: 'none',
		monacoLanguage: 'shell',
		color: '#89e051',
		extensions: ['.sh', '.bash'],
	},
	dockerfile: {
		label: 'Docker',
		icon: '🐳',
		formatter: 'none',
		monacoLanguage: 'dockerfile',
		color: '#2496ed',
		extensions: ['Dockerfile'],
	},
}

export const SUPPORTED_LANGUAGES = Object.keys(
	EDITOR_LANGUAGES,
) as EditorLanguage[]

export function getLanguageConfig(language: EditorLanguage): EditorConfig {
	return EDITOR_LANGUAGES[language]
}

export function hasFormatter(language: EditorLanguage): boolean {
	return EDITOR_LANGUAGES[language]?.formatter !== 'none'
}

export const DEFAULT_LANGUAGE: EditorLanguage = 'javascript'
