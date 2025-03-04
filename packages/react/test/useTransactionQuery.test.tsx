import { render, renderHook, waitFor } from '@testing-library/react';
import { GQtyError } from 'gqty';
import React, { act, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import { createReactTestClient } from './utils';

describe('useTransactionQuery', () => {
  it('should fetch without suspense', async () => {
    const { useTransactionQuery } = await createReactTestClient();

    const { result } = renderHook(() =>
      useTransactionQuery((query) => query.hello, { suspense: false })
    );

    expect(result.current.data).toBeUndefined();
    await waitFor(() => expect(result.current.data).toBe('hello world'));
  });

  it('should fetch with suspense', async () => {
    const { useTransactionQuery } = await createReactTestClient();

    const MyComponent = () => {
      const { data, error } = useTransactionQuery((query) => query.hello, {
        suspense: true,
      });

      return (
        <>
          <div data-testid="error">{error?.message}</div>
          <div data-testid="data">{data}</div>
        </>
      );
    };

    const screen = render(
      <Suspense fallback="Loading...">
        <MyComponent />
      </Suspense>
    );

    await waitFor(() => expect(screen.getByText('Loading...')).toBeDefined());
    await waitFor(() => expect(screen.getByText('hello world')).toBeDefined());

    expect(screen.getByTestId('error').textContent).toBe('');
  });

  it('should handle errors without suspense', async () => {
    const { useTransactionQuery } = await createReactTestClient(
      undefined,
      async () => {
        throw new GQtyError('Network error');
      }
    );
    const onError = jest.fn();

    const { result } = renderHook(() =>
      useTransactionQuery((query) => query.hello, { suspense: false, onError })
    );

    await waitFor(() => {
      // expect(result.current.error).toBeDefined();
      expect(result.current.error?.message).toBe('Network error');
    });
    expect(onError).toHaveBeenCalled();
  });

  it.skip('should handle errors with suspense', async () => {
    const { useTransactionQuery } = await createReactTestClient(
      undefined,
      async () => {
        console.log('fetcher called');
        throw new GQtyError('Network error');
      }
    );
    const onError = jest.fn();

    const MyComponent = () => {
      const { data, error } = useTransactionQuery((query) => query.hello, {
        suspense: true,
        onError,
      });

      return (
        <>
          <div data-testid="error">{error?.message}</div>
          <div data-testid="data">{data}</div>
        </>
      );
    };

    let container: HTMLDivElement | null = null;
    try {
      container = document.createElement('div');
      document.body.appendChild(container);

      act(() => {
        ReactDOM.createRoot(container!).render(
          <ErrorBoundary fallbackRender={({ error }) => error.message}>
            <Suspense fallback="Loading...">
              <MyComponent />
            </Suspense>
          </ErrorBoundary>
        );
      });

      await waitFor(() => expect(container?.innerText).toBe('Network error'));
      // expect(screen.getByTestId('data').textContent).toBe('');
      expect(onError).toHaveBeenCalled();
    } finally {
      if (container) {
        document.body.removeChild(container);
      }
    }
  });

  it('should skip fetching when skip is true', async () => {
    const mockFetch = jest.fn();
    const { useTransactionQuery } = await createReactTestClient(
      undefined,
      async (payload) => {
        mockFetch(payload);
        return {};
      }
    );

    renderHook(() =>
      useTransactionQuery((query) => query.hello, { skip: true })
    );

    await new Promise((r) => setTimeout(r, 100));
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
