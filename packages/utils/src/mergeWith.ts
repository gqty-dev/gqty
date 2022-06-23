type MergeWithCustomizer = {
  bivariantHack(
    value: any,
    srcValue: any,
    key: string,
    object: any,
    source: any
  ): any;
}['bivariantHack'];

export declare function mergeWith<TObject, TSource>(
  object: TObject,
  source: TSource,
  customizer: MergeWithCustomizer
): TObject & TSource;
/**
 * @see _.mergeWith
 */
export declare function mergeWith<TObject, TSource1, TSource2>(
  object: TObject,
  source1: TSource1,
  source2: TSource2,
  customizer: MergeWithCustomizer
): TObject & TSource1 & TSource2;
/**
 * @see _.mergeWith
 */
export declare function mergeWith<TObject, TSource1, TSource2, TSource3>(
  object: TObject,
  source1: TSource1,
  source2: TSource2,
  source3: TSource3,
  customizer: MergeWithCustomizer
): TObject & TSource1 & TSource2 & TSource3;
/**
 * @see _.mergeWith
 */
export declare function mergeWith<
  TObject,
  TSource1,
  TSource2,
  TSource3,
  TSource4
>(
  object: TObject,
  source1: TSource1,
  source2: TSource2,
  source3: TSource3,
  source4: TSource4,
  customizer: MergeWithCustomizer
): TObject & TSource1 & TSource2 & TSource3 & TSource4;
/**
 * @see _.mergeWith
 */
export declare function mergeWith(object: any, ...otherArgs: any[]): any;
