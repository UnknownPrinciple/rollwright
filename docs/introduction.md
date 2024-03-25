# Introduction

Rollwright is an extension to [Playwright Test][playwright] that utilizes
[Rollup][rollup] to make the test framework suitable for component level
testing. Rollwright provides several fixtures that help you write component
tests with the same ease of Node.js tooling, but with real browsers as the
environment for testing.

## Quick Start

1. Install necessary tooling. Optionally you may want to install `rollup` so you
   can manage which version of it is being used by `rollwright`.

```sh
npm install --save-dev rollwright @playwright/test
```

2. Start writing UI integration specs for your components. No dev server
   configuration or any special environment needed.

```js
// import rollwright fixtures
import { test } from "rollwright";
// use the same matchers from playwright
import { expect } from "@playwright/test";

// `execute` fixture is the one
test("behavior", async ({ execute }) => {
  // execute code in the browser, import any local components
  let element = await execute(async () => {
    let { renderHelloWorld } = await import("./component.js");
    let target = document.createElement("div");
    document.body.append(target);
    renderHelloWorld(target);
    // return anything that is needed for further test logic
    return target;
  });

  // keep writing tests like you would do in Playwright
  let innerText = await target.asElement().innerText();
  expect(innerText).toEqual("Hello, World!");

  // result of `execute()` is a JSHandle object
  // so you can interact with it further in the test
  await execute((target) => {
    target.remove();
  }, element);

  await expect(page.locator("body")).toBeEmpty();
});
```

Read more: Rollwright [configuration](./configuration), framework
[integration](./integration), [test coverage](./coverage),
[code mocking](./mocking).

## Motivation

Right now, Playwright is probably the best tool out there for browser automation
and end-to-end testing. It supports variety of browsers, it is resilient towards
dynamic nature of web pages which helps you avoid test flakiness, and it works
nicely with TypeScript and IDEs. If you start a new project, using Playwright is
the best early decision you can make.

However, the primary focus of the Playwright Test remains to be end-to-end
testing. When it comes to the UI integration testing level, where you'd like to
test a component's behavior in isolation, it is expected that you'll rely on
using unit testing tooling. This brings benefits of runtime speed which can be
crucial for large projects with hundreds of tests, but it also comes with
trade-offs that sometimes make you spend too much time debugging tests or not
seeing bugs in the components simply due to the difference of emulated
environment and real browsers.

Rollwright exists to fill the need for efficient component tests that still run
in real browser environment. Rollwright hides the details of necessary build
step and static assets hosting so you only need to focus on the test logic that
covers specific component behavior.

See [comparison](./comparison) guide for more.

[playwright]: https://playwright.dev
[rollup]: https://rollupjs.org
