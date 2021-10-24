---
'@gqty/cli': minor
---

New [Envelop](https://www.envelop.dev/) / [graphql-ez](https://www.graphql-ez.com/) plugin that automatically generates gqty code based on schema and gqty.config.cjs

```ts
// graphql-ez

// ...
import { useGenerateGQty } from '@gqty/cli/envelop';

const ezApp = CreateApp({
  // ...
  envelop: {
    plugins: [
      // ...
      useGenerateGQty({
        // ...
      }),
    ],
  },
});
```

```ts
// Envelop

import { envelop } from '@envelop/core';
import { useGenerateGQty } from '@gqty/cli/envelop';

//...

const getEnveloped = envelop({
  plugins: [
    // ...
    useGenerateGQty({
      // ...
    }),
  ],
});
```
