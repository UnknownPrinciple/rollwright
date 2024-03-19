import { test } from "./fixtures";
import { expect } from "@playwright/test";

test("app module bootstrap", async ({ page, rollup }) => {
	await rollup(async () => {
		let main = document.createElement("main");
		main.innerHTML = `<app-root></app-root>`;
		document.body.append(main);

		let { platformBrowserDynamic } = await import("@angular/platform-browser-dynamic");
		let { AppModule } = await import("./app.module");
		await import("zone.js");

		platformBrowserDynamic().bootstrapModule(AppModule);
	});

	await expect(page.locator("main")).toContainText("Hello, Angular");
});
