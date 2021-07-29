import { GraphQLError } from 'graphql';

import { GQtyError } from '../src/Error';

test('error creation', () => {
  const a = new GQtyError('a');

  const b = GQtyError.create(Error('a'));

  const c = GQtyError.create(a);

  const d = GQtyError.create(123);

  const e = new GQtyError('abc', {
    graphQLErrors: [new GraphQLError('gql error')],
  });

  expect(a).toStrictEqual(b);

  expect(a).toBe(c);

  expect(d.message).toBe('Unexpected error type');
  expect(d.otherError).toBe(123);

  expect(JSON.stringify(e)).toBe(
    `{"message":"abc","graphQLErrors":[{"message":"gql error"}]}`
  );

  expect(e).toEqual(
    Object.assign(Error('abc'), {
      graphqlErrors: [new GraphQLError('gql error')],
    })
  );
});
