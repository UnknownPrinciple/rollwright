import { streamSSE } from "hono/streaming";

import { createFilter } from "@rollup/pluginutils";

import libInstrument from "istanbul-lib-instrument";
import libCoverage from "istanbul-lib-coverage";
import libSourceMaps from "istanbul-lib-source-maps";

/**
 * @param {boolean} enable
 * @param {import("hono").Hono} server
 * @param {import("playwright").Page} page
 */
export function createCoverageCollector(enable, server, page) {
	let counter = 0;
	let coverageMap = libCoverage.createCoverageMap();
	let { promise: finish, resolve: ping } = deferred();

	if (enable) {
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
	}

	return {
		async collect() {
			if (enable) {
				ping();
				for (let delay = 5; counter > 0; delay *= 2) await page.waitForTimeout(delay);
				let sourceMapStore = libSourceMaps.createSourceMapStore();
				let data = await sourceMapStore.transformCoverage(coverageMap);
				return JSON.stringify(data);
			}
		},
		instrument(options) {
			return enable ? coverage(options) : [];
		},
	};
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
			let sender = `/* istanbul ignore next */ (async function report() {
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

function deferred() {
	let resolve, reject;
	let promise = new Promise((rs, rj) => {
		resolve = rs;
		reject = rj;
	});
	return { promise, resolve, reject };
}
