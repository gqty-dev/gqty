---
'gqty': patch
---

`Variables`/`Args` utility type to re-use variables types from any field with arguments.

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
