'use client';

import { Suspense } from 'react';
import Level1 from './Level1';
import { useQuery } from './gqty';

const id = '4bac0048-0a2b-4409-84e4-0040caf7909c';
const path = ['radikal_ungdom', 'hb1', 'test'];
const ctxPath = ['radikal_ungdom', 'hb1'];

export default function NoverbyInfiniteFetch() {
  const contextId = useQuery().node({ id })?.contextId;

  return (
    contextId && (
      <Suspense fallback={<>Loading ...</>}>
        <Level1 id={contextId} path={ctxPath} fullpath={path} index={0} />
      </Suspense>
    )
  );
}
