import test from 'ava';
import { query, resolved } from '../src/gqty';

test('Hello World', async (t) => {
  const result = await resolved(() => {
    return query.hello;
  });

  t.is(result, 'Hello World');
});
