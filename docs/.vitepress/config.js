import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
	base: process.env.CI != null ? "/rollwright/" : undefined,
	title: "Rollwright",
	description:
		"A set of tools to make Playwright comfortable for UI integration testing.",
	themeConfig: {
		search: { provider: "local" },

		nav: [{ text: "Guide", link: "/introduction" }],

		sidebar: [
			{
				text: "Guidelines",
				items: [
					{ text: "Introduction", link: "/introduction" },
					{ text: "How it works", link: "/internals" },
					{ text: "Tooling Configuration", link: "/configuration" },
					{ text: "Framework Integration", link: "/integration" },
					{ text: "Test Coverage", link: "/coverage" },
					{ text: "Code Mocking", link: "/mocking" },
					{ text: "Solutions Comparison", link: "/comparison" },
				],
			},
			{
				text: "Reference",
				items: [
					{ text: "rollwright", link: "/ref/rollwright" },
					{
						text: "rollup-plugin-worker-url",
						link: "/ref/rollup-plugin-worker-url",
					},
				],
			},
		],

		socialLinks: [
			{
				icon: "github",
				link: "https://github.com/unknownprinciple/rollwright",
			},
		],

		footer: {
			message: "Released under ISC License.",
			copyright: "Copyright &copy; 2024 Oleksii Raspopov",
		},
	},
});
