import { Button, HStack, Stack, Text } from '@chakra-ui/react';
import { selectFields } from 'gqty';
import { type NextPage } from 'next';
import { FunctionComponent, Suspense, useState } from 'react';
import { useMutation, useQuery } from '../components/client';
import { Human } from '../graphql/schema.generated';

const LazyMutationComponent: FunctionComponent = () => {
  const [renameHuman, lazyState] = useMutation(
    (mutation, { name }: { name: string }) => {
      const human = mutation.renameHuman({ id: '1', name });

      human?.id;
      human?.name;
    }
  );

  return (
    <>
      <Text>Lazy Mutation</Text>
      <Button
        onClick={() => {
          renameHuman({ args: { name: 'A' } });
        }}
      >
        Rename Human: A
      </Button>
      <Text whiteSpace="pre-wrap">{JSON.stringify(lazyState, null, 2)}</Text>
    </>
  );
};

const HumanComponent: FunctionComponent<{ human: Human | null }> = ({
  human: user,
}) => {
  if (user === null) {
    return <>No such human.</>;
  }

  return (
    <>
      <Text>
        👱🏻‍♂️ {user.id}. {user.name}
      </Text>
      <ul>
        {user.dogs?.map((dog) => (
          <li key={dog.id ?? '0'}>🐶 {dog.name}</li>
        ))}
      </ul>
    </>
  );
};

const ProxyMutationComponent: FunctionComponent = () => {
  const { $state, renameHuman } = useMutation();
  const [human, setHuman] = useState<Human | null>();

  return (
    <>
      <Text>Proxy Mutation</Text>
      <Button
        onClick={() => {
          const human = renameHuman({ id: '1', name: 'B' });

          setHuman(human);
        }}
      >
        Rename Human: B
      </Button>
      <Text whiteSpace="pre-wrap">{JSON.stringify($state, null, 2)}</Text>
      {human && <HumanComponent human={human} />}
    </>
  );
};

const ProxyMutationComponentWithSuspense: FunctionComponent = () => {
  const { $state, renameHuman } = useMutation({ suspense: true });

  return (
    <>
      <Text>Proxy Mutation (Suspense)</Text>
      <Button
        onClick={() => {
          const human = renameHuman({ id: '1', name: 'C' });
          human?.id;
          human?.name;
        }}
      >
        Rename Human: C
      </Button>
    </>
  );
};

const MutationPage: NextPage = () => {
  const query = useQuery();

  return (
    <Stack>
      <HStack alignItems="start" gap={5}>
        <Stack minWidth={200}>
          <LazyMutationComponent />
        </Stack>
        <Stack minWidth={200}>
          <ProxyMutationComponent />
        </Stack>
        <Stack minWidth={200}>
          <Suspense fallback="Suspense Loading...">
            <ProxyMutationComponentWithSuspense />
          </Suspense>
        </Stack>
      </HStack>

      <Text fontSize={24}>query.humans:</Text>
      <Text whiteSpace="pre-wrap">
        {JSON.stringify(selectFields(query.humans, '*'), null, 2)}
      </Text>
    </Stack>
  );
};

export default MutationPage;
