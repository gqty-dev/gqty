'use client';

import { Suspense } from 'react';
import Level1 from './Level1';

export default function NoverbyInfiniteFetch() {
  return (
    <Suspense fallback={<>Loading ...</>}>
      <Level1 />
    </Suspense>
  );
}
