# Test coverage

Rollwright attempts to provide test coverage support out of the box. It uses
[Istanbul][istanbul] for code instrumentation and coverage reports. Necessary
plugins are already included to Rollwright, no additional dependencies needed.
In order to _enable_ code instrumentation, add a reporter to the Playwright
config:

```js
import { defineConfig } from "@playwright/test";

export default defineConfig({
  // ...
  reporter: [
    /* other reporters */
    ["rollwright/coverage-reporter"], // [!code ++]
  ],
  // ...
});
```

Rollwright's coverage reporter uses [Istanbul reporters][istanbul-reporters].
Desired report type can be configured via reporter options. Field `name` defines
the report type, and `options` may be used for additional configuration required
by [`istanbul-reports`][istanbul-reports-pkg] package. The most commonly used
reporters are `text` (used by default, outputs a handy text report in the
terminal) and `html` (creates `coverage` folder with HTML pages).

```js
import { defineConfig } from "@playwright/test";

export default defineConfig({
  reporter: [
    ["rollwright/coverage-reporter", { name: "html" }], // [!code ++]
  ],
});
```

To change [configuration][istanbul-reports-pkg] for the selected Istanbul report
type, add `options` object:

```js
import { defineConfig } from "@playwright/test";

export default defineConfig({
  // ...
  reporter: [
    /* other reporters */
    [
      "rollwright/coverage-reporter",
      {
        name: "html",
        options: {
          /* reporter type options */
        },
      },
    ],
  ],
  // ...
});
```

[istanbul]: https://istanbul.js.org
[istanbul-reporters]:
  https://istanbul.js.org/docs/advanced/alternative-reporters/
[istanbul-reports-pkg]: https://www.npmjs.com/package/istanbul-reports
