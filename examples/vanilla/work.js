import { sum, multiply } from "./math.js";

self.addEventListener("message", () => {
	self.postMessage([multiply(3, 4), sum(3, 4)]);
});
