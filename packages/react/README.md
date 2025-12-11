<p align="center">
  <a href="https://gqty.dev">
    <img src="https://github.com/gqty-dev/gqty/raw/main/internal/images/logo.png" height="150" alt="gqty" />
  </a>
</p>

<h2 align="center">
  The No-GraphQL Client for TypeScript

[![Documentation](https://img.shields.io/badge/documentation-documentation?color=C00B84)](https://gqty.dev)
[![Discord](https://img.shields.io/discord/874477141834739762?color=7289d9&label=discord)](https://discord.gg/U967mp5qbQ)

</h2>

[![GQty Hero Section](https://github.com/gqty-dev/gqty/raw/main/internal/images/hero.png)](https://gqty.dev)

Data requirements within your application are picked up automatically, freeing
you from having to maintain GraphQL queries by-hand. It offers a first-class
TypeScript experience. See API documentation at all times within autocomplete.

Make breaking changes to your API, and see type-errors exactly where things are
breaking, in realtime. No more running a separate validation step.

**Head over to [gqty.dev](https://gqty.dev) to explore features and
documentations!**

## Get involved

Documentation, bug reports, pull requests, and other contributions are welcomed!
See [`CONTRIBUTING.md`](CONTRIBUTING.md) for more information.

## React Native

- The React bindings ship platform-specific entry points so Metro can resolve
  React Native friendly implementations automatically; no `react-dom` dependency
  is required.
- `prepareReactRender` is a no-op on native targets. Server-rendering helpers
  remain web-only, and hydration defaults to cache snapshots from client
  renders.
- Effects that previously relied on browser visibility and online events now
  listen to `AppState` changes to refetch when the app returns to the
  foreground.
