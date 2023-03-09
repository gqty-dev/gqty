import { useRerender } from '@react-hookz/web';
import { BaseGeneratedSchema, GQtyClient, GQtyError } from 'gqty';
import { useEffect, useMemo, useState } from 'react';

export type UseSubscription<TSchema extends BaseGeneratedSchema> = (
  options?: UseSubscriptionOptions
) => NonNullable<TSchema['subscription']>;

export type UseSubscriptionOptions = {
  onError?: (error: GQtyError) => void;
  operationName?: string;
};

export function createUseSubscription<TSchema extends BaseGeneratedSchema>({
  createSubscriber,
}: GQtyClient<TSchema>) {
  const useSubscription: UseSubscription<TSchema> = ({
    onError,
    operationName,
  } = {}) => {
    const {
      accessor: { subscription },
      subscribe,
      selections,
    } = useMemo(() => createSubscriber({ operationName }), [operationName]);

    const render = useRerender();
    const [error, setError] = useState<GQtyError>();
    if (error) throw error;

    useEffect(
      () =>
        subscribe({
          onNext: render,
          onError(error) {
            const theError = GQtyError.create(error);

            if (onError) {
              onError(theError);
            } else {
              setError(theError);
            }
          },
        }),
      [onError, selections, selections.size]
    );

    if (!subscription) {
      throw new GQtyError(`Subscription is not defined in the schema.`);
    }

    return subscription;
  };

  return useSubscription;
}
