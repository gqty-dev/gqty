import { FrailMap } from './FrailMap';

export class InfiniteFrailMap<K extends object, V> extends FrailMap<
  K,
  V | InfiniteFrailMap<K, V | InfiniteFrailMap<K, V>>
> {
  get(key: K): V | InfiniteFrailMap<K, V | InfiniteFrailMap<K, V>> {
    const value =
      super.get(key) ?? new InfiniteFrailMap<K, V | InfiniteFrailMap<K, V>>();

    super.set(key, value);

    return value;
  }
}
