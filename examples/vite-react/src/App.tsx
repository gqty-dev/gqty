import { useState } from 'react';
import './App.css';
import Avatar from './App/Avatar';
import Card from './App/Card';
import SmallText from './App/SmallText';
import { Text } from './App/Text';
import { useQuery } from './gqty';
import logo from './logo.svg';

let renderCount = 0;

function App() {
  const [count, setCount] = useState(0);
  const { characters } = useQuery();

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Hello Vite + React!</p>

        <p>Render count {++renderCount}</p>

        <p>
          <button
            type="button"
            className="
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
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
          {' | '}
          <a
            className="App-link"
            href="https://vitejs.dev/guide/features.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Vite Docs
          </a>
        </p>

        <div className="container text-left">
          {characters({ filter: { name: 'alien' } })?.results?.map(
            (character) => (
              <Card key={character?.id ?? '0'}>
                <Avatar character={character} />

                <div className="flex-1 text-black">
                  <Text>{character?.name}</Text>
                  <SmallText>{character?.species}</SmallText>
                  <SmallText>{character?.origin?.name}</SmallText>
                </div>
              </Card>
            )
          )}
        </div>
      </header>
    </div>
  );
}

export default App;
