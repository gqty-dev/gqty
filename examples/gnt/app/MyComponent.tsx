'use client';

import { useDeferredValue, useState, type FunctionComponent } from 'react';
import { useQuery } from '~/gqty/react';
import Avatar from './Avatar';
import Card from './Card';
import SmallText from './SmallText';
import Text from './Text';

export type Props = {};

const MyComponent: FunctionComponent<Props> = () => {
  const [name, setName] = useState('Rick');
  const deferredName = useDeferredValue(name);
  const query = useQuery();

  return (
    <>
      <input
        type="text"
        defaultValue={name}
        onChange={(e) => setName(e.target.value)}
        className="border border-gray-300 rounded-md px-3 py-2 w-full text-black"
      />

      {query
        .characters({ filter: { name: deferredName } })
        ?.results?.map((character) => (
          <Card key={character?.id ?? '0'}>
            <Avatar character={character} />

            <div className="flex-1">
              <Text>{character?.name}</Text>
              <SmallText>{character?.species}</SmallText>
              <SmallText>{character?.origin?.name}</SmallText>
            </div>
          </Card>
        ))}
    </>
  );
};

export default MyComponent;
