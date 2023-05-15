'use client';

import { DataTable, Grommet, Layer } from 'grommet';
import { hpe } from 'grommet-theme-hpe';
import { useState, type FunctionComponent } from 'react';
import { useQuery, type Character, type Query } from '~/gqty';
import ChildComponent from './ChildComponent';

const CharacterList: FunctionComponent<{
  query: Query;
  onClick?: (character: Character) => void;
}> = ({ query, onClick }) => (
  <DataTable
    onClickRow={({ datum }) => onClick?.(datum!)}
    data={query.characters({ filter: { name: 'Alien' } })?.results ?? []}
    columns={[
      {
        property: 'id',
        header: 'ID',
        primary: true,
      },
      {
        property: 'name',
        header: 'Name',
      },
    ]}
  />
);

const LocationList: FunctionComponent<{ query: Query }> = ({ query }) => (
  <DataTable
    onClickRow={() => {}}
    data={query.locations()?.results ?? []}
    columns={[
      {
        property: 'id',
        header: 'ID',
        primary: true,
      },
      {
        property: 'name',
        header: 'Name',
      },
    ]}
  />
);

export default function Home() {
  const query = useQuery();
  const [childQuery, setChildQuery] = useState<Query>();

  return (
    <Grommet full theme={hpe}>
      <main className="p-5 min-h-screen">
        <div className="border rounded-xl p-2 m-2">
          <h1 className="text-2xl">Parent</h1>

          <h2>Query using self scope</h2>

          <CharacterList query={query} />

          {childQuery && (
            <Layer position={'top'} onEsc={() => setChildQuery(undefined)}>
              <h2>Query using child scope:</h2>

              <LocationList query={childQuery} />
            </Layer>
          )}
        </div>

        <ChildComponent onBackflow={(query) => setChildQuery(query)} />
      </main>
    </Grommet>
  );
}
