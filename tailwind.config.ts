import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: [
        "./src/app/**/*.{ts,tsx}",
        "./src/features/**/*.{ts,tsx}",
        "./src/shared/**/*.{ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "rgb(var(--background) / <alpha-value>)",
                foreground: "rgb(var(--foreground) / <alpha-value>)",
                card: "rgb(var(--card) / <alpha-value>)",
                border: "rgb(var(--border) / <alpha-value>)",

                /* Technology colors (initial set) */
                js: "#f7df1e",
                react: "#61dafb",
                node: "#3c873a",
                express: "#444444",
                golang: "#00ADD8",
            },
            borderRadius: {
                lg: "0.75rem",
                xl: "1rem",
            },
        },
    },
    plugins: [],
};

export default config;
