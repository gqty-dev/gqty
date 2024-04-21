import { Suspense, useDeferredValue, useState } from 'react';
import Characters from './App/Characters';
import logo from './logo.svg';

let renderCount = 0;

function App() {
  const [count, setCount] = useState(0);
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);

  return (
    <div className="bg-gray-600 min-h-[100vh]">
      <header className="flex flex-col items-center justify-center py-8 gap-3 text-white">
        <div className="flex items-center justify-center text-3xl">
          <img
            src={logo}
            alt="logo"
            width={48}
            height={48}
            className="animate-spin pointer-events-none select-none"
            style={{ animationDuration: '3s' }}
          />
          <p>Hello Vite + React!</p>
        </div>

        <p className="text-xl">Render count {++renderCount}</p>

        <p>
          <button
            type="button"
            className="text-xl
              rounded bg-gray-100 text-gray-900 px-4 py-2
              hover:bg-gray-200 hover:text-gray-800
              active:bg-gray-300 active:text-gray-700
            "
            onClick={() => setCount((count) => count + 1)}
          >
            You've clicked me {count} times.
          </button>
        </p>

        <p>
          Edit <code>App.tsx</code> and save to test HMR updates.
        </p>
        <p>
          <a
            className="text-blue-400 hover:underline"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
          {' | '}
          <a
            className="text-blue-400 hover:underline"
            href="https://vitejs.dev/guide/features.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Vite Docs
          </a>
        </p>
      </header>

      <div className="container mx-auto text-left">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search for a character..."
          className="w-full p-2 rounded border border-gray-300 text-black"
        />

        <Suspense fallback="Loading ...">
          <Characters
            name={deferredSearch}
            className={search === deferredSearch ? '' : 'animate-pulse'}
          />
        </Suspense>
      </div>
    </div>
  );
}

export default App;
