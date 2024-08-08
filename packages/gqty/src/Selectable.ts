import type { CacheDataContainer } from './Cache';
import type { Selection } from './Selection';
import type { Unsubscribe } from './Unsubscribe';

/**
 * Containers that handles selections.
 */
export interface Selectable {
  select(
    selection: Selection,
    /**
     * When no cache container is provided, it currently means virtual
     * selections on null objects or empty arrays where proxies cannot be
     * further created.
     *
     * The selectable context is responsible to restore a meaningful
     * sub-selection tree regarding these selections.
     */
    cache?: CacheDataContainer
  ): boolean | void;

  subscribeSelect(callback: Selectable['select']): Unsubscribe;
}
