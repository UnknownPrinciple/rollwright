# Rollwright

A set of tools to make [Playwright](https://playwright.dev) comfortable for UI integration testing.

Playwright is a feature rich platform for browser automation. Playwright Test is a powerful testing
framework built on top of the automation capabilities. The main target of the testing framework is
end-to-end tests, so often developers has to opt for other testing framework (Jest, Vitest, etc).

```js
import { test } from "rollwright";
import { expect } from "@playwright/test";

test("isolated UI behavior", async ({ execute }) => {
  await execute(async () => {
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
