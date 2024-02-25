import { type FunctionComponent } from 'react';
import { useQuery } from '../gqty';
import Avatar from './Avatar';
import Card from './Card';
import SmallText from './SmallText';
import Text from './Text';

const Characters: FunctionComponent<{
  className?: string;
  name?: string;
}> = ({ className, name }) => {
  const { characters } = useQuery({ suspense: true });

  return (
    <div className={className}>
      {characters({ filter: { name } })?.results?.map((character) => (
        <Card key={character?.id ?? '0'}>
          <Avatar character={character} />

          <div className="flex-1 text-black">
            <Text>{character?.name}</Text>
            <SmallText>{character?.species}</SmallText>
            <SmallText>{character?.origin?.name}</SmallText>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default Characters;
