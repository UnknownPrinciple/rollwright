import { test } from "./fixtures";
import { expect } from "@playwright/test";

test("wrappers", async ({ sinon, mount }) => {
	let stub = await sinon((lib) => lib.stub());
	let button = await mount((cb) => <button onClick={cb}>Click</button>, stub);

	await button.click();

	expect(await stub.evaluate((mock) => mock.callCount)).toEqual(1);
});
