# gqty

## 2.0.3

### Patch Changes

- 9e22119: Fix unions/interface fetch loop

  closes #236

## 2.0.2

### Patch Changes

- d014462: remove unused dependency
- 6b60991: improve normalization key auto-fetch logic
- 5cc001f: Fix: Prevent duplicated concurrent scheduler fetch
- d6da2ae: `Variables`/`Args` utility type to re-use variables types from any field with arguments.

  You can use either `Variables` or `Args`.

  ```ts
  import { query, Query } from '../gqty';

  import type { Variables, Args } from 'gqty';

  function getUserName(args: Variables<Query['user']>) {
    return query.user(args).name;
  }

  function getUserEmail(args: Args<typeof query['user']>) {
    return query.user(args).email;
  }
  ```

## 2.0.1

### Patch Changes

- 28e2c09: [Bug fixing breaking change] Fix types and retrieval of unions/interfaces of different object types

## 2.0.0

### Major Changes

- 3586c45: Remove undocumented "buildSelections"
- 3586c45: Change previous unstable `Unions` support with new `"$on"` property with support for both `Unions` & `Interfaces`

## 1.1.3

### Patch Changes

- 3b9c614: Improve refetch selection history logic

## 1.1.2

### Patch Changes

- 1fc2672: add "sideEffects: false" for improved tree-shaking

## 1.1.1

### Patch Changes

- 6703c2f: fix undefined object types names

## 1.1.0

### Minor Changes

- a216972: add "track" helper, specially useful subscriptions and tracking cache state

## 1.0.3

### Patch Changes

- e6afb46: fix refetch array on initially empty state
- 4c66ab2: fix prepareRender await

## 1.0.2

### Patch Changes

- 25aceae: fix ESM import with extension

## 1.0.1

### Patch Changes

- 3784c2b: release

## 2.0.15

### Patch Changes

- 3f08372: publish fork

## 2.0.14

### Patch Changes

- 422eb9a: allow set core "resolved" defaults
- 422eb9a: hotfix nullable getFields

## 2.0.13

### Patch Changes

- 4a3d5ef: divide subscriptions with only one top level field
- af6a437: - Rename `gqtyConfig` to `GQtyConfig` (so it's consistent with the new logo)
  - Rename `gqtyError` to `GQtyError`
  - Remove `endpoint` option from the configuration, and instead always defaults to introspection one
    - It's confusing why theres two of them, and the user can change it later by modifying the file anyway

## 2.0.12

### Patch Changes

- c45ca0d: add NPM readme

## 2.0.11

### Patch Changes

- 85a389c: fix selections backup & fix resolved false-positive warn
- cca9d02: add inlineResolved function
- 0904297: remove normalizedCache from persistence

## 2.0.10

### Patch Changes

- 65c4d32: add resolved "onEmptyResolve" callback and warn on empty "resolved" calls

## 2.0.9

### Patch Changes

- 6a9269f: fix getArrayFields type inference on nullable arrays

## 2.0.8

### Patch Changes

- c74442e: fix prepareRender logic
- d78f2ab: resolved "onNoCacheFound" helper
- 0ffaa9d: optimize selections cache & backups size

## 2.0.7

### Patch Changes

- ff66195: fix getFields
- 63fd3ea: support for non-serializable variables
- 40d2101: improve array length access

## 2.0.6

### Patch Changes

- 173e11d: add subscriptions to events
- c613410: fix selection alias id & persistence only query

## 2.0.5

### Patch Changes

- 6fef085: add cache persistence helpers

## 2.0.4

### Patch Changes

- 2bf4ce2: add inner scheduler "getResolvingPromise"

## 2.0.3

### Patch Changes

- 27f9ece: set "graphql" as optional peerDependency

## 2.0.2

### Patch Changes

- c06ef80: add "prepass" helper

## 2.0.1

### Patch Changes

- a57cab4: official beta v2 publish
