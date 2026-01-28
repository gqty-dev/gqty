# @gqty/react

## 3.1.2

### Patch Changes

- [`0bbe1d7`](https://github.com/gqty-dev/gqty/commit/0bbe1d71adb041c038de97b6b4a799fc72192faf)
  Thanks [@vicary](https://github.com/vicary)! - chore(deps): upgrade deprecated
  packages

- Updated dependencies
  [[`0bbe1d7`](https://github.com/gqty-dev/gqty/commit/0bbe1d71adb041c038de97b6b4a799fc72192faf)]:
  - gqty@3.6.1

## 3.1.1

### Patch Changes

- [#2188](https://github.com/gqty-dev/gqty/pull/2188)
  [`4c39578`](https://github.com/gqty-dev/gqty/commit/4c3957861df8285b86c6c654f6aa922c6c7f8bbc)
  Thanks [@vicary](https://github.com/vicary)! - useTransactionQuery should work
  without suspense

- Updated dependencies
  [[`247a4fb`](https://github.com/gqty-dev/gqty/commit/247a4fb6c14255228926da6db7fbee2ef8cca54b)]:
  - gqty@3.5.0

## 3.1.0

### Minor Changes

- [#2049](https://github.com/gqty-dev/gqty/pull/2049)
  [`2367645`](https://github.com/gqty-dev/gqty/commit/23676456c0739f7841643f3fea215ac7c77ce026)
  Thanks [@vicary](https://github.com/vicary)! - streaming SSR on react-dom@>=18

### Patch Changes

- [`3f89bf4`](https://github.com/gqty-dev/gqty/commit/3f89bf4f11462cc1f86c499c08641cca367ee7cd)
  Thanks [@vicary](https://github.com/vicary)! - include version range in
  peerDependencies

- [`5032bc2`](https://github.com/gqty-dev/gqty/commit/5032bc2a551496ebc5cecc4c8926890acf3eea7d)
  Thanks [@vicary](https://github.com/vicary)! - fix(package/react): prevent
  render loops from SWR fetches

- Updated dependencies
  [[`a9502fc`](https://github.com/gqty-dev/gqty/commit/a9502fc4e5c627e635ba8d156cb5c2128548ebe6)]:
  - gqty@3.3.0

## 3.0.5

### Patch Changes

- Updated dependencies
  [[`f681c06`](https://github.com/gqty-dev/gqty/commit/f681c06b2af6d979a5d9af92e087872c17234af4),
  [`ee30fe3`](https://github.com/gqty-dev/gqty/commit/ee30fe39f2ebf512716247d9ae37eb6dbd33f8eb)]:
  - gqty@3.2.2

## 3.0.4

### Patch Changes

- Updated dependencies
  [[`c222005`](https://github.com/gqty-dev/gqty/commit/c222005ef1295f06f6ed6abcedccc512405d8771)]:
  - gqty@3.2.1

## 3.0.2

### Patch Changes

- [`f79f363`](https://github.com/gqty-dev/gqty/commit/f79f3638d9b93025a318c8e3716026474070ab5a)
  Thanks [@vicary](https://github.com/vicary)! - chore: add description and sort
  fields in package.json
- [#1850](https://github.com/gqty-dev/gqty/pull/1850)
  [`3e5cd7d`](https://github.com/gqty-dev/gqty/commit/3e5cd7d81fbe537bd4237cfd8584982b5f1b6468)
  Thanks [@vicary](https://github.com/vicary)! - Apply eslint and fix lint
  errors

- Updated dependencies
  [[`f79f363`](https://github.com/gqty-dev/gqty/commit/f79f3638d9b93025a318c8e3716026474070ab5a),
  [`8a3ff42`](https://github.com/gqty-dev/gqty/commit/8a3ff425a094de964418b94208bef4dbc8f3c4e5)]:
  - gqty@3.2.0

## 3.0.1

### Patch Changes

- [`0b69356`](https://github.com/gqty-dev/gqty/commit/0b69356a564cdb91d5c4e4780f7f7dd5fd8f2c83)
  Thanks [@vicary](https://github.com/vicary)! - Fix logo URL in README

- Updated dependencies
  [[`0b69356`](https://github.com/gqty-dev/gqty/commit/0b69356a564cdb91d5c4e4780f7f7dd5fd8f2c83)]:
  - gqty@3.0.1

## 3.0.0

### Minor Changes

- [#1544](https://github.com/gqty-dev/gqty/pull/1544)
  [`a758ed1`](https://github.com/gqty-dev/gqty/commit/a758ed17130ff2f5e8fc659c9ded3203798f9724)
  Thanks [@vicary](https://github.com/vicary)! - Added `operationName` in
  `resolved()`, `inlineResolved()`, `useTransactionQuery()` and `useLazyQuery()`

- [#1544](https://github.com/gqty-dev/gqty/pull/1544)
  [`a758ed1`](https://github.com/gqty-dev/gqty/commit/a758ed17130ff2f5e8fc659c9ded3203798f9724)
  Thanks [@vicary](https://github.com/vicary)! - Upgrade to the new core

- [#1544](https://github.com/gqty-dev/gqty/pull/1544)
  [`a758ed1`](https://github.com/gqty-dev/gqty/commit/a758ed17130ff2f5e8fc659c9ded3203798f9724)
  Thanks [@vicary](https://github.com/vicary)! - Added `ResolverContainer` to
  replace scheduler for legacy resolvers.

- [#1544](https://github.com/gqty-dev/gqty/pull/1544)
  [`a758ed1`](https://github.com/gqty-dev/gqty/commit/a758ed17130ff2f5e8fc659c9ded3203798f9724)
  Thanks [@vicary](https://github.com/vicary)! - Added `onComplete` in
  `useMutation`

- [#1544](https://github.com/gqty-dev/gqty/pull/1544)
  [`a758ed1`](https://github.com/gqty-dev/gqty/commit/a758ed17130ff2f5e8fc659c9ded3203798f9724)
  Thanks [@vicary](https://github.com/vicary)! - Added `retry` in `useQuery()`

- [#1470](https://github.com/gqty-dev/gqty/pull/1470)
  [`11604f5`](https://github.com/gqty-dev/gqty/commit/11604f54f3907ea2c3662334e53f71bda4c327a3)
  Thanks [@vicary](https://github.com/vicary)! - Added `refetchInteraval`,
  `refetchIntervalInBackground`, `refetchOnReconnect` and
  `refetchOnWindowVisible` in `useQuery`.

- [#1544](https://github.com/gqty-dev/gqty/pull/1544)
  [`a758ed1`](https://github.com/gqty-dev/gqty/commit/a758ed17130ff2f5e8fc659c9ded3203798f9724)
  Thanks [@vicary](https://github.com/vicary)! - Fetch errors now throws to
  boundaries in suspense mode.

- [#1468](https://github.com/gqty-dev/gqty/pull/1468)
  [`6626d80`](https://github.com/gqty-dev/gqty/commit/6626d802f28ce39970acbcf27166b2732e5ac217)
  Thanks [@vicary](https://github.com/vicary)! - Add `$refetch` in `useQuery()`

- [#1544](https://github.com/gqty-dev/gqty/pull/1544)
  [`a758ed1`](https://github.com/gqty-dev/gqty/commit/a758ed17130ff2f5e8fc659c9ded3203798f9724)
  Thanks [@vicary](https://github.com/vicary)! - Added `extensions` option for
  passing arbitraty data to the query fetcher.

### Patch Changes

- [#1742](https://github.com/gqty-dev/gqty/pull/1742)
  [`2e274f1`](https://github.com/gqty-dev/gqty/commit/2e274f12144a900f88c85358c23a6b357f1e8d11)
  Thanks [@vicary](https://github.com/vicary)! - Stop auto refetch on render
  when `maxRetries` is reached.

- Updated dependencies
  [[`a758ed1`](https://github.com/gqty-dev/gqty/commit/a758ed17130ff2f5e8fc659c9ded3203798f9724),
  [`a758ed1`](https://github.com/gqty-dev/gqty/commit/a758ed17130ff2f5e8fc659c9ded3203798f9724),
  [`a758ed1`](https://github.com/gqty-dev/gqty/commit/a758ed17130ff2f5e8fc659c9ded3203798f9724),
  [`a758ed1`](https://github.com/gqty-dev/gqty/commit/a758ed17130ff2f5e8fc659c9ded3203798f9724),
  [`fe29ac0`](https://github.com/gqty-dev/gqty/commit/fe29ac0468389ea0783d97eb297b28b4b4fc11d2),
  [`a758ed1`](https://github.com/gqty-dev/gqty/commit/a758ed17130ff2f5e8fc659c9ded3203798f9724),
  [`a758ed1`](https://github.com/gqty-dev/gqty/commit/a758ed17130ff2f5e8fc659c9ded3203798f9724),
  [`ac34d04`](https://github.com/gqty-dev/gqty/commit/ac34d0477c6cee041177c125336003aec47080df),
  [`a758ed1`](https://github.com/gqty-dev/gqty/commit/a758ed17130ff2f5e8fc659c9ded3203798f9724),
  [`7ffaebf`](https://github.com/gqty-dev/gqty/commit/7ffaebf0c327efdf567a6c241188b72732001ffc),
  [`a758ed1`](https://github.com/gqty-dev/gqty/commit/a758ed17130ff2f5e8fc659c9ded3203798f9724),
  [`a758ed1`](https://github.com/gqty-dev/gqty/commit/a758ed17130ff2f5e8fc659c9ded3203798f9724),
  [`2e274f1`](https://github.com/gqty-dev/gqty/commit/2e274f12144a900f88c85358c23a6b357f1e8d11),
  [`a758ed1`](https://github.com/gqty-dev/gqty/commit/a758ed17130ff2f5e8fc659c9ded3203798f9724),
  [`a758ed1`](https://github.com/gqty-dev/gqty/commit/a758ed17130ff2f5e8fc659c9ded3203798f9724),
  [`ffb7d5c`](https://github.com/gqty-dev/gqty/commit/ffb7d5c0a3ff2d640d2d885fccd6916e48b799eb),
  [`595ec84`](https://github.com/gqty-dev/gqty/commit/595ec8431de0d4be2edc4f60809988bda0cf2833),
  [`a758ed1`](https://github.com/gqty-dev/gqty/commit/a758ed17130ff2f5e8fc659c9ded3203798f9724),
  [`a758ed1`](https://github.com/gqty-dev/gqty/commit/a758ed17130ff2f5e8fc659c9ded3203798f9724),
  [`a758ed1`](https://github.com/gqty-dev/gqty/commit/a758ed17130ff2f5e8fc659c9ded3203798f9724),
  [`a758ed1`](https://github.com/gqty-dev/gqty/commit/a758ed17130ff2f5e8fc659c9ded3203798f9724),
  [`a758ed1`](https://github.com/gqty-dev/gqty/commit/a758ed17130ff2f5e8fc659c9ded3203798f9724),
  [`a758ed1`](https://github.com/gqty-dev/gqty/commit/a758ed17130ff2f5e8fc659c9ded3203798f9724),
  [`a758ed1`](https://github.com/gqty-dev/gqty/commit/a758ed17130ff2f5e8fc659c9ded3203798f9724)]:
  - gqty@3.0.0

## 2.1.1

### Patch Changes

- 929f2b15: fix(react): stale state in useTransactionQuery

## 2.1.0

### Minor Changes

- 6ced359: New "$state.error" property in "useQuery" which gives the last
  scheduler Error, for more in-depth error management it's still recommended to
  use `useMetaState` hook

  Closes [#111](https://github.com/gqty-dev/gqty/issues/111)

### Patch Changes

- 353b9cb: Fix require interop

## 2.0.1

### Patch Changes

- 826bc98: Change React import to "\* as React"
- Updated dependencies [d6d0a22]
  - gqty@2.0.4

## 2.0.0

### Major Changes

- 3586c45: Remove undocumented "buildSelections"
- 3586c45: Change previous unstable `Unions` support with new `"$on"` property
  with support for both `Unions` & `Interfaces`

### Patch Changes

- Updated dependencies [3586c45]
- Updated dependencies [3586c45]
  - gqty@2.0.0

## 1.1.1

### Patch Changes

- 1fc2672: add "sideEffects: false" for improved tree-shaking
- Updated dependencies [1fc2672]
  - gqty@1.1.2

## 1.1.0

### Minor Changes

- d3d0d38: [useTransactionQuery] add "pollInBackground" and default-disable
  background polling

### Patch Changes

- 327362d: forceUpdate timeout for useSubscription
- Updated dependencies [e6afb46]
- Updated dependencies [4c66ab2]
  - gqty@1.0.3

## 1.0.1

### Patch Changes

- 3784c2b: release
- Updated dependencies [3784c2b]
  - gqty@1.0.1

## 2.0.16

### Patch Changes

- 3f08372: publish fork
- 184a074: fix update loop <https://github.com/PabloSzx/gqty/pull/223>
- Updated dependencies [3f08372]
  - gqty@2.0.15

## 2.0.15

### Patch Changes

- 4a3d5ef: fix useQuery's prepare update
- af6a437: - Rename `gqtyConfig` to `GQtyConfig` (so it's consistent with the
  new logo)
  - Rename `gqtyError` to `GQtyError`
  - Remove `endpoint` option from the configuration, and instead always defaults
    to introspection one
    - It's confusing why theres two of them, and the user can change it later by
      modifying the file anyway
- 4a3d5ef: fix args state usePaginatedQuery
- 4a3d5ef: detach react default retry in useMutation
- Updated dependencies [4a3d5ef]
- Updated dependencies [af6a437]
  - gqty@2.0.13

## 2.0.14

### Patch Changes

- f14df08: fix `forceUpdate` race condition
- Updated dependencies [c45ca0d]
  - gqty@2.0.12

## 2.0.13

### Patch Changes

- c25bb2e: [usePaginatedQuery] pause cache changes while merge

## 2.0.12

### Patch Changes

- c54375d: add "usePaginatedQuery" hook
- Updated dependencies [85a389c]
- Updated dependencies [cca9d02]
- Updated dependencies [0904297]
  - gqty@2.0.11

## 2.0.11

### Patch Changes

- c486bec: fix useTransactionQuery suspense & fetchPolicy
- Updated dependencies [65c4d32]
  - gqty@2.0.10

## 2.0.10

### Patch Changes

- Updated dependencies [6a9269f]
  - gqty@2.0.9

## 2.0.9

### Patch Changes

- d78f2ab: fix useTransactionQuery
- Updated dependencies [c74442e]
- Updated dependencies [d78f2ab]
- Updated dependencies [0ffaa9d]
  - gqty@2.0.8

## 2.0.8

### Patch Changes

- 40d2101: allow specify proxies in useMetaState
- 63fd3ea: support for non-serializable variables
- Updated dependencies [ff66195]
- Updated dependencies [63fd3ea]
- Updated dependencies [40d2101]
  - gqty@2.0.7

## 2.0.7

### Patch Changes

- 173e11d: add subscriptions to events
- Updated dependencies [173e11d]
- Updated dependencies [c613410]
  - gqty@2.0.6

## 2.0.6

### Patch Changes

- Updated dependencies [6fef085]
  - gqty@2.0.5

## 2.0.5

### Patch Changes

- 2bf4ce2: add useQuery "prepare" helper
- Updated dependencies [2bf4ce2]
  - gqty@2.0.4

## 2.0.4

### Patch Changes

- 27f9ece: set "graphql" as optional peerDependency
- Updated dependencies [27f9ece]
  - gqty@2.0.3

## 2.0.3

### Patch Changes

- Updated dependencies [c06ef80]
  - gqty@2.0.2

## 2.0.2

### Patch Changes

- 5f29d52: change useQuery's "gqtyState" to "$state"

## 2.0.1

### Patch Changes

- a57cab4: official beta v2 publish
- Updated dependencies [a57cab4]
  - gqty@2.0.1
