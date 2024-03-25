# Comparing Rollwright to other component testing solutions

Rollwright does not invent anything new. Many existing and established testing
solutions provide a way to write integration level tests for UI components of
different frameworks. This guide explains the difference in implementation and
motiovation between Rollwright and other known solutions.

This guide does not attempt to convince anyone to only use Rollwright, rather
sheds the light on the difference in approach and implementation so you can make
a concious decision that works for your project.

::: warning  
🚧 This guide is under construction and will be updated as more insights are
discovered.  
:::

## Testing Library

If you ever looked up any guide or recommendation, [Testing
Library][testing-library] seem to be the most popular choice out there when it
comes to testing UI components. Accompanied by [Jest][jest] or [Ava][ava], you
get a quick and easy setup that mostly just works.

However, if you are a seasoned engineer and you have experience with this
approach that goes beyond testing HelloWorld component, you know it's not an
easy path. JSDOM's lagging compatibility with the Web standards, Jest's
inability to work with ESM packages in `node_modules`, Testing LIbrary spewing
large chunks of HTML whenever something goes wrong, etc.

These are the issues that you're unable to hit when testing in real browser.
This is where Rollwright (and of course Playwright) comes into play.

## Playwright CT

Playwright itself does allow [component testing][playwright-ct].

It has been almost two years since Playwright got necessary capabilities to
write tests for UI components. It is still in experimental status and mainly
receives minor internal fixes from time to time. The experimental status means
that the APIs do not follow semantic versioning and are a subject to breaking
changes.

Playwright CT uses Vite under the hood to build all assets required by tests.

- experimental status
- build time
- api constraints (either build time code or evaluate() that doesn't go through
  build pipeline)
- code coverage story

## Vitest

[Vitest][vitest] has [an option][vitest-browser] to run tests in browser.

- experimental, but nice it uses playwright
- difference between running test in browser and testing in browser
- plenty of unresolved issues with coverage and CI

## WebdriverIO

- like vitest, runs tests themselves in browser
- autowaiting disabled by default

[testing-library]: https://testing-library.com
[jest]: https://jestjs.io
[ava]: https://github.com/avajs/ava
[playwright-ct]: https://playwright.dev/docs/test-components
[vitest]: https://vitest.dev
[vitest-browser]: https://vitest.dev/guide/browser.html
