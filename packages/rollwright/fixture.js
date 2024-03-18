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
	rollup: [
		async ({ page }, use, testInfo) => {
			let server = new Hono();
			let connect = null;
			server.get("/", (ctx) => ctx.html(`<html><head></head><body></body></html>`));

			let statics = serveStatic({ root: relative(process.cwd(), dirname(testInfo.file)) });
			server.notFound(async (ctx) => {
				let response = await statics(ctx, () => Promise.resolve(null));
				return response != null ? response : ctx.body(null, 404);
			});

			let cache;
			let id = -1;
			let extra = [];

			function configurate(plugins) {
				extra.push(...plugins);
			}

			async function evaluate(fn, ...args) {
				let code = `window.run${++id} = ${fn.toString()};`;
				let filename = resolve(dirname(testInfo.file), id + basename(testInfo.file));
				let input = basename(filename);
				let bundle = await rollup({
					cache,
					input,
					plugins: [
						...extra,
						nodeResolve({
							browser: true,
							rootDir: dirname(filename),
							extensions: [".js", ".mjs", ".cjs", ".json", ".ts", ".tsx"],
						}),
						ephemeral(filename, code),
					],
					logLevel: "silent",
				});
				cache = bundle.cache;

				let { output } = await bundle.generate({
					format: "esm",
					manualChunks(id) {
						if (id.startsWith("/")) return relative(process.cwd(), id).replace(/\.\.\//g, "_");
					},
				});

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

				await page.evaluate((src) => {
					return new Promise((onload) => {
						let script = document.createElement("script");
						Object.assign(script, { type: "module", src, onload });
						document.head.append(script);
					});
				}, entry.fileName);

				return await page.evaluateHandle(([id, args]) => window[`run${id}`](...args), [id, args]);
			}

			Object.assign(evaluate, { configurate });
			await use(evaluate);

			connect?.close();
		},
		{ scope: "test" },
	],
});
