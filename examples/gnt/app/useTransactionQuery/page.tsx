'use client';

import { useState } from 'react';
import { useTransactionQuery } from '~/gqty/react';

export default function UseTransactionQuery() {
  const [skip, setSkip] = useState(false);
  const { data, isLoading, error } = useTransactionQuery(
    (query) => {
      return query
        .characters({
          filter: {
            name: 'Rick',
          },
        })
        ?.results?.map((character) => ({
          id: character?.id,
          name: character?.name,
        }));
    },
    { skip }
  );

  return (
    <main className="p-5 min-h-screen">
      <h1 className="text-2xl font-semibold">Use Transaction Query</h1>

      <input
        id="boolSkip"
        type="checkbox"
        checked={skip}
        onChange={() => setSkip(!skip)}
      />

      <label className="ml-2" htmlFor="boolSkip">
        Skip
      </label>

      {error && <div>Error: {error.message}</div>}

      {!data?.[0]?.id && isLoading && <div>Loading ...</div>}

      {data?.[0]?.id && (
        <ol
          className={`list-decimal list-inside ${
            isLoading ? 'opacity-50' : ''
          }`}
        >
          {data.map((character) => (
            <li key={character?.id ?? 0}>{character?.name}</li>
          ))}
        </ol>
      )}
    </main>
  );
}
