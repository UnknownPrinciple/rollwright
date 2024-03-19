import MagicString from "magic-string";

let workerInstantiationRegex =
	/\bnew\s+(?:Worker|SharedWorker)\s*\(\s*(new\s+URL\s*\(\s*('[^']+'|"[^"]+"|`[^`]+`)\s*,\s*import\.meta\.url\s*\))/dg;

let workerUsageRegex = /\bnew\s+(?:Worker|SharedWorker)/g;

export function worker() {
	return {
		name: "worker_url",
		shouldTransformCachedModule({ code }) {
			return workerUsageRegex.test(code);
		},
		async transform(code, id) {
			if (!workerUsageRegex.test(code)) return;
			let ms = new MagicString(code);
			let match = null;
			while ((match = workerInstantiationRegex.exec(code))) {
				let { id: fileId } = await this.resolve(match[2].slice(1, -1), id);
				let chunkId = this.emitFile({ type: "chunk", id: fileId });
				let [from, to] = match.indices[1];
				ms.overwrite(from, to, `import.meta.ROLLUP_FILE_URL_${chunkId}`);
			}
			return { code: ms.toString(), map: ms.generateMap({ hires: true }) };
		},
	};
}

export default worker;
