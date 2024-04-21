import { Button, Checkbox, Input, Stack, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { useQuery, useRefetch } from '../components/client';

let renderCount = 0;

export default function RefetchPage() {
  const [fetchInBackground, setFetchInBackground] = useState<boolean>(false);
  const [refetchInterval, setRefetchOnInterval] = useState<number>();
  const [refetchOnReconnect, setRefetchOnReconnect] = useState<boolean>(true);
  const [refetchOnRender, setRefetchOnRender] = useState<boolean>(true);
  const [refetchOnWindowVisible, setRefetchOnWindowVisible] =
    useState<boolean>(true);

  const query = useQuery({
    fetchInBackground,
    refetchInterval,
    refetchOnReconnect,
    refetchOnRender,
    refetchOnWindowVisible,
  });

  const refetchTime = useRefetch();

  const time = query.time;

  refetchTime.stopWatching();

  const refetchQueryTypename = useRefetch();

  const queryTypename = query.__typename;

  return (
    <Stack>
      <Text>{time}</Text>
      <Button onClick={() => refetchTime()}>
        Refetch time{refetchTime.isLoading ? '...' : ''}
      </Button>
      <Text>{queryTypename}</Text>
      <Button onClick={() => refetchQueryTypename()}>
        Refetch query typename{refetchQueryTypename.isLoading ? '...' : ''}
      </Button>
      <Input
        placeholder="refetchInterval (ms)"
        value={refetchInterval}
        onChange={(e) => {
          const value = parseInt(e.target.value);

          setRefetchOnInterval(isNaN(value) || value < 0 ? undefined : value);
        }}
      />
      <Checkbox
        defaultChecked={fetchInBackground}
        onChange={(e) => setFetchInBackground(e.target.checked)}
      >
        fetchInBackground
      </Checkbox>
      <Checkbox
        defaultChecked={refetchOnReconnect}
        onChange={(e) => setRefetchOnReconnect(e.target.checked)}
      >
        refetchOnReconnect
      </Checkbox>
      <Checkbox
        defaultChecked={refetchOnRender}
        onChange={(e) => setRefetchOnRender(e.target.checked)}
      >
        refetchOnRender
      </Checkbox>
      <Checkbox
        defaultChecked={refetchOnWindowVisible}
        onChange={(e) => setRefetchOnWindowVisible(e.target.checked)}
      >
        refetchOnWindowVisible
      </Checkbox>
      <Text>Render Count: {renderCount++}</Text>
    </Stack>
  );
}
