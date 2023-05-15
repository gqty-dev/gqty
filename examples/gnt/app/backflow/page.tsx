'use client';

import { useState, type FunctionComponent } from 'react';
import Button from '~/components/tailwindui/Button';
import { useQuery, type Query } from '~/gqty';

const CharacterList: FunctionComponent<{
  onClick?: (query: Query) => void;
}> = ({ onClick }) => {
  const query = useQuery();

  console.debug('render chars');

  return (
    <>
      {query
        .characters({ filter: { name: 'Alien' } })
        ?.results?.map((character) => (
          <button
            key={character?.id ?? '0'}
            className="block text-blue-600 hover:text-blue-400 hover:underline cursor-pointer"
            onClick={
              character
                ? () => {
                    onClick?.(query);
                  }
                : undefined
            }
          >
            {character?.id}. {character?.name} ({character?.location?.name})
          </button>
        ))}
    </>
  );
};

const LocationList: FunctionComponent = () => {
  const query = useQuery();

  console.debug('render location');

  return (
    <>
      {query.locations()?.results?.map((location) => (
        <div key={location?.id ?? '0'}>
          {location?.id}. {location?.name} (
          {location?.residents.map((r) => r?.id).length})
        </div>
      ))}
    </>
  );
};

export default function Home() {
  const [childQuery, setChildQuery] = useState<Query>();

  console.debug('render parent');

  return (
    <main className="p-5 min-h-screen">
      {childQuery && (
        <div className="border rounded-xl bg-white p-2">
          <Button className="mb-2" onClick={() => setChildQuery(undefined)}>
            Close
          </Button>

          <LocationList />
        </div>
      )}

      <div className="border rounded-xl p-2 m-2">
        <h1 className="text-2xl">Parent</h1>

        <h2>Query using self scope</h2>

        <CharacterList onClick={(query) => setChildQuery(query)} />
      </div>
    </main>
  );
}
