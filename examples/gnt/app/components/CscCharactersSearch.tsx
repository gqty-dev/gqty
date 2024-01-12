'use client';

import type { Variables } from 'gqty';
import { useState, type FunctionComponent } from 'react';
import Button from '~/components/tailwindui/Button';
import type { Query } from '~/gqty';
import { useQuery } from '~/gqty/react';
import Avatar from './Avatar';
import Card from './Card';
import SmallText from './SmallText';
import Text from './Text';

export type Props = {};

const Component: FunctionComponent<Props> = () => {
  const [searchValue, setSearchValue] = useState<string>();

  return (
    <>
      <SearchBox onChange={setSearchValue} />
      <Characters filter={{ name: searchValue }} />
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

const Characters: FunctionComponent<Variables<Query['characters']>> = (
  props
) => {
  const query = useQuery();

  return (
    <>
      {query.characters(props)?.results?.map((character) => (
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
