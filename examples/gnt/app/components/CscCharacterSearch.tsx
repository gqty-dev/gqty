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
      <SelectBox onChange={setSearchValue} />
      {searchValue && <Character id={searchValue} />}
    </>
  );
};

const SelectBox: FunctionComponent<{
  onChange?: (value: string) => void;
}> = ({ onChange }) => {
  const [value, setValue] = useState<string>();

  return (
    <div className="flex gap-3">
      <input
        type="number"
        defaultValue={value}
        onChange={(e) => setValue(e.target.value)}
        className="border border-gray-300 rounded-md px-3 py-2 w-full text-black"
      />
      <Button
        onClick={() => {
          if (value) {
            onChange?.(value);
          }
        }}
      >
        Search
      </Button>
    </div>
  );
};

const Character: FunctionComponent<Variables<Query['character']>> = (props) => {
  const character = useQuery().character(props);

  return (
    <Card>
      <Avatar character={character} />

      <div className="flex-1">
        <Text>{character?.name}</Text>
        <SmallText>{character?.species}</SmallText>
        <SmallText>{character?.origin?.name}</SmallText>
      </div>
    </Card>
  );
};

export default Component;
