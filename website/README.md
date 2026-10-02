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

The same sequence, targeting a Cloudflare Pages preview instead of GitHub
Pages:

```bash
WEBSITE_BUILD_TARGET=cloudflare-preview \
CF_PAGES_URL=https://preview.example.invalid \
NEXT_TELEMETRY_DISABLED=1 \
pnpm --dir website build

WEBSITE_BUILD_TARGET=cloudflare-preview \
CF_PAGES_URL=https://preview.example.invalid \
pnpm --dir website check:export
```

The two commands must be given the same target: `check:export` resolves the
build target the same way the build does, so it validates the export that is
actually in `out/`. A default-mode run against a preview export (or the
reverse) fails rather than passing by accident. `pnpm build` also runs
`node scripts/finalize-export.mjs`, which writes `out/_headers` for a preview
and removes it for a default build.

`CF_PAGES_URL` only has to be a valid HTTPS absolute URL. Nothing in the export
derives a link, canonical URL, or asset path from it, so a placeholder is fine
for a local build and for CI.

`--ignore-workspace` matters for installs: without it pnpm resolves the parent
monorepo and would run root workspace lifecycle scripts and potentially rewrite
`pnpm-lock.yaml` at the repository root. It does not affect `dev`, `build`,
`check`, or `serve`, which only need the installed `node_modules`.

Installs must use `--frozen-lockfile` in CI. The lockfile is committed and is
the source of truth for the dependency graph.

### Build targets

`WEBSITE_BUILD_TARGET` selects the serving base. It is resolved once in
`lib/site-config.mjs` and consumed by `next.config.mjs`, `lib/asset.ts`, and
`scripts/check-export.mjs`.

| `WEBSITE_BUILD_TARGET` | Serving base | Indexing | `out/_headers` |
| ---------------------- | ------------ | -------- | -------------- |
| unset or `github-pages` | `/gqty`      | `index,follow` | absent  |
| `cloudflare-preview`   | `''` (origin root) | `noindex,nofollow` | required |
| anything else          | — (build fails) | — | — |

An unset variable keeps the previous behaviour exactly, so existing local and
CI commands are unaffected. `cloudflare-preview` additionally requires
`CF_PAGES_URL` to be present and HTTPS; the build fails otherwise rather than
publishing an unconfigured preview.

The **serving base** and the **canonical namespace** are separate. Canonical and
`og:url` metadata always name `https://gqty-dev.github.io/gqty/<route>`, in both
targets, because a preview is a temporary duplicate rendering of the production
route namespace rather than a second publication. No Cloudflare hostname is
emitted as a canonical URL, and none is put in the generated `_headers`.

The dev server does not use a base path, so run `pnpm build && pnpm serve` when
you need to verify deep links, assets, or search behaviour under the real mount
point. `scripts/serve-export.mjs` serves `out/` at
`http://localhost:4173/gqty/` and returns the exported 404 page for unknown
routes; it serves the default-mode export only.

## Hosting

GitHub Pages is **production**, and it is the only published location. Its URL
is <https://gqty-dev.github.io/gqty/>. Cloudflare Pages builds preview
deployments of the same routes at an origin root; those are duplicates that are
explicitly not indexable and carry no custom domain.

Nothing here deploys from a local machine.

### GitHub Pages (production)

`.github/workflows/pages.yaml` is the production deployment path.

- The `build` job runs on every pull request that touches `website/**` or the
  workflow, and on pushes to `main`. It typechecks, tests, checks formatting,
  builds the default target, runs `check:export`, adds `.nojekyll`, and uploads
  `website/out` as the Pages artifact.
- The `build-cloudflare-preview` job runs the same checks with
  `WEBSITE_BUILD_TARGET=cloudflare-preview` and a deterministic HTTPS
  `CF_PAGES_URL` placeholder. It never uploads a Pages artifact, so root-mode
  output cannot mix with, or replace, the production artifact.
