import { Cache } from 'gqty';
import { $meta } from '../src/Accessor/meta';
import { createClient } from '../src/Client';

describe('isFetching', () => {
  it('should populate isFetching state in Meta', async () => {
    let checkIsFetching = false;
    let queryAccessor: any;

    const fetcher = jest.fn(async () => {
      if (checkIsFetching) {
        expect($meta(queryAccessor)?.isFetching).toBe(true);
      }
      await new Promise((resolve) => setTimeout(resolve, 10));
      return { data: { hello: 'world' } };
    });

    const { resolve } = createClient<{ query: { hello: string } }>({
      schema: {
        query: {
          hello: { __type: 'String' },
        },
      },
      scalars: { String: true },
      cache: new Cache(),
      fetchOptions: { fetcher },
    });

    checkIsFetching = true;
    await resolve(({ query }) => {
      queryAccessor = query;
      expect($meta(query)?.isFetching).toBe(false);
      return query.hello;
    });

    expect($meta(queryAccessor)?.isFetching).toBe(false);
  });

  it('should populate isFetching state in Meta for nested objects', async () => {
    let checkIsFetching = false;
    let queryAccessor: any;
    let userAccessor: any;

    const fetcher = jest.fn(async () => {
      if (checkIsFetching) {
        expect($meta(userAccessor)?.isFetching).toBe(true);
        expect($meta(queryAccessor)?.isFetching).toBe(true);
      }
      await new Promise((resolve) => setTimeout(resolve, 10));
      return { data: { user: { name: 'Alice' } } };
    });

    const { resolve } = createClient<{ query: { user: { name: string } } }>({
      schema: {
        query: {
          user: { __type: 'User' },
        },
        User: {
          name: { __type: 'String' },
        },
      },
      scalars: { String: true },
      cache: new Cache(),
      fetchOptions: { fetcher },
    });

    checkIsFetching = true;
    await resolve(({ query }) => {
      queryAccessor = query;
      userAccessor = query.user;

      expect($meta(query)?.isFetching).toBe(false);
      expect($meta(userAccessor)?.isFetching).toBe(false);

      return userAccessor.name;
    });

    expect($meta(userAccessor)?.isFetching).toBe(false);
    expect($meta(queryAccessor)?.isFetching).toBe(false);
  });

  it('should handle concurrent fetches for the same selection', async () => {
    let fetchCount = 0;
    let queryAccessor: any;

    const fetcher = jest.fn(async () => {
      fetchCount++;
      const currentFetch = fetchCount;

      // First fetch takes longer
      const delay = currentFetch === 1 ? 50 : 20;
      await new Promise((resolve) => setTimeout(resolve, delay));

      return { data: { hello: `world${currentFetch}` } };
    });

    const { resolve } = createClient<{ query: { hello: string } }>({
      schema: {
        query: {
          hello: { __type: 'String' },
        },
      },
      scalars: { String: true },
      cache: new Cache(),
      fetchOptions: { fetcher, cachePolicy: 'no-cache' },
    });

    // Start two concurrent resolves
    const promise1 = resolve(({ query }) => {
      queryAccessor = query;
      return query.hello;
    });

    // Small delay to ensure first fetch starts
    await new Promise((resolve) => setTimeout(resolve, 5));

    const promise2 = resolve(({ query }) => {
      // During the second resolve, isFetching should be true from first fetch
      expect($meta(query)?.isFetching).toBe(true);
      return query.hello;
    });

    // Both should be fetching
    expect($meta(queryAccessor)?.isFetching).toBe(true);

    // Wait for second (shorter) fetch to complete
    await promise2;

    // First fetch is still in progress, so isFetching should still be true
    expect($meta(queryAccessor)?.isFetching).toBe(true);

    // Wait for first fetch to complete
    await promise1;

    // Now both are done
    expect($meta(queryAccessor)?.isFetching).toBe(false);
  });

  it('should handle concurrent fetches for different selections', async () => {
    let userFetchStarted = false;
    let postFetchStarted = false;
    let queryAccessor: any;
    let userAccessor: any;
    let postAccessor: any;

    const fetcher = jest.fn(async ({ query }: { query: string }) => {
      if (query.includes('user')) {
        userFetchStarted = true;
        await new Promise((resolve) => setTimeout(resolve, 50));
        return { data: { user: { name: 'Alice' } } };
      } else {
        postFetchStarted = true;
        await new Promise((resolve) => setTimeout(resolve, 20));
        return { data: { post: { title: 'Hello' } } };
      }
    });

    const { resolve } = createClient<{
      query: { user: { name: string }; post: { title: string } };
    }>({
      schema: {
        query: {
          user: { __type: 'User' },
          post: { __type: 'Post' },
        },
        User: { name: { __type: 'String' } },
        Post: { title: { __type: 'String' } },
      },
      scalars: { String: true },
      cache: new Cache(),
      fetchOptions: { fetcher, cachePolicy: 'no-cache' },
    });

    // Start fetch for user
    const userPromise = resolve(({ query }) => {
      queryAccessor = query;
      userAccessor = query.user;
      return query.user.name;
    });

    // Small delay to ensure user fetch starts
    await new Promise((resolve) => setTimeout(resolve, 5));
    expect(userFetchStarted).toBe(true);

    // Start fetch for post
    const postPromise = resolve(({ query }) => {
      postAccessor = query.post;
      return query.post.title;
    });

    // Small delay to ensure post fetch starts
    await new Promise((resolve) => setTimeout(resolve, 5));
    expect(postFetchStarted).toBe(true);

    // Both user and post selections should be fetching
    expect($meta(userAccessor)?.isFetching).toBe(true);
    expect($meta(postAccessor)?.isFetching).toBe(true);
    // Query (parent) should be fetching since children are fetching
    expect($meta(queryAccessor)?.isFetching).toBe(true);

    // Wait for post (shorter) to complete
    await postPromise;

    // Post should no longer be fetching
    expect($meta(postAccessor)?.isFetching).toBe(false);
    // User should still be fetching
    expect($meta(userAccessor)?.isFetching).toBe(true);
    // Query should still be fetching (user is still in progress)
    expect($meta(queryAccessor)?.isFetching).toBe(true);

    // Wait for user to complete
    await userPromise;

    // Now all should be done
    expect($meta(userAccessor)?.isFetching).toBe(false);
    expect($meta(postAccessor)?.isFetching).toBe(false);
    expect($meta(queryAccessor)?.isFetching).toBe(false);
  });

  it('should reset isFetching on fetch error', async () => {
    let shouldError = true;
    let queryAccessor: any;

    const fetcher = jest.fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      if (shouldError) {
        throw new Error('Network error');
      }
      return { data: { hello: 'world' } };
    });

    const { resolve } = createClient<{ query: { hello: string } }>({
      schema: {
        query: {
          hello: { __type: 'String' },
        },
      },
      scalars: { String: true },
      cache: new Cache(),
      fetchOptions: { fetcher, retryPolicy: { maxRetries: 0 } },
    });

    // First attempt - will error
    try {
      await resolve(({ query }) => {
        queryAccessor = query;
        return query.hello;
      });
    } catch {
      // Expected error
    }

    // isFetching should be false even after error
    expect($meta(queryAccessor)?.isFetching).toBe(false);

    // Second attempt - will succeed
    shouldError = false;
    await resolve(({ query }) => query.hello);

    expect($meta(queryAccessor)?.isFetching).toBe(false);
  });

  it('should handle rapid successive fetches correctly', async () => {
    let fetchCount = 0;
    let queryAccessor: any;

    const fetcher = jest.fn(async () => {
      fetchCount++;
      await new Promise((resolve) => setTimeout(resolve, 15));
      return { data: { hello: `world${fetchCount}` } };
    });

    const { resolve } = createClient<{ query: { hello: string } }>({
      schema: {
        query: {
          hello: { __type: 'String' },
        },
      },
      scalars: { String: true },
      cache: new Cache(),
      fetchOptions: { fetcher, cachePolicy: 'no-cache' },
    });

    // Fire multiple rapid fetches
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(
        resolve(({ query }) => {
          queryAccessor = query;
          return query.hello;
        })
      );
      // Stagger slightly to ensure they're truly concurrent
      await new Promise((resolve) => setTimeout(resolve, 2));
    }

    // All fetches should be in progress
    expect($meta(queryAccessor)?.isFetching).toBe(true);

    // Wait for all to complete
    await Promise.all(promises);

    // All should be done now
    expect($meta(queryAccessor)?.isFetching).toBe(false);
  });

  it('should handle nested selections with partial overlap', async () => {
    let queryAccessor: any;
    let userAccessor: any;

    const fetcher = jest.fn(async ({ query }: { query: string }) => {
      if (query.includes('email')) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return {
          data: { user: { name: 'Alice', email: 'alice@example.com' } },
        };
      } else {
        await new Promise((resolve) => setTimeout(resolve, 20));
        return { data: { user: { name: 'Alice' } } };
      }
    });

    const { resolve } = createClient<{
      query: { user: { name: string; email: string } };
    }>({
      schema: {
        query: {
          user: { __type: 'User' },
        },
        User: {
          name: { __type: 'String' },
          email: { __type: 'String' },
        },
      },
      scalars: { String: true },
      cache: new Cache(),
      fetchOptions: { fetcher, cachePolicy: 'no-cache' },
    });

    // First fetch: user.name and user.email (longer)
    const promise1 = resolve(({ query }) => {
      queryAccessor = query;
      userAccessor = query.user;
      return { name: query.user.name, email: query.user.email };
    });

    await new Promise((resolve) => setTimeout(resolve, 5));

    // Second fetch: just user.name (shorter)
    const promise2 = resolve(({ query }) => query.user.name);

    // Both should be fetching
    expect($meta(userAccessor)?.isFetching).toBe(true);
    expect($meta(queryAccessor)?.isFetching).toBe(true);

    // Wait for shorter fetch
    await promise2;

    // First fetch still in progress - shared selections should still be fetching
    expect($meta(userAccessor)?.isFetching).toBe(true);
    expect($meta(queryAccessor)?.isFetching).toBe(true);

    // Wait for longer fetch
    await promise1;

    // Now all done
    expect($meta(userAccessor)?.isFetching).toBe(false);
    expect($meta(queryAccessor)?.isFetching).toBe(false);
  });

  it('should handle interleaved start and completion of fetches', async () => {
    let resolvers: Array<() => void> = [];
    let queryAccessor: any;

    const fetcher = jest.fn(async () => {
      await new Promise<void>((resolve) => {
        resolvers.push(resolve);
      });
      return { data: { hello: 'world' } };
    });

    const { resolve } = createClient<{ query: { hello: string } }>({
      schema: {
        query: {
          hello: { __type: 'String' },
        },
      },
      scalars: { String: true },
      cache: new Cache(),
      fetchOptions: { fetcher, cachePolicy: 'no-cache' },
    });

    // Start first fetch
    const promise1 = resolve(({ query }) => {
      queryAccessor = query;
      return query.hello;
    });
    await new Promise((resolve) => setTimeout(resolve, 5));
    expect($meta(queryAccessor)?.isFetching).toBe(true);
    expect(resolvers.length).toBe(1);

    // Start second fetch
    const promise2 = resolve(({ query }) => query.hello);
    await new Promise((resolve) => setTimeout(resolve, 5));
    expect($meta(queryAccessor)?.isFetching).toBe(true);
    expect(resolvers.length).toBe(2);

    // Start third fetch
    const promise3 = resolve(({ query }) => query.hello);
    await new Promise((resolve) => setTimeout(resolve, 5));
    expect($meta(queryAccessor)?.isFetching).toBe(true);
    expect(resolvers.length).toBe(3);

    // Complete second fetch (out of order)
    resolvers[1]();
    await promise2;
    expect($meta(queryAccessor)?.isFetching).toBe(true); // 1 and 3 still pending

    // Complete first fetch
    resolvers[0]();
    await promise1;
    expect($meta(queryAccessor)?.isFetching).toBe(true); // 3 still pending

    // Complete third fetch
    resolvers[2]();
    await promise3;
    expect($meta(queryAccessor)?.isFetching).toBe(false); // All done
  });
});
