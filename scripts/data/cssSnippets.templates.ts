import type { SnippetTemplate } from './snippet.templates'

export const CSS_SNIPPET_TEMPLATES: SnippetTemplate[] = [
	{
		title: 'Flexbox Container',
		description:
			'Flexible box layout for responsive designs. Usage: Apply to parent container',
		code: `.flex-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.flex-item {
  flex: 1;
  min-width: 200px;
}`,
		language: 'css',
		technologies: ['css'],
		categories: ['frontend'],
	},
	{
		title: 'CSS Grid Layout',
		description:
			'Grid-based layout system for complex designs. Usage: Define grid-template-columns',
		code: `.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  padding: 2rem;
}

.grid-item {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}`,
		language: 'css',
		technologies: ['css'],
		categories: ['frontend'],
	},
	{
		title: 'Responsive Typography',
		description:
			'Fluid typography that scales with viewport. Usage: Use clamp() for responsive sizing',
		code: `h1 {
  font-size: clamp(1.5rem, 5vw, 3rem);
  line-height: 1.2;
  margin-bottom: 1rem;
}

p {
  font-size: clamp(0.875rem, 2vw, 1.125rem);
  line-height: 1.6;
  color: #333;
}`,
		language: 'css',
		technologies: ['css'],
		categories: ['frontend'],
	},
	{
		title: 'Smooth Transitions',
		description:
			'Smooth animations and transitions for interactive elements. Usage: Apply to hover states',
		code: `.button {
  background: #007bff;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.button:hover {
  background: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}`,
		language: 'css',
		technologies: ['css'],
		categories: ['frontend'],
	},
	{
		title: 'Dark Mode Toggle',
		description:
			'CSS variables for easy dark mode implementation. Usage: Toggle data-theme attribute',
		code: `:root {
  --bg-color: #ffffff;
  --text-color: #000000;
  --border-color: #e0e0e0;
}

[data-theme="dark"] {
  --bg-color: #1a1a1a;
  --text-color: #ffffff;
  --border-color: #333333;
}

body {
  background-color: var(--bg-color);
  color: var(--text-color);
  transition: background-color 0.3s, color 0.3s;
}`,
		language: 'css',
		technologies: ['css'],
		categories: ['frontend'],
	},
	{
		title: 'Gradient Background',
		description:
			'Beautiful gradient backgrounds with multiple colors. Usage: Customize colors as needed',
		code: `.gradient-bg {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.gradient-text {
  background: linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: bold;
}`,
		language: 'css',
		technologies: ['css'],
		categories: ['frontend'],
	},
	{
		title: 'Box Shadow Effects',
		description:
			'Various shadow effects for depth and elevation. Usage: Apply to cards and containers',
		code: `.shadow-sm {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.shadow-md {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.shadow-lg {
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.shadow-xl {
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
}`,
		language: 'css',
		technologies: ['css'],
		categories: ['frontend'],
	},
	{
		title: 'Border Radius Utilities',
		description:
			'Rounded corner utilities for different elements. Usage: Apply to any element',
		code: `.rounded-sm {
  border-radius: 0.25rem;
}

.rounded {
  border-radius: 0.375rem;
}

.rounded-md {
  border-radius: 0.5rem;
}

.rounded-lg {
  border-radius: 0.75rem;
}

.rounded-full {
  border-radius: 9999px;
}`,
		language: 'css',
		technologies: ['css'],
		categories: ['frontend'],
	},
	{
		title: 'Responsive Padding/Margin',
		description:
			'Responsive spacing utilities using CSS variables. Usage: Adjust base values',
		code: `:root {
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
}

.p-md { padding: var(--spacing-md); }
.m-lg { margin: var(--spacing-lg); }
.px-lg { padding-left: var(--spacing-lg); padding-right: var(--spacing-lg); }
.my-xl { margin-top: var(--spacing-xl); margin-bottom: var(--spacing-xl); }`,
		language: 'css',
		technologies: ['css'],
		categories: ['frontend'],
	},
	{
		title: 'Text Truncation',
		description:
			'Truncate text with ellipsis for single and multiple lines. Usage: Apply to text containers',
		code: `.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}`,
		language: 'css',
		technologies: ['css'],
		categories: ['frontend'],
	},
	{
		title: 'Hover Effects',
		description:
			'Collection of hover effects for interactive elements. Usage: Apply to buttons and links',
		code: `.hover-scale:hover {
  transform: scale(1.05);
}

.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.hover-glow:hover {
  box-shadow: 0 0 20px rgba(255, 107, 107, 0.5);
}

.hover-rotate:hover {
  transform: rotate(5deg);
}`,
		language: 'css',
		technologies: ['css'],
		categories: ['frontend'],
	},
	{
		title: 'Overlay Patterns',
		description:
			'Overlay effects for images and backgrounds. Usage: Apply to image containers',
		code: `.overlay {
  position: relative;
  overflow: hidden;
}

.overlay::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  transition: background 0.3s ease;
}

.overlay:hover::before {
  background: rgba(0, 0, 0, 0.3);
}`,
		language: 'css',
		technologies: ['css'],
		categories: ['frontend'],
	},
	{
		title: 'Scrollbar Styling',
		description:
			'Custom scrollbar styling for webkit browsers. Usage: Apply to scrollable containers',
		code: `.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #888 #f1f1f1;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #555;
}`,
		language: 'css',
		technologies: ['css'],
		categories: ['frontend'],
	},
	{
		title: 'Aspect Ratio Container',
		description:
			'Maintain aspect ratio for responsive images and videos. Usage: Set data-aspect-ratio',
		code: `.aspect-ratio {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* 16:9 */
}

.aspect-ratio-4-3 {
  padding-bottom: 75%;
}

.aspect-ratio-1-1 {
  padding-bottom: 100%;
}

.aspect-ratio > * {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}`,
		language: 'css',
		technologies: ['css'],
		categories: ['frontend'],
	},
	{
		title: 'Backdrop Blur Effect',
		description:
			'Frosted glass effect with backdrop blur. Usage: Apply to overlays and modals',
		code: `.backdrop-blur {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.1);
}

.glass-effect {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 10px;
  padding: 2rem;
}`,
		language: 'css',
		technologies: ['css'],
		categories: ['frontend'],
	},
	{
		title: 'Animation Keyframes',
		description:
			'Reusable animation keyframes for common effects. Usage: Apply animation property',
		code: `@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.fade-in { animation: fadeIn 0.5s ease-in; }
.slide-in { animation: slideIn 0.5s ease-out; }
.bounce { animation: bounce 1s infinite; }`,
		language: 'css',
		technologies: ['css'],
		categories: ['frontend'],
	},
	{
		title: 'Focus Styles',
		description:
			'Accessible focus styles for keyboard navigation. Usage: Apply to interactive elements',
		code: `button:focus,
input:focus,
a:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

.focus-visible:focus-visible {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

input:focus-within {
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}`,
		language: 'css',
		technologies: ['css'],
		categories: ['frontend'],
	},
	{
		title: 'Print Styles',
		description:
			'CSS for optimizing print layout. Usage: Automatically applied when printing',
		code: `@media print {
  body {
    font-size: 12pt;
    line-height: 1.5;
    color: black;
    background: white;
  }
  
  .no-print {
    display: none;
  }
  
  a {
    text-decoration: underline;
  }
  
  page-break-inside: avoid;
}`,
		language: 'css',
		technologies: ['css'],
		categories: ['frontend'],
	},
	{
		title: 'Mobile First Media Queries',
		description:
			'Responsive design using mobile-first approach. Usage: Start with mobile styles',
		code: `/* Mobile styles (default) */
.container {
  width: 100%;
  padding: 1rem;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    width: 750px;
    margin: 0 auto;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    width: 960px;
  }
}

/* Large Desktop */
@media (min-width: 1280px) {
  .container {
    width: 1200px;
  }
}`,
		language: 'css',
		technologies: ['css'],
		categories: ['frontend'],
	},
	{
		title: 'CSS Counters',
		description:
			'Automatic numbering for lists and sections. Usage: Use counter-increment',
		code: `.numbered-list {
  counter-reset: item;
  list-style: none;
  padding: 0;
}

.numbered-list li {
  counter-increment: item;
  margin-bottom: 0.5rem;
  padding-left: 2rem;
}

.numbered-list li::before {
  content: counter(item) ". ";
  font-weight: bold;
  margin-left: -2rem;
}`,
		language: 'css',
		technologies: ['css'],
		categories: ['frontend'],
	},
]
