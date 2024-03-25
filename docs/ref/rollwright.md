# `rollwright`

The package provides Playwright Test fixtures.

## `execute`

The main fixture of the package. Builds code, hosts assets, runs things in
browser and yield back to the test.

## `plugins`

```ts
import { type Plugin } from "rollup";

plugins: Array<Plugin>;
```

Configurable list of Rollup plugins.

## `template`

```ts
template: string | { html: string, root: string | null };
```

Static HTML of the testing page.

Root folder for static files linked by the template or assets. If `null`, always
relative to the test file.

## `extensions`

```ts
extensions: Array<string>;
```

<!-- ## `coverage` -->
