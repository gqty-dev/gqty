import { ErrorBoundary, Suspense, type Component } from 'solid-js';
import CharactersSearch from '~/components/CsrCharacters';
import Character from './components/SsrCharacter';
import Card from './components/tailwindui/Card';
import logo from './logo.svg';

const App: Component = () => {
  return (
    <>
      <main class="p-5 mx-auto min-h-screen prose prose-headings:mb-2 dark:prose-invert">
        <h1 class="flex gap-2 items-center text-white">
          <img src={logo} class="not-prose" width={48} height={48} alt="logo" />
          Solid Example
        </h1>

        <h2 class="text-white">SSR Example</h2>
        <section class="grid grid-cols-1 md:grid-cols-3 gap-3 not-prose mb-5">
          <Character id="7" />
          <Character id="11" />
          <Character id="12" />
        </section>

        <h2 class="text-white">CSR Example</h2>
        <section class="not-prose mb-5">
          <ErrorBoundary
            fallback={(error) => (
              <Card>
                {error.name ?? 'Error'} {error.message}
              </Card>
            )}
          >
            <Suspense fallback={<div>Loading...</div>}>
              <CharactersSearch />
            </Suspense>
          </ErrorBoundary>
        </section>
      </main>
    </>
  );
};

export default App;
