"use strict";
/**
 * ============================================================================
 * EDITOR CONFIGURATION
 * ============================================================================
 *
 * Central configuration for the code editor feature.
 * Defines supported languages, formatter mappings, and display settings.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_LANGUAGE = exports.SUPPORTED_LANGUAGES = exports.EDITOR_LANGUAGES = void 0;
exports.getLanguageConfig = getLanguageConfig;
exports.hasFormatter = hasFormatter;
exports.EDITOR_LANGUAGES = {
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
        formatter: 'none',
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
        formatter: 'none',
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
};
exports.SUPPORTED_LANGUAGES = Object.keys(exports.EDITOR_LANGUAGES);
/**
 * Get language configuration by language ID
 */
function getLanguageConfig(language) {
    return exports.EDITOR_LANGUAGES[language];
}
/**
 * Check if a language has a formatter
 */
function hasFormatter(language) {
    var _a;
    return ((_a = exports.EDITOR_LANGUAGES[language]) === null || _a === void 0 ? void 0 : _a.formatter) !== 'none';
}
/**
 * Get default language (JavaScript)
 */
exports.DEFAULT_LANGUAGE = 'javascript';
