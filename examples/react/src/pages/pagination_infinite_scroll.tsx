import { Stack, Text } from '@chakra-ui/react';
import { useDebouncedEffect } from '@react-hookz/web';
import { useInView } from 'react-intersection-observer';
import { usePaginatedQuery } from '../components/client';
import { ConnectionArgs } from '../graphql/gqty';

const first = 20;

export default function Page() {
  const { data, fetchMore, isLoading } = usePaginatedQuery(
    (query, input: ConnectionArgs, { getArrayFields }) => {
      const {
        nodes,
        pageInfo: { hasNextPage, endCursor },
      } = query.paginatedHumans({
        input,
      });
      return {
        time: query.time,
        nodes: getArrayFields(nodes, 'name'),
        hasNextPage,
        endCursor,
      };
    },
    {
      initialArgs: {
        first,
      },
      merge({ data: { existing, incoming }, uniqBy }) {
        if (existing) {
          return {
            ...incoming,
            nodes: uniqBy([...existing.nodes, ...incoming.nodes], (v) => v.id),
          };
        }
        return incoming;
      },
      fetchPolicy: 'cache-and-network',
      suspense: true,
    }
  );

  const { ref, inView } = useInView({
    threshold: 0,
  });

  useDebouncedEffect(
    () => {
      if (!isLoading && inView && data?.hasNextPage && data.endCursor) {
        fetchMore({
          after: data.endCursor,
          first,
        });
      }
    },
    [inView, data, fetchMore],
    100
  );

  return (
    <Stack>
      <Text whiteSpace="pre-wrap">
        {JSON.stringify(
          {
            time: data?.time,
            data: data?.nodes.map(({ id, name }) => ({ id, name })),
            endCursor: data?.endCursor,
            hasNextPage: data?.hasNextPage,
          },
          null,
          2
        )}
      </Text>

      {!isLoading && data?.hasNextPage && <Text ref={ref}>Loading...</Text>}
    </Stack>
  );
}
