import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
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
					{ text: "Tooling Configuration", link: "/configuration" },
					{ text: "Framework Integration", link: "/integration" },
					{ text: "Test Coverage", link: "/coverage" },
					{ text: "Code Mocking", link: "/mocking" },
					{ text: "Solutions Comparison", link: "/comparison" },
				],
			},
			{
				text: "Reference",
				items: [],
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
