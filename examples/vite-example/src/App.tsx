import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { useQuery } from './gqty';

function App() {
  const [count, setCount] = useState(0);

  const { hello, namesList } = useQuery();

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>{hello}</p>
        <ol>
          {namesList({
            n: count,
          }).map((value, index) => {
            return <li key={index}>{value}</li>;
          })}
        </ol>
        <p>Hello Vite + React!</p>
        <p>
          <button type="button" onClick={() => setCount((count) => count + 1)}>
            count is: {count}
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
      </header>
    </div>
  );
}

export default App;
