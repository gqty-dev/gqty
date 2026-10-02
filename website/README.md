# GQty Website (sanitized source import)

## Provenance

This directory is a **sanitized source import** of the GQty website. Upstream
files were copied from the upstream website repository at a pinned commit, with
an explicit exclusion allowlist (see below).

No upstream git history was merged and no upstream git objects were fetched.
The source repository's history is not part of this repository. Note that the
word "fetched" is precise: copying files and committing them here naturally
creates *new* git blobs for the copied content. What did not happen is any
`git fetch`/`git pull` of upstream refs, any history merge, or any import of
upstream objects into this repository's object database.

| Field | Value |
| --- | --- |
| Source repository | `https://github.com/gqty-dev/GQty-Website` |
| Source commit (main) | `05c6d604f668b9c4c578622dc13562effa1f5f52` |
| Source commit date | 2026-10-01 |
| Source commit subject | `fix(deps): update dependency next to ^15.5.27 (#887)` |
| Import method | fresh detached clone at SHA, explicit file-by-file copy |
| Upstream license | MIT (`LICENSE` retained verbatim) |
| Files in this directory | 154 — the 153 copied upstream files plus the newly authored `README.md`. Only the 153 copied files are verbatim.

## Status: intermediate import, not yet runnable

This import is an intermediate migration input. It is **not runnable** and
**not expected to build**. Compatibility work — including replacement of the
imports listed under "Pending replacement" below — is a separate follow-up
step and is intentionally out of scope here. No replacement CSS or component
implementations have been authored yet.

## Sanitized-import exclusions

The following upstream paths were deliberately **not** imported.

### Proprietary library (licensing blocker)

Upstream depends on the proprietary `reshaped` design system, vendored as
`node_modules_offline/reshaped-react-v1.14.0.tgz`. That asset is marked
`"private": true` and its bundled `LICENSE.md` grants use but prohibits
redistribution. It is not redistributable and is therefore excluded.

Excluded on this ground:

- `node_modules_offline/` — including `reshaped-react-v1.14.0.tgz`
- `pnpm-lock.yaml` — lockfile containing the proprietary dependency
- `reshaped.config.js` — Reshaped theme generator input
- `themes/gqty/theme.css` — generated Reshaped theme output
- `themes/global.css` — a three-line stylesheet that is purely a composition of
  `@import "tailwindcss"`, `@import "reshaped/bundle.css"` (proprietary), and
  `@import "./gqty/theme.css"` (generated). It contains no original project
  stylesheet content, so nothing original was lost by omitting it.

### Generated content

- `gqty/index.ts` — generated GQty client
- `gqty/schema.generated.ts` — generated GitHub GraphQL schema client

### Unused or non-migration content

- `components/USP/` (`index.tsx`, `cache.tsx`, `read.tsx`, `outline.tsx`) —
  unused; the only referencing call site in `components/pages/homepage.tsx` is
  commented out. Note that `components/pages/USPRead/` and
  `components/pages/USPWrite/` are **included**: they are distinct, actively
  used components.
- `components/counters.tsx`, `components/counters.module.css` — unused
- `renovate.json` — source repository dependency-automation config
- `.gitpod.yml`, `.vscode/`, `.gitignore` — editor and environment config
- `.env*`, `.next`, `out`, `.vercel` — environment and build output (none were
  present in the source snapshot)

## Included content

- `LICENSE` — upstream MIT license, byte-identical
- `pages/**` — all MDX documentation, `_meta.json` navigation, `_app.tsx`,
  `_document.tsx`, `index.mdx`
- `components/**` — actively used original components, the original Play icon
  set, contributors/roadmap/member/playground components, and the concepts
  normalization SVGs referenced by `pages/concepts.mdx`
- `public/**` — original public assets: logos, hero images, USPs GIFs,
  favicon, and pronunciation audio
- `next.config.mjs`, `theme.config.tsx`, `tsconfig.json`, `next-env.d.ts`
- `postcss.config.js`, `tailwind.config.js`, `package.json` — migration input,
  see below

## Pending replacement (imports retained, not resolved)

The copied files below are original MIT source that reference the excluded
proprietary library. The reference lines are retained as migration input
markers; the library itself is not vendored here. These must be replaced during
the follow-up compatibility step.

- `pages/_app.tsx` — `reshaped/bundle`, `../themes/global.css`
- `pages/_document.tsx` — `../tailwind.config`
- `components/Playground/index.tsx`, `components/Roadmap/index.tsx`,
  `components/Member/index.tsx`, `components/Contributors/index.tsx`,
  `components/HeroSection/index.tsx`, `components/Reshaped/Alert.tsx`,
  `components/pages/homepage.tsx`, `components/pages/USPRead/index.tsx`,
  `components/pages/USPWrite/index.tsx` — `reshaped/bundle` and Reshaped types
- `pages/getting-started.mdx`, `pages/guides/core/resolve.mdx` —
  `reshaped/bundle`
- `postcss.config.js` — `reshaped/config/postcss`
- `tailwind.config.js` — `reshaped/config/tailwind`
- `package.json` — `reshaped` dependency entry pointing at the excluded tarball,
  and the `build:themes` script that invokes the Reshaped CLI
- `components/pages/Homepage/getStaticProps.ts` — imports `../../../gqty`, which
  was excluded as generated content

## Verification performed during import

- Every copied file is byte-identical to the source file at the pinned SHA
  (`cmp` over all 153 copied files: 0 mismatches). `README.md` is authored
  here, not copied, and is therefore outside that byte-identity check.
- `LICENSE` is byte-identical to upstream.
- Secret scan of all text candidates: no credentials, tokens, or keys found.
- Absence check: no `node_modules_offline`, lockfile, Reshaped config, generated
  theme CSS, generated `gqty/`, unused USP/counters components, or environment
  config present.
- No upstream git refs were fetched, and no upstream history was merged into
  this repository.
