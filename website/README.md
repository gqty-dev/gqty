# GQty Website

Documentation site for GQty. It is a Next.js **Pages Router** application using
**Nextra 2**, exported as fully static files and served from GitHub Pages at
<https://gqty-dev.github.io/gqty/>.

This is an independent package. It is **not** a member of the root pnpm
workspace: it has its own `pnpm-lock.yaml`, and installing or building it must
not touch the monorepo lockfile.

## Requirements

| Tool    | Version                                      |
| ------- | -------------------------------------------- |
| Node.js | 22 or newer (CI uses 22)                     |
| pnpm    | 10.26.2 (`packageManager` in `package.json`) |

## Commands

Run everything from the repository root so the website stays isolated from the
monorepo workspace:

```bash
pnpm --ignore-workspace --dir website install --frozen-lockfile
pnpm --dir website dev                         # dev server at http://localhost:3000/
pnpm --dir website check                       # tsc --noEmit
pnpm --dir website test                        # validator unit tests
NEXT_TELEMETRY_DISABLED=1 pnpm --dir website build
pnpm --dir website check:export                # validate out/
pnpm --dir website serve                       # preview out/ at /gqty/
pnpm --dir website format:check                # prettier check
```

`--ignore-workspace` matters for installs: without it pnpm resolves the parent
monorepo and would run root workspace lifecycle scripts and potentially rewrite
`pnpm-lock.yaml` at the repository root. It does not affect `dev`, `build`,
`check`, or `serve`, which only need the installed `node_modules`.

Installs must use `--frozen-lockfile` in CI. The lockfile is committed and is
the source of truth for the dependency graph.

### Base path

Production builds export under `/gqty`. The dev server does not use a base path,
so run `pnpm build && pnpm serve` when you need to verify deep links, assets, or
search behaviour under the real mount point.

`scripts/serve-export.mjs` serves `out/` at `http://localhost:4173/gqty/` and
returns the exported 404 page for unknown routes.

## Deployment

`.github/workflows/pages.yaml` builds and deploys this package with GitHub
Pages. It is the only deployment path; nothing here deploys from a local
machine.

- The build job runs on every pull request that touches `website/**` or the
  workflow, and on pushes to `main`. It typechecks, tests, checks formatting,
  builds, runs `check:export`, and uploads `website/out` as the Pages artifact.
- The `deploy` job publishes that artifact to the **production** URL
  <https://gqty-dev.github.io/gqty/>. It runs only for pushes and manual runs
  on `main`, so a pull request can never deploy.

The workflow passes explicit `pnpm --dir website` commands. `--ignore-workspace`
is required for the install only: `website/` is an independent package with its
own lockfile, and without the flag pnpm resolves the parent monorepo and may
rewrite the root `pnpm-lock.yaml`.

### Preview deploys

`deploy-preview` is an opt-in lane for pre-merge verification. It is skipped
unless the repository variable `WEBSITE_PREVIEW_REF` exactly matches
`refs/heads/fix/remove-expired-domain` **and** the triggering ref is the same
branch, so the default — variable unset — publishes nothing but `main`.

When enabled, the preview publishes that branch's content at the production URL
<https://gqty-dev.github.io/gqty/>, replacing the live site until the next `main`
deployment. GitHub Pages has no separate preview URL for a project site, so
preview and production share the same address; that is the intended trade-off
for testing before merge, not a separate environment.

Nothing in this document claims a deployment has happened. The lanes above
describe what the committed workflow does when it runs.

## Static export notes

`next.config.mjs` sets `output: "export"`, `basePath: "/gqty"`,
`trailingSlash: true`, and `images.unoptimized: true`.

Two consequences are worth knowing before editing:

1. **`next/image` does not receive the base path.** With image optimization
   disabled — which static export requires — Next emits the `src` verbatim.
   Every public asset must therefore go through `asset()` from `lib/asset.ts`.
   Statically imported images (`import x from "./x.svg"`) already carry the
   built asset path and are passed through unchanged by the same helper.
2. **`next/image` does not receive the base path.** With image optimization
   disabled — which static export requires — Next emits the `src` verbatim.
   Every public asset must therefore go through `asset()` from `lib/asset.ts`.
   Statically imported images (`import x from "./x.svg"`) already carry the
   built asset path and are passed through unchanged by the same helper.
