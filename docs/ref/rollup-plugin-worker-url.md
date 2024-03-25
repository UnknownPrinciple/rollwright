# `rollup-plugin-worker-url`

The package provides a lightweight Rollup plugin that enables bundling of Web
Workers that are initialized by `new Worker(new URL(..., import.meta.url))`
pattern.

```js
// rollup.config.js
import worker from "rollup-plugin-worker-url";

export default {
  // ...
  plugins: [
    // ...
    worker(),
    // ...
  ],
  // ...
};
```