- The `deploy` job publishes the production artifact to
  <https://gqty-dev.github.io/gqty/>. It runs only for pushes and manual runs on
  `main`, and requires **both** build jobs to succeed, so a pull request —
  including one from a fork — can never deploy.

The workflow passes explicit `pnpm --dir website` commands. `--ignore-workspace`
is required for the install only: `website/` is an independent package with its
own lockfile, and without the flag pnpm resolves the parent monorepo and may
rewrite the root `pnpm-lock.yaml`.

Nothing in this document claims a deployment has happened. The above describes
what the committed workflow does when it runs.

### Cloudflare Pages (preview)

Cloudflare builds these previews itself, through its native Git integration. The
GitHub Actions workflow only validates that the preview configuration still
builds; it does not deploy anything to Cloudflare. There is no Direct Upload
project and none should be created — a Direct Upload project cannot be converted
to a Git integration, so creating one would be an unrecoverable mistake.

Project settings, exactly as configured:

| Setting | Value |
| ------- | ----- |
| Project name | `gqty-preview` |
| Source | GitHub native Git integration (not Direct Upload) |
| Repository | `gqty-dev/gqty` |
| Production branch | `main` |
| Automatic production deployments | **Off** |
| Preview deployments | All non-production branches |
| Preview includes | `*` |
| Preview excludes | *(empty)* |
| PR comments | On |
| Root directory | `website` |
| Framework preset | None |
| Build command | `pnpm --ignore-workspace install --frozen-lockfile && pnpm check && pnpm test && pnpm format:check && pnpm build && pnpm check:export` |
| Output directory | `out` |
| Build watch include | `website/*` |
| Build watch exclude | *(empty)* |
| Custom domains | **None** |
| Web Analytics | Off unless separately approved |

Required plain-text environment variables — set them for the **Preview**
configuration, and set matching values on Production so that an accidental
Cloudflare production build is also harmless and non-indexable:

```text
CI=true
NODE_VERSION=22
PNPM_VERSION=10.26.2
SKIP_DEPENDENCY_INSTALL=true
NEXT_TELEMETRY_DISABLED=1
WEBSITE_BUILD_TARGET=cloudflare-preview
```

Do **not** set `CF_PAGES_URL`. Cloudflare provides it per deployment.

`SKIP_DEPENDENCY_INSTALL=true` is required because the repository root is a pnpm
workspace while `website/` owns a separate lockfile. The explicit build command
is the only supported install path, and it carries `--ignore-workspace`.

#### Authorization boundary

Creating the project requires a human, once:

1. Authorize the Cloudflare Pages GitHub App for `gqty-dev`, choosing **Only
   select repositories** and selecting only `gqty-dev/gqty`. Organization-owner
   approval may be required.
2. Authenticate Wrangler locally with `npx wrangler@latest login` and complete
   the browser flow. Never paste an API token into a chat, an issue, or a commit.

`wrangler pages project create` must **not** be used: it creates a Direct Upload
project. A native-Git project is created through the Pages Projects API with
`source.type = "github"`, using a short-lived account-scoped Pages edit token.

#### What a preview looks like

- Served at the origin root: `/`, `/getting-started/`, and so on. No `/gqty`
  prefix in any link, asset, or bundle path.
- Canonical and `og:url` name the production GitHub Pages route, so search
  engines consolidate the duplicate instead of splitting the URL.
- Each page carries exactly one `<meta name="robots" content="noindex,nofollow">`,
  and `out/_headers` applies `X-Robots-Tag: noindex, nofollow` to `/*`.
- No custom domain, and Cloudflare production deployments are disabled.

A preview is **public**. `noindex` is a search-engine policy, not access
control, and it is not privacy: anyone with the hostname can read the site. Use
Cloudflare Access if access control is ever needed.

Fork pull requests do **not** receive native Cloudflare previews. They are
validated by GitHub Actions only.

#### Plan limits

