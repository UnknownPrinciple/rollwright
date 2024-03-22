import { test } from "node:test";
import { equal } from "node:assert/strict";

import { rollup } from "rollup";
import { ephemeral } from "../rollwright/ephemeral.js";
import worker from "./plugin.js";

test("simple worker import", async () => {
	let bundle = await rollup({
		input: "index.js",
		plugins: [
			worker(),
			ephemeral("index.js", `let worker = new Worker(new URL("worker.js", import.meta.url));`),
			ephemeral("worker.js", `console.log(1)`),
		],
	});

	let { output } = await bundle.generate({ format: "esm" });
	let echunk = output.find((chunk) => chunk.isEntry);
	equal(echunk.facadeModuleId, "index.js");
	let wchunk = output.find((chunk) => echunk.referencedFiles.includes(chunk.fileName));
	equal(wchunk.facadeModuleId, "worker.js");
});
