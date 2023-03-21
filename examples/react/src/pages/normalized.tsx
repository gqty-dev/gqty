import { Button, Stack, Text } from '@chakra-ui/react';
import { selectFields } from 'gqty';
import { useMutation, useQuery } from '../components/client';

export default function NormalizedPage() {
  const query = useQuery({
    suspense: true,
    staleWhileRevalidate: true,
  });

  const [renameDog] = useMutation((mutation, { name }: { name: string }) => {
    const dog = mutation.renameDog({
      id: '1',
      name,
    });

    dog?.id;
    dog?.name;
  });

  const [renameHuman] = useMutation((mutation, { name }: { name: string }) => {
    const human = mutation.renameHuman({
      id: '1',
      name,
    });

    human?.id;
    human?.name;
  });

  return (
    <Stack>
      <Button
        onClick={() => {
          renameDog({
            args: { name: query.humans[0].dogs?.[0].name === 'a' ? 'z' : 'a' },
          });
        }}
      >
        rename dog
      </Button>
      <Button
        onClick={() =>
          renameHuman({
            args: { name: query.humans[0].name === 'g' ? 'x' : 'g' },
          })
        }
      >
        rename human
      </Button>

      <Text>{query.time}</Text>

      <Text whiteSpace="pre-wrap">
        {JSON.stringify(selectFields(query.humans, '*', 3), null, 2)}
      </Text>
    </Stack>
  );
}
