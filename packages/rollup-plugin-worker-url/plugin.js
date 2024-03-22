import MagicString from "magic-string";

/**
 * @returns {import("rollup").Plugin}
 */
export function worker() {
	let workerUsageRegex = /\bnew\s+(?:Worker|SharedWorker)/g;
	return {
		name: "worker_url",
		shouldTransformCachedModule({ code }) {
			return workerUsageRegex.test(code);
		},
		async transform(code, id) {
			if (!workerUsageRegex.test(code)) return;

			let ms = new MagicString(code);
			let ast = this.parse(code);

			for (let node of walker(ast)) {
				if (
					node.type === "NewExpression" &&
					(node.callee.name === "Worker" || node.callee.name === "SharedWorker") &&
					node.arguments.length > 0 &&
					node.arguments[0].type === "NewExpression" &&
					node.arguments[0].callee.name === "URL"
				) {
					let url = node.arguments[0];
					let arg = url.arguments[0];
					if (arg.type === "Literal") {
						// TODO import.meta.url -> id, otherwise the value
						let { id: fileId } = await this.resolve(arg.value, id);
						let chunkId = this.emitFile({ type: "chunk", id: fileId });
						ms.overwrite(url.start, url.end, `import.meta.ROLLUP_FILE_URL_${chunkId}`);
					}
				}
			}

			return { code: ms.toString(), map: ms.generateMap({ hires: true }) };
		},
	};
}

export default worker;

/**
 * @typedef {import("rollup").AstNode} Node
 * @param {Node} node
 * @returns {Generator<Node>}
 */
function* walker(node) {
	if (node != null) {
		yield node;
		for (let key in node) {
			let value = node[key];
			if (value != null && typeof value === "object") {
				if (Array.isArray(value)) {
					for (let item of value) {
						if (item != null && typeof item.type === "string") {
							yield* walker(item);
						}
					}
				} else if (typeof value.type === "string") {
					yield* walker(value);
				}
			}
		}
	}
}
