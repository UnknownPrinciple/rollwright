import { resolve, relative, dirname, basename, extname } from "node:path";

import { test as base } from "@playwright/test";

import { rollup } from "rollup";
import { ephemeral } from "./ephemeral.js";
import { nodeResolve } from "@rollup/plugin-node-resolve";

import { Hono } from "hono/tiny";
import { getMimeType } from "hono/utils/mime";
import { streamSSE } from "hono/streaming";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";

import { createFilter, makeLegalIdentifier } from "@rollup/pluginutils";

import libInstrument from "istanbul-lib-instrument";
import libCoverage from "istanbul-lib-coverage";
import libSourceMaps from "istanbul-lib-source-maps";

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
	let reporterName = "rollwright/coverage-reporter";
	let shouldInstrument = testInfo.config.reporter.some(
		(v) => v != null && (v.includes(reporterName) || v[0].includes(reporterName)),
	);

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
				shouldInstrument
					? coverage({ exclude: [new RegExp(input.replace(/\./, "\\.")), /node_modules/] })
					: [],
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
		cache = bundle.cache;
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

	let cov = shouldInstrument ? coverageCollector(server, page) : null;
	await use(evaluate);
	if (cov != null) testInfo.attach("tester_coverage_report", { body: await cov.collect() });
	connect?.close();
}

/**
 * @typedef Options
 * @property {import("@rollup/pluginutils").FilterPatter} [include]
 * @property {import("@rollup/pluginutils").FilterPatter} [exclude]
 * @param {Options} options
 * @returns {import("rollup").Plugin}
 */
function coverage(options) {
	let filter = createFilter(options?.include, options?.exclude);
	return {
		name: "coverage",
		transform(code, id) {
			if (!filter(id)) return;
			let instrumenter = libInstrument.createInstrumenter();
			let sourceMaps = this.getCombinedSourcemap();
			let sender = `/* istanbul ignore next */(async function report() {
				await fetch('/__register__', { method: "POST" });
				let source = new EventSource('/__events__');
				source.addEventListener('coverage', () => {
					fetch('/__coverage__', { method: 'POST', body: JSON.stringify(self.__coverage__) })
				});
			})();`;
			let instrumentedCode = instrumenter.instrumentSync(code, id, sourceMaps);
			instrumentedCode = sender + instrumentedCode;
			return { code: instrumentedCode, map: instrumenter.lastSourceMap() };
		},
	};
}

/**
 * @param {import("hono").Hono} server
 * @param {import("playwright").Page} page
 */
function coverageCollector(server, page) {
	let counter = 0;
	let coverageMap = libCoverage.createCoverageMap();
	let sourceMapStore = libSourceMaps.createSourceMapStore();
	let { promise: finish, resolve: ping } = deferred();
	server.post("/__register__", async (ctx) => {
		counter++;
		return ctx.body(null, 200);
	});
	server.get("/__events__", (ctx) => {
		return streamSSE(ctx, async (stream) => {
			await finish;
			await stream.writeSSE({ event: "coverage", data: "" });
		});
	});
	server.post("/__coverage__", async (ctx) => {
		counter--;
		coverageMap.merge(await ctx.req.json());
		return ctx.body(null, 200);
	});

	return {
		async collect() {
			ping();
			while (counter > 0) await page.waitForTimeout(5);
			let data = await sourceMapStore.transformCoverage(coverageMap);
			return JSON.stringify(data);
		},
	};
}

function deferred() {
	let resolve, reject;
	let promise = new Promise((rs, rj) => {
		resolve = rs;
		reject = rj;
	});
	return { promise, resolve, reject };
}
