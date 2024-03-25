---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Rollwright"
  text: "UI integration testing made easy"
  tagline:
    A set of tools to make <a href="https://playwright.dev" target="_blank"
    style="color:var(--vp-button-brand-active-bg);">Playwright</a> comfortable
    for implementation level UI testing.
  actions:
    - theme: brand
      text: Get Started
      link: /introduction
    - theme: alt
      text: GitHub
      link: https://github.com/unknownprinciple/rollwright

features:
  - icon: 🌍
    title: Real browser without trade-offs
    details:
      No more blind debug via terminal logs or issues with JSDOM
      incompatibility. All benefits of Playwright applied to component level.
  - icon: 🤖
    title: Integration with any framework
    details:
      Rollwright works with any JavaScript code. If something needs a special
      treatment, just drop in a Rollup plugin for it.
  - icon: 🛠️
    title: Meticulous control over details
    details:
      Nothing forces you into any particular testing workflow. You can build as
      you see fit.
---
