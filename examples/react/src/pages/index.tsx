import { Button, HStack, Stack, Text } from '@chakra-ui/react';
import { selectFields } from 'gqty';
import { FunctionComponent, Suspense, useReducer } from 'react';
import {
  graphql,
  useQuery,
  useRefetch,
  useTransactionQuery,
} from '../components/client';
import NormalizedPage from './normalized';

let nRenders = 0;

const Comp: FunctionComponent<{ queryFromHook: ReturnType<typeof useQuery> }> =
  graphql(function Asd({ queryFromHook }) {
    const { data } = useTransactionQuery(
      (query) => {
        return query.dogs.map((dog) => {
          return {
            dogName: dog.name,
            owner: dog.owner?.__typename ? 'has owner 😁' : 'no owner 😔',
          };
        });
      },
      { skip: false }
    );

    const [n, dispatch] = useReducer(
      (state: number, action: 'add' | 'substact') => {
        return action === 'add' ? ++state : --state;
      },
      1
    );

    const typename = queryFromHook.__typename;

    const refetch = useRefetch();

    try {
      queryFromHook.paginatedHumans({
        input: {
          first: 10,
        },
      }).__typename;
    } catch (err) {}

    return (
      <HStack alignItems="start" whiteSpace="pre-wrap">
        <Stack>
          <HStack>
            <Text>Depth: {n}</Text>
            <Button onClick={() => dispatch('add')}>+</Button>
            <Button onClick={() => dispatch('substact')}>-</Button>
          </HStack>

          <Text>{typename}</Text>

          <Text>
            {JSON.stringify(selectFields(queryFromHook.dogs, '*', n), null, 2)}
          </Text>
        </Stack>

        <Stack>
          <Button
            onClick={() => {
              refetch().catch(console.error);
              queryFromHook.$refetch().catch(console.error);
            }}
          >
            Refetch everything
          </Button>

          <Text>useTransactionQuery: "{JSON.stringify(data, null, 2)}"</Text>
        </Stack>
      </HStack>
    );
  });

export default function Index() {
  const query = useQuery({
    suspense: false,
    refetchOnWindowVisible: true,
  });

  return (
    <Suspense fallback="Loading...">
      <Stack>
        <Text>Time: {query.time}</Text>
        <Text>Render: {++nRenders}</Text>

        <HStack alignItems="start">
          <Comp queryFromHook={query} />
          <NormalizedPage />
        </HStack>
      </Stack>
    </Suspense>
  );
}
