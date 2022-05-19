import { query, resolved } from '../src/gqty';

import test from 'ava';

test('Hello World', async (t) => {
  const result = await resolved(() => {
    return query.hello;
  });

  t.is(result, 'Hello World');
});
