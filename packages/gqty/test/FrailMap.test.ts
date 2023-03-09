import { randomUUID } from 'crypto';
import { FrailMap } from '../src/Helpers/FrailMap';

jest.setTimeout(1_000_000);

describe('FrailMap', () => {
  it('should triggers garbage collection', async () => {
    const keys: string[] = [];
    const map = new FrailMap<string, Record<string, string>>();

    for (let i = 0; i < 100_000; i++) {
      const key = randomUUID();
      const value: Record<string, string> = {
        [randomUUID()]: randomUUID(),
        [randomUUID()]: randomUUID(),
        [randomUUID()]: randomUUID(),
        [randomUUID()]: randomUUID(),
        [randomUUID()]: randomUUID(),
        [randomUUID()]: randomUUID(),
        [randomUUID()]: randomUUID(),
        [randomUUID()]: randomUUID(),
        [randomUUID()]: randomUUID(),
        [randomUUID()]: randomUUID(),
        [randomUUID()]: randomUUID(),
      };

      map.set(key, value);

      keys.push(key);

      // Give it some time for GC to happen.
      if (i % 500 === 0) {
        await new Promise((r) => setTimeout(r, 100));
      }

      // Trigger keys disposal
      map.keys();

      if (map.size < keys.length) {
        break;
      }
    }

    expect(map.size).toBeLessThan(keys.length);
  });
});
