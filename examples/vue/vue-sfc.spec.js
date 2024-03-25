import { expect } from "@playwright/test";
import { test } from "rollwright";
import vue from "rollup-plugin-vue";
import replace from "@rollup/plugin-replace";

test.use({
	plugins: [replace({ "process.env.NODE_ENV": JSON.stringify("development") }), vue()],
	template: `<body><div id="app"></div></body>`,
});

test("component bootstrap", async ({ page, execute }) => {
	await execute(async () => {
		let { createApp } = await import("vue");
		let { default: Counter } = await import("./Counter.vue");
		createApp(Counter).mount("#app");
	});

	await expect(page.locator("button")).toContainText("Count is: 0");
	await page.click("button");
	await expect(page.locator("button")).toContainText("Count is: 1");
});
