import { expect } from "@playwright/test";
import { test } from "rollwright";
import { worker } from "rollup-plugin-worker-url";
import alias from "@rollup/plugin-alias";

test.use({
	plugins: [worker(), alias({ entries: { "./work.js": "./work.mock.js" } })],
});

test("sum 1", async ({ execute }) => {
	let res = await execute(async (from) => {
		let element = document.createElement("div");
		document.body.append(element);

		let { sum } = await import("./math.js");
		let worker = new Worker(new URL("./work.js", import.meta.url), { type: "module" });
		worker.onmessage = (event) => {
			element.append(document.createTextNode(JSON.stringify(event.data)));
		};
		worker.postMessage("");
		element.append(document.createTextNode(String(sum(from, 2))));

		return element;
	}, 1);

	await expect(res.asElement().innerText()).resolves.toContain("3");
	await expect(res.asElement().innerText()).resolves.toContain("faked");
});
