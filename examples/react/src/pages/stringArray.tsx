import { Stack, Text } from '@chakra-ui/react';
import { useQuery } from '../components/client';
import { query } from '../graphql/gqty';

query.dogs;

export default function TestingStringArray() {
  const query = useQuery({
    suspense: false,
  });

  return (
    <Stack>
      {query.stringList.map((v, index) => (
        <Text key={index}>{v}</Text>
      ))}
    </Stack>
  );
}
