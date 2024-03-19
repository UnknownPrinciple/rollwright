import { expect } from "@playwright/test";
import { test } from "rollwright";

test.beforeAll(({ setup }) => {
	setup({
		template: `<body><div id="app">{{ message }}</div></body>`,
	});
});

test("basic app bootstrap", async ({ page, rollup }) => {
	await rollup(async () => {
		let { createApp, ref } = await import("https://unpkg.com/vue@3/dist/vue.esm-browser.js");

		createApp({
			setup() {
				const message = ref("Hello Vue!");
				return { message };
			},
		}).mount("#app");
	});

	await expect(page.locator("#app")).toContainText("Hello Vue!");
});
