import { resolve, relative, dirname, basename } from "node:path";

import { test as base } from "@playwright/test";

import { rollup } from "rollup";
import { ephemeral } from "./ephemeral.js";
import { nodeResolve } from "@rollup/plugin-node-resolve";

import { Hono } from "hono/tiny";
import { getMimeType } from "hono/utils/mime";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";

export let test = base.extend({
	setup: [setup, { scope: "worker" }],
	rollup: [execute, { scope: "test" }],
});

async function setup({}, use) {
	async function setup(options) {
		Object.assign(setup, options);
	}

	await use(setup);
}

async function execute({ page, setup }, use, testInfo) {
	let server = new Hono();
	let connect = null;
	let template = setup.template ?? `<!doctype html><html><head></head><body></body></html>`;
	server.get("/", (ctx) => ctx.html(template));

	let staticRoot = setup.staticRoot ?? relative(process.cwd(), dirname(testInfo.file));
	let statics = serveStatic({ root: staticRoot });
	server.notFound(async (ctx) => {
		let response = await statics(ctx, () => Promise.resolve(null));
		return response != null ? response : ctx.body(null, 404);
	});

	let cache;
	let id = -1;
	let extra = setup.plugins ?? [];
	let extensions = setup.extensions ?? [".js", ".mjs", ".cjs", ".json", ".ts", ".tsx"];

	async function evaluate(fn, ...args) {
		let hash = `step_${++id}`;
		let code = `window.${hash} = ${fn.toString()};`;
		let filename = resolve(dirname(testInfo.file), hash + basename(testInfo.file));
		let input = basename(filename);
		let bundle = await rollup({
			cache,
			input,
			plugins: [
				...extra,
				nodeResolve({ browser: true, rootDir: dirname(filename), extensions }),
				ephemeral(filename, code),
			],
			logLevel: "silent",
		});

		let { output } = await bundle.generate({
			format: "esm",
			manualChunks(id) {
				if (id.startsWith("/")) return relative(process.cwd(), id).replace(/\.\.\//g, "_");
			},
		});
		cache = bundle.cache;

		for (let asset of output) {
			let source = asset.type === "chunk" ? asset.code : asset.source;
			let headers = { "Content-Type": getMimeType(asset.fileName) };
			server.get(asset.fileName, (ctx) => ctx.body(source, 200, headers));
		}

		if (connect == null) {
			let { address, port } = await new Promise((resolve) => {
				connect = serve({ fetch: server.fetch, port: 0 });
				connect.once("listening", () => resolve(connect.address()));
			});
			await page.goto(`http://${address}:${port}/`);
		}

		let entry = output.find((asset) => asset.type === "chunk" && asset.isEntry);

		let params = [entry.fileName, hash, args];
		return await page.evaluateHandle(([src, hash, args]) => {
			return new Promise((resolve, reject) => {
				let onload = () => resolve(window[hash](...args));
				let onerror = () => reject();
				let script = document.createElement("script");
				document.head.append(Object.assign(script, { type: "module", src, onload, onerror }));
			});
		}, params);
	}

	await use(evaluate);

	connect?.close();
}
