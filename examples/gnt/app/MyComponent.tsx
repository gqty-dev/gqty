'use client';

import { type FunctionComponent } from 'react';
import { useQuery } from '~/gqty';
import Avatar from './Avatar';
import Card from './Card';
import SmallText from './SmallText';
import Text from './Text';

export type Props = {};

const MyComponent: FunctionComponent<Props> = () => {
  const query = useQuery();

  return (
    <>
      {query.characters()?.results?.map((character) => (
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
