import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';
import { createReactTestClient } from './utils';

describe('useMutation', () => {
  it('should mutate without suspense', async () => {
    const { useMutation } = await createReactTestClient();
    const { result } = renderHook(() => {
      return useMutation((mutation, { name }: { name: string }) => {
        const human = mutation.humanMutation({ nameArg: name });

        return {
          id: human.id,
          name: human.name,
        };
      });
    });

    await act(() => result.current[0]({ args: { name: 'John Doe' } }));

    await waitFor(() => expect(result.current[1].data).toBeDefined());

    expect(result.current[1]).toMatchInlineSnapshot(`
      {
        "data": {
          "id": "1",
          "name": "John Doe",
        },
        "error": undefined,
        "isLoading": false,
      }
    `);
  });

  it('should mutate with suspense', async () => {
    const { useMutation } = await createReactTestClient();
    const { result } = renderHook(() => {
      return useMutation(
        (mutation, { name }: { name: string }) => {
          const human = mutation.humanMutation({ nameArg: name });

          return {
            id: human.id,
            name: human.name,
          };
        },
        { suspense: true }
      );
    });

    await act(() => result.current[0]({ args: { name: 'Jane Doe' } }));

    await waitFor(() => expect(result.current[1].data).toBeDefined());

    expect(result.current[1]).toMatchInlineSnapshot(`
      {
        "data": {
          "id": "1",
          "name": "Jane Doe",
        },
        "error": undefined,
        "isLoading": false,
      }
    `);
  });

  it('should update contents of useQuery via normalized cache', async () => {
    const { useQuery, useMutation } = await createReactTestClient();
    const { result: q } = renderHook(() => {
      const human = useQuery().human({ name: 'Uno' });

      return {
        id: human.id,
        name: human.name,
      };
    });

    const { result: m } = renderHook(() => {
      return useMutation(
        (mutation, args: { name: string; newName: string }) => {
          const human = mutation.renameHuman(args);

          return {
            id: human.id,
            name: human.name,
          };
        }
      );
    });

    await waitFor(() => expect(q.current.name).toStrictEqual('Uno'));

    await act(() => m.current[0]({ args: { name: 'Uno', newName: 'Dos' } }));

    await waitFor(() => expect(q.current.name).toStrictEqual('Dos'));

    await act(() => m.current[0]({ args: { name: 'Dos', newName: 'Tres' } }));

    await waitFor(() => expect(q.current.name).toStrictEqual('Tres'));

    await act(() =>
      m.current[0]({ args: { name: 'Tres', newName: 'Cuatro' } })
    );

    await waitFor(() => expect(q.current.name).toStrictEqual('Cuatro'));
  });
});
