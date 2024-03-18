# Rollwright

A set of tools to make Playwright comfortable for UI integration testing.

```js
import { test } from "rollwright";
import { expect } from "playwright";

test("isolated UI behavior", async ({ rollup }) => {
	await rollup(async () => {
		let { renderCounter } = await import("./implementation.js");
		let form = document.createElement("form");
		document.body.append(form);
		renderCounter(form);
	});

	await expect(page.locator("output")).toHaveText("0");
	await page.click("button");
	await expect(page.locator("output")).toHaveText("1");
});
```
