'use client';

import { useState } from 'react';
import { useQuery, type Query } from '~/gqty';
import ChildComponent from './ChildComponent';

export default function Home() {
  const query = useQuery();
  const [childQuery, setChildQuery] = useState<Query>();

  return (
    <main className="p-5 min-h-screen">
      <h1 className="text-2xl">Parent</h1>

      <p>Query using self: {query.character({ id: '1' })?.name}</p>

      {childQuery ? (
        <p>Query using child: {childQuery?.character({ id: '2' })?.name}</p>
      ) : (
        <p>Waiting child to pass query upwards...</p>
      )}

      <ChildComponent onBackflow={(query) => setChildQuery(query)} />
    </main>
  );
}
