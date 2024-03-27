import { type CacheDataContainer } from './Cache';
import { type Selection } from './Selection';
import { type Unsubscribe } from './Unsubscribe';

/**
 * Containers that handles selections.
 */
export interface Selectable {
  select(selection: Selection, cache?: CacheDataContainer): boolean | void;

  subscribeSelect(callback: Selectable['select']): Unsubscribe;
}
