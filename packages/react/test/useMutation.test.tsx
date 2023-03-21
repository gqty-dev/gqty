import { act, renderHook } from '@testing-library/react-hooks';
import { createReactTestClient } from './utils';

describe('useMutation', () => {
  it('should mutate without suspense', async () => {
    const { useMutation } = await createReactTestClient();
    const { result, waitFor } = renderHook(() => {
      return useMutation((mutation, { name }: { name: string }) => {
        const human = mutation.humanMutation({ nameArg: name });

        human?.id;
        human?.name;
      });
    });

    await act(() => result.current[0]({ args: { name: 'John Doe' } }));

    await waitFor(() => result.current[1].data !== undefined);

    expect(result.current[1]).toMatchInlineSnapshot(`
      {
        "data": {
          "mutation": {
            "a236d": {
              "__typename": "Human",
              "id": "1",
              "name": "John Doe",
            },
          },
        },
        "error": undefined,
        "isLoading": false,
      }
    `);
  });

  it('should mutate with suspense', async () => {
    const { useMutation } = await createReactTestClient();
    const { result, waitFor } = renderHook(() => {
      return useMutation(
        (mutation, { name }: { name: string }) => {
          const human = mutation.humanMutation({ nameArg: name });

          human?.id;
          human?.name;
        },
        { suspense: true }
      );
    });

    await act(() => result.current[0]({ args: { name: 'Jane Doe' } }));

    await waitFor(() => result.current[1].data !== undefined);

    expect(result.current[1]).toMatchInlineSnapshot(`
      {
        "data": {
          "mutation": {
            "ba497": {
              "__typename": "Human",
              "id": "1",
              "name": "Jane Doe",
            },
          },
        },
        "error": undefined,
        "isLoading": false,
      }
    `);
  });

  it('should update contents of useQuery via normalized cache', async () => {
    const { useQuery, useMutation } = await createReactTestClient();
    const q = renderHook(() => {
      const human = useQuery().human({ name: 'Uno' });

      human.id;
      human.name;

      return human;
    });

    const m = renderHook(() => {
      return useMutation(
        (mutation, args: { name: string; newName: string }) => {
          const human = mutation.renameHuman(args);

          human?.id;
          human?.name;
        }
      );
    });

    await q.waitFor(() => q.result.current.name === 'Uno');

    await act(() =>
      m.result.current[0]({ args: { name: 'Uno', newName: 'Dos' } })
    );

    await q.waitFor(() => q.result.current.name === 'Dos');

    await act(() =>
      m.result.current[0]({ args: { name: 'Dos', newName: 'Tres' } })
    );

    await q.waitFor(() => q.result.current.name === 'Tres');

    await act(() =>
      m.result.current[0]({ args: { name: 'Tres', newName: 'Cuatro' } })
    );

    await q.waitFor(() => q.result.current.name === 'Cuatro');
  });
});
