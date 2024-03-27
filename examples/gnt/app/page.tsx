import { Suspense } from 'react';
import CharacterSearch from './components/CscCharacterSearch';
import CharactersSearch from './components/CscCharactersSearch';
import Character from './components/RscCharacter';

CharacterSearch;
CharactersSearch;

export default function Home() {
  return (
    <main className="p-5 min-h-screen">
      {/* CSR test */}

      <Suspense fallback={<div>Loading...</div>}>
        <CharactersSearch />
      </Suspense>

      {/* RSC test */}

      {/* @ts-expect-error */}
      <Character id="1" />
      {/* @ts-expect-error */}
      <Character id="2" />
      {/* @ts-expect-error */}
      <Character id="3" />
    </main>
  );
}
