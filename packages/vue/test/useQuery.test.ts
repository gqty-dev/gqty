// import { renderHook } from '@testing-library/vue';
// import { mountComposition, nextTick } from 'vue-composition-test-utils';
import { defineComponent, ref } from 'vue';
import { waitFor } from '@testing-library/vue';
import { mount } from 'vue-composable-tester';
// import flushPromises from 'flush-promises';
// import { flushPromises } from '@vue/test-utils';

import { createVueTestClient } from './utils';

// test('Basic Non-Suspense', async () => {
//   const { useQuery } = await createVueTestClient();
//
//   const app = defineComponent({
//     template: `
//       <span>loading: {{ isLoading }}</span>
//       <span>hello world {{ query.hello }}!</span>
//   `,
//     setup() {
//       const { query, isLoading } = useQuery();
//
//       return { query, isLoading };
//     },
//   });
//
//   const renderApp = render(app);
//
//   await waitFor(() => {
//     expect(screen.getByText('loading: true')).toBeInTheDocument();
//   });
//
//   expect(screen.getByText('hello world !')).toBeInTheDocument();
//
//   await waitFor(() => {
//     expect(screen.getByText('loading: false')).toBeInTheDocument();
//   });
//
//   expect(screen.getByText('hello world hello world!')).toBeInTheDocument();
// });

test('Basic Non-Suspense', async () => {
  const { useQuery } = await createVueTestClient();

  const { result } = mount(() => useQuery());

  expect(result.query.value.hello).toBe(undefined);

  await waitFor(() => {
    expect(result.isLoading.value).toBe(true);
  });

  expect(result.query.value.hello).toBe(undefined);

  await waitFor(() => {
    expect(result.isLoading.value).toBe(false);
  });

  expect(result.query.value.hello).toBe('hello world');
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
