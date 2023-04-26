import { Suspense } from 'react';
import Character from './Character';
import MyComponent from './MyComponent';

export default function Home() {
  return (
    <main className="p-5 min-h-screen">
      {/* CSR test */}

      <Suspense fallback={<div>Loading...</div>}>
        <MyComponent />
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
