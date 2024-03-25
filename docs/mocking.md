# Mocking

Mocking, stubbing or faking things in Playwright tests is not an easy thing.
Mainly because Playwright tests itself running in Node.js runtime, outside of
the browser runtime that runs the actual code that's being tested. By using
Rollwright, this constraint can be minimized.

Rollwright itself does not provide mocking primitives. Consider using existing
proven and established projects like [Sinon](https://sinonjs.org). Rollwright
does not have a way to mock a certain module implementation. For this, use
Rollup plugins like [`@rollup/plugin-alias`][plugin-alias].

::: warning  
🚧 This guide is under construction  
:::

[plugin-alias]: https://www.npmjs.com/package/@rollup/plugin-alias
