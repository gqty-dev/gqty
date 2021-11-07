import { useQuery, useTransactionQuery } from '../components/client';
import { NoSSR } from '../components/NoSSR';
import { Suspense, useState } from 'react';
import { serializeError } from 'serialize-error';
import { GQtyError } from 'gqty';
import { Stack, Text } from '@chakra-ui/react';

const ExpectedErrorComponent = () => {
  const { data, error } = useTransactionQuery(
    (query) => {
      return {
        a: query.thirdTry,
        b: query.__typename,
      };
    },
    {
      suspense: true,
      retry: true,
      fetchPolicy: 'no-cache',
      skip: true,
    }
  );

  const query = useQuery({
    suspense: true,
  });

  return (
    <>
      <Stack>
        {<Text>HOOK DATA:{JSON.stringify(data)}</Text>}
        {error && (
          <Text>HOOK ERROR: {JSON.stringify(serializeError(error))}</Text>
        )}
      </Stack>
      <Stack>
        <Text>
          INLINE DATA:{' '}
          {JSON.stringify({
            a: query.thirdTry,
            b: query.__typename,
            c: query.expectedNullableError,
          })}
        </Text>

        {query.$state.error && (
          <Text>
            INLINE ERROR: {JSON.stringify(serializeError(query.$state.error))}
          </Text>
        )}
      </Stack>
    </>
  );
};

export default function ErrorPage() {
  return (
    <NoSSR>
      <Suspense fallback={<Text>Loading Here...</Text>}>
        <ExpectedErrorComponent />
      </Suspense>
    </NoSSR>
  );
}
