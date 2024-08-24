import { ErrorBoundary, type Component } from 'solid-js';
import Characters from '~/components/Characters';
import Character from './components/Character';
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

        <section class="grid grid-cols-1 md:grid-cols-3 gap-3 not-prose mb-5">
          <Character id="7" />
          <Character id="11" />
          <Character id="12" />
        </section>

        <section class="not-prose mb-5">
          <ErrorBoundary
            fallback={(error) => (
              <Card>
                {error.name ?? 'Error'} {error.message}
              </Card>
            )}
          >
            <Characters />
          </ErrorBoundary>
        </section>
      </main>
    </>
  );
};

export default App;
