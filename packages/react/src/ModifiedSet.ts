/** A Set that tracks the last added value. */
export default class ModifiedSet<T> extends Set<T> {
  #lastAdded: T | undefined;

  add(value: T): this {
    if (!super.has(value)) {
      this.#lastAdded = value;
    }

    return super.add(value);
  }

  clear(): void {
    this.#lastAdded = undefined;

    return super.clear();
  }

  /**
   * Only changes when the last call to `.add()` is a new value had not been
   * added yet.
   */
  get lastAdded() {
    return this.#lastAdded;
  }
}