Every qualifying non-production branch push consumes one build. Build watch
paths reduce builds but do not restrict them to pull requests. Re-check the
current limits and quotas before relying on them — Cloudflare changes them:

- [Pages limits](https://developers.cloudflare.com/pages/platform/limits/)
- [Build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/)
- [Branch build controls](https://developers.cloudflare.com/pages/configuration/branch-build-controls/)
- [Monorepos and root directory](https://developers.cloudflare.com/pages/configuration/monorepos/)
- [Git integration](https://developers.cloudflare.com/pages/configuration/git-integration/)
- [GitHub integration](https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/)
- [Static `_headers`](https://developers.cloudflare.com/pages/configuration/headers/)
- [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/)
- [Pages Projects create API](https://developers.cloudflare.com/api/resources/pages/subresources/projects/methods/create/)
- [Canonical duplicate consolidation](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Robots meta tag](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag)

## Static export notes

`next.config.mjs` sets `output: "export"`, `trailingSlash: true`,
`images.unoptimized: true`, and a `basePath` taken from the build target
(`/gqty` for GitHub Pages, `''` for a Cloudflare preview).

Three consequences are worth knowing before editing:

1. **`next/image` does not receive the base path.** With image optimization
   disabled — which static export requires — Next emits the `src` verbatim.
   Every public asset must therefore go through `asset()` from `lib/asset.ts`.
   Statically imported images (`import x from "./x.svg"`) already carry the
   built asset path and are passed through unchanged by the same helper.
   `asset()` is the serving prefix only; it never affects a canonical URL.
2. **Server-only config must not reach the client bundle.** `lib/canonical.mjs`
   holds the published origin and base and is safe to import from rendered
   theme code. `lib/site-config.mjs` imports `node:path` and `node:url` for
   target resolution, so importing it from a module that webpack bundles for
   the browser fails the build with an unhandled scheme error. Canonical
   values come from `canonical.mjs`; target values from `site-config.mjs`.
3. **Markdown links are already prefixed.** Nextra renders them through
   `next/link`, which applies `basePath` exactly once, so hrefs need no
   post-processing. The Nextra search index is the one exception: its route
   keys stay unprefixed, because `next/link` prefixes the search-hit href and
   the theme loads the index from the base-prefixed
   `/_next/static/chunks/nextra-data-<locale>.json`. With an empty base the same
   rule holds, and a stale `/gqty`-prefixed key fails `check:export`.

## Validation

`scripts/check-export.mjs` reads `out/` and asserts, in both targets:

- every expected route exported to a directory-backed `index.html`
- no internal `href`, `src`, `srcset`, or CSS `url()` escapes the serving base
- every local reference resolves to a file in the export
- canonical and `og:url` metadata stay on the published GitHub Pages origin
- exactly one `robots` directive per content page, and it matches the target:
  `index,follow` for GitHub Pages, `noindex,nofollow` for a preview
- `out/_headers` exists and applies `X-Robots-Tag: noindex, nofollow` to `/*`
  in preview mode, and is absent in default mode
- the exported favicon resolves at the serving base, not at the other one
- expired-domain, archived-repository, build-time-secret, proprietary design
  system, and Vercel-telemetry strings are absent

The validator is one implementation instantiated per target rather than two
divergent copies: `createExportValidator(mode)` returns the mode's base path
and every check bound to it. `pnpm test` therefore runs each case twice — once
with `/gqty` and once with the origin root — instead of skipping the
target-sensitive ones. `GQTY_TEST_BUILD_TARGET=github-pages` (or
`cloudflare-preview`) narrows the suite to one mode when iterating.

Documentation prose is exempt: text that merely mentions GraphQL, SSR,
`getStaticProps`, or `useRouter` is content, not a runtime dependency.

`pnpm test` runs `node --test` over `scripts/*.test.mjs` and
`components/**/*.test.mjs`. The script tests cover the validator with focused
path, reference, fragment, metadata, robots, header-policy, and search-index
cases, plus the build-target parser and the export finalizer. The component
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
