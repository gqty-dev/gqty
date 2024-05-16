'use client';

import { useState, type FunctionComponent } from 'react';
import Button from '~/components/tailwindui/Button';
import type { Character, Maybe } from '~/gqty';
import { useQuery } from '~/gqty/react';
import Avatar from './Avatar';
import Card from './Card';
import SmallText from './SmallText';
import Text from './Text';

export type Props = {};

const Component: FunctionComponent<Props> = () => {
  const [searchValue, setSearchValue] = useState<string>();

  const query = useQuery({
    // cachePolicy: 'no-cache',
  });

  const error = query.$state.error;

  return (
    <>
      <SearchBox
        onChange={(v) => {
          setSearchValue(v);
          query.$refetch(false);
        }}
      />

      {error && (
        <Card>
          {error.name ?? 'Error'}: {error.message}
        </Card>
      )}

      {!error && (
        <Characters
          characters={
            query.characters(
              searchValue ? { filter: { name: searchValue } } : undefined
            )?.results ?? undefined
          }
        />
      )}
    </>
  );
};

const SearchBox: FunctionComponent<{
  onChange?: (value: string) => void;
}> = ({ onChange }) => {
  const [inputName, setInputName] = useState('');

  return (
    <div className="flex gap-3">
      <input
        type="text"
        defaultValue={inputName}
        onChange={(e) => setInputName(e.target.value)}
        className="border border-gray-300 rounded-md px-3 py-2 w-full text-black"
      />
      <Button onClick={() => onChange?.(inputName)}>Search</Button>
    </div>
  );
};

const Characters: FunctionComponent<{ characters?: Maybe<Character>[] }> = ({
  characters,
}) => {
  return (
    <>
      {characters?.map((character) => (
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

export default Component;