3. **Markdown links are already prefixed.** Nextra renders them through
   `next/link`, which applies `basePath` exactly once, so hrefs need no
   post-processing. The Nextra search index is the one exception: its route
   keys stay unprefixed, because `next/link` prefixes the search-hit href and
   the theme loads the index from the base-prefixed
   `/_next/static/chunks/nextra-data-<locale>.json`.

## Validation

`scripts/check-export.mjs` reads `out/` and asserts:

- every expected route exported to a directory-backed `index.html`
- no internal `href`, `src`, `srcset`, or CSS `url()` escapes `/gqty/`
- every local reference resolves to a file in the export
- canonical and `og:url` metadata stay on the published origin
- expired-domain, archived-repository, build-time-secret, proprietary design
  system, and Vercel-telemetry strings are absent

Documentation prose is exempt: text that merely mentions GraphQL, SSR,
`getStaticProps`, or `useRouter` is content, not a runtime dependency.

`pnpm test` runs `node --test` over `scripts/*.test.mjs` and
`components/**/*.test.mjs`. The script tests cover the validator with focused
path, reference, fragment, metadata, and search-index cases. The component
tests cover the small pure modules that back the Tabs keyboard interaction and
the hero copy feedback; there is no React test renderer in this package, so
the browser-facing wiring of those components is verified by hand instead.

`pages/guides/core/resolve.mdx` is listed in `.prettierignore`. Prettier
rewrites the Svelte `onClick={() => {}}` braces in that page's example into
invalid HTML, so the file is kept byte-exact and edited by hand.

## Provenance

This directory began as a **sanitized source import** of the archived website
repository. Upstream files were copied at a pinned commit with an explicit
exclusion allowlist.

| Field                 | Value                                                              |
| --------------------- | ------------------------------------------------------------------ |
| Source repository     | `https://github.com/gqty-dev/GQty-Website`                         |
| Source commit (main)  | `05c6d604f668b9c4c578622dc13562effa1f5f52`                         |
| Source commit subject | `fix(deps): update dependency next to ^15.5.27 (#887)`             |
| Upstream license      | MIT (`LICENSE`, retained verbatim)                                 |
| Import method         | fresh detached clone at the pinned SHA, explicit file-by-file copy |

No upstream git history was merged and no upstream refs were fetched. Copying
files and committing them here naturally created **new** git blobs for the
copied content; what did not happen is any `git fetch` of upstream, any history
merge, or any import of upstream objects into this repository's object database.
The archived repository remains the canonical historical record.

The source repository URL above is retained **for provenance only**. Nothing in
this package builds, deploys, fetches, or links to it at runtime.

### Excluded from the import

- `node_modules_offline/`, including `reshaped-react-v1.14.0.tgz` — proprietary
  design system marked `"private": true`; its license prohibits redistribution
- `reshaped.config.js`, `themes/gqty/theme.css`, `themes/global.css` — Reshaped
  theme generator input and generated output
- the upstream `pnpm-lock.yaml` — referenced the proprietary dependency
- `gqty/index.ts`, `gqty/schema.generated.ts` — generated GitHub GraphQL client
- `components/USP/`, `components/counters.tsx` — unused
- `renovate.json`, `.gitpod.yml`, `.vscode/`, `.gitignore`, `.env*` — repository
  and environment configuration

### Replaced during migration

- Every Reshaped import (including the two in MDX) was replaced with semantic
  HTML and project-owned CSS. No design-system stylesheet was copied or bundled.
- Twind wrappers and the duplicated Tailwind/PostCSS pipeline were removed in
  favour of one project-owned CSS pipeline (`styles/globals.css` +
  `postcss.config.js`).
- The homepage no longer queries the GitHub GraphQL API. `getStaticProps`,
  `useSSG()`, the generated schema client, and the `GITHUB_PAT` requirement are
  gone; contributors and sponsorship now appear as stable repository and GitHub
  Sponsors links without fabricated counts.
- Vercel Analytics and Speed Insights were removed.
- The playground no longer embeds the third-party StackBlitz example. The
  editor runs the example in a WebContainer, which requires a
  cross-origin-isolated document, and GitHub Pages cannot serve the
  `Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy` headers that
  provides. The section now shows the example's own source and the query GQty
  generates from it, and opens the real editor from StackBlitz through an
  ordinary external link.

## Design tokens

`styles/globals.css` defines the token set before any component styling:
primitive color, spacing, type, radius, and motion values, then semantic
aliases, then component classes. Components consume tokens only — there are no
inline magic values.

## License

MIT. See `LICENSE` (verbatim upstream notice).
