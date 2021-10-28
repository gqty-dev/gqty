// import { renderHook } from '@testing-library/vue';
import { mountComposition, nextTick } from 'vue-composition-test-utils';
// import flushPromises from 'flush-promises';
import { flushPromises } from '@vue/test-utils';

import { sleep, createVueTestClient } from './utils';

test('Basic Non-Suspense', async () => {
  const { useQuery } = await createVueTestClient();

  const { result } = mountComposition(useQuery, {
    component: {
      template: '<span>hello world {{result.current.hello}}</span>',
    },
  });

  console.log(result.current?.query.value.hello);

  expect(result.current?.query.value.hello).toBe(undefined);

  // await waitFor(() => result.current.$state.isLoading === true);
  await flushPromises();

  expect(result.current?.query.value.hello).toBe(undefined);

  // await waitFor(() => result.current.$state.isLoading === false);
  await flushPromises();
  // await sleep(4);

  expect(result.current?.query.value.hello).toBe('hello world');
});

// test('Basic Suspense', async () => {
//   const { useQuery } = await createVueTestClient();
//
//   const { result } = mountComposition(useQuery, {
//     component: {
//       template: 'hello world {{result.current.value.hello}}',
//     }
//   });
//
//   expect(result.current).toBe(undefined);
//
//   await nextTick(()=>{});
//
//   expect(result.current).toBe('hello world');
// });
