# How it works

[Playwright Page API][pw-page] introduces [`page.evaluate()`][evaluate] and
[`page.evaluateHandle()`][evaluate-handle] methods that allow running arbitrary
JavaScript code on the web page. These methods however do not play nicely with
the essence of modern Web projects, where libraries and frameworks rely on code
pre-processors.

To fill this gap, Rollwright introduces `execute()` fixture that essentially
behaves like `page.evaluateHandle()` but utilizes [Rollup][rollup] for code
pre-processing and dependency resolution and [Hono][hono] to serve static assets
to the browser automatically so you don't have to worry about additional testing
infrastructure.

::: warning  
🚧 This guide is under construction  
:::

[pw-page]: https://playwright.dev/docs/api/class-page
[evaluate]: https://playwright.dev/docs/api/class-page#page-evaluate
[evaluate-handle]:
  https://playwright.dev/docs/api/class-page#page-evaluate-handle
[rollup]: https://rollupjs.org
[hono]: https://hono.dev
