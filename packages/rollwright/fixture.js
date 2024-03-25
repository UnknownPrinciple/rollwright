import { resolve, relative, dirname, basename, extname } from "node:path";

import { test as base } from "@playwright/test";

import { rollup } from "rollup";
import { ephemeral } from "./ephemeral.js";
import { createCoverageCollector } from "./coverage-collector.js";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { makeLegalIdentifier } from "@rollup/pluginutils";

import { Hono } from "hono/tiny";
import { getMimeType } from "hono/utils/mime";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";

export let test = base.extend({
	plugins: [[], { option: true }],
	template: [`<!doctype html><html><head></head><body></body></html>`, { option: true }],
	staticRoot: [null, { option: true }],
	extensions: [[".js", ".mjs", ".cjs", ".json", ".ts", ".tsx"], { option: true }],
	rlcache: [rlcache, { scope: "worker" }],
	execute: [execute, { scope: "test" }],
});

async function rlcache({}, use) {
	let cache;
	await use({
		load() {
			return cache;
		},
		save(bundleCache) {
			if (cache == null) {
				cache = {
					modules: bundleCache.modules.filter((m) => !m.originalCode.startsWith("window.step_")),
					plugins: bundleCache.plugins,
				};
			} else {
				for (let mod of bundleCache.modules) {
					if (!mod.originalCode.startsWith("window.step_")) {
						let index = cache.modules.findIndex((m) => m.id === mod.id);
						if (index >= 0) {
							cache.modules[index] = mod;
						} else cache.modules.push(mod);
					}
				}
				Object.assign(cache.plugins, bundleCache.plugins);
			}
		},
	});
}

async function execute(
	{ page, rlcache, plugins, template, staticRoot, extensions },
	use,
	testInfo,
) {
	let reporterName = "rollwright/coverage-reporter";
	let shouldInstrument = testInfo.config.reporter.some(
		(v) => v != null && (v.includes(reporterName) || v[0].includes(reporterName)),
	);

	let server = new Hono();
	let connect = null;
	server.get("/", (ctx) => ctx.html(template));

	let root = staticRoot ?? relative(process.cwd(), dirname(testInfo.file));
	let statics = serveStatic({ root });
	server.notFound(async (ctx) => {
		let response = await statics(ctx, () => Promise.resolve(null));
		return response != null ? response : ctx.body(null, 404);
	});

	let coverageCollector = createCoverageCollector(shouldInstrument, server, page);

	let id = -1;

	async function evaluate(fn, ...args) {
		let hash = `step_${++id}`;
		let code = `window.${hash} = ${fn.toString()};`;
		let filename = resolve(dirname(testInfo.file), hash + basename(testInfo.file));
		let input = basename(filename);
		let bundle = await rollup({
			cache: rlcache.load(),
			input,
			plugins: [
				...plugins,
				coverageCollector.instrument({
					exclude: [new RegExp(input.replace(/\./, "\\.")), /node_modules/],
				}),
				nodeResolve({ browser: true, rootDir: dirname(filename), extensions }),
				ephemeral(filename, code),
			],
			logLevel: "silent",
		});

		let { output } = await bundle.generate({
			format: "esm",
			manualChunks(id) {
				if (id.startsWith("/")) {
					let path = relative(process.cwd(), id);
					let ext = extname(path);
					return makeLegalIdentifier(path.slice(0, -ext.length)) + ext;
				}
			},
		});
		rlcache.save(bundle.cache);
		await bundle.close();

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
	let report = await coverageCollector.collect();
	if (report != null) testInfo.attach("tester_coverage_report", { body: report });
	connect?.close();
}
