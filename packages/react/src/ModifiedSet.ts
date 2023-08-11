export default class ModifiedSet<T> extends Set<T> {
  #lastInserted: T | undefined;

  add(value: T): this {
    if (!super.has(value)) {
      this.#lastInserted = value;
    }

    return super.add(value);
  }

  clear(): void {
    this.#lastInserted = undefined;

    return super.clear();
  }

  get lastInserted() {
    return this.#lastInserted;
  }
}
