'use client';

import { useEffect, useState, type FunctionComponent } from 'react';
import Button from '~/components/tailwindui/Button';
import { useQuery, type Character } from './gqty';

const CharacterList: FunctionComponent<{
  onClick?: (p: Character) => void;
}> = ({ onClick }) => {
  const query = useQuery({
    refetchOnWindowVisible: false,
    refetchOnRender: false,
  });

  useEffect(() => {
    query.$refetch(false);
  }, []);

  // console.log('render: characters');

  return (
    <>
      {query.characters()?.results?.map((character) => (
        <button
          key={character?.id ?? '0'}
          className="block text-blue-600 hover:text-blue-400 hover:underline cursor-pointer"
          onClick={character ? () => onClick?.(character) : undefined}
        >
          {character?.id}. {character?.name}
        </button>
      ))}
    </>
  );
};

export default function Home() {
  const query = useQuery({
    refetchOnWindowVisible: false,
  });
  const [character, setCharacter] = useState<Character>();

  return (
    <main className="p-5 min-h-screen grid gap-2 grid-cols-2">
      <div className="border border-gray-400 rounded-xl p-2 m-2">
        <p>
          We have{' '}
          {query.locations()?.results?.map((loc) => loc?.id).length ?? '-'}{' '}
          locations, click on a character to assign a location.
        </p>

        <CharacterList onClick={(datum) => setCharacter(datum)} />

        {character && (
          <div className="mt-2">
            <Button className="mb-2" onClick={() => setCharacter(undefined)}>
              Close
            </Button>

            <p>Current character: {character.name}.</p>
          </div>
        )}
      </div>
    </main>
  );
}
