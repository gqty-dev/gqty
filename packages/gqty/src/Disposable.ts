import { type Unsubscribe } from './Unsubscribe';

/**
 * Objects that can be manually disposed, disposed objects simply opens up
 * itself for GC.
 *
 * Subscribers of the dispose function are supposed to release all references to
 * the object when notified.
 */
export interface Disposable {
  /**
   * Notifying subscribers about the intended dispoal of this object,
   * subscribers are responsible to remove any references and release any
   * resources.
   */
  dispose(): void;

  subscribeDispose(callback: () => void): Unsubscribe;
}
