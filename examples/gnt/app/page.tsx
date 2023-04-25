import { Suspense } from 'react';
import MyComponent from './MyComponent';

export default function Home() {
  return (
    <main className="p-5 min-h-screen">
      <Suspense fallback={<div>Loading...</div>}>
        <MyComponent />
      </Suspense>
    </main>
  );
}
