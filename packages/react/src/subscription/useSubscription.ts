import { useRerender, useThrottledCallback } from '../hooks';
import { GQtyError, type BaseGeneratedSchema, type GQtyClient } from 'gqty';
import { useEffect, useMemo, useState } from 'react';

export type UseSubscription<TSchema extends BaseGeneratedSchema> = (
  options?: UseSubscriptionOptions
) => NonNullable<TSchema['subscription']>;

export type UseSubscriptionOptions = {
  onError?: (error: GQtyError) => void;
  operationName?: string;
  /**
   * Throttle delay for each re-redner, prevents busy subscriptions from
   * hanging the UI.
   */
  renderThrottleDelay?: number;
};

export function createUseSubscription<TSchema extends BaseGeneratedSchema>({
  createResolver,
}: GQtyClient<TSchema>) {
  const useSubscription: UseSubscription<TSchema> = ({
    onError,
    operationName,
    renderThrottleDelay = 100,
  } = {}) => {
    const {
      accessor: { subscription },
      subscribe,
      selections,
    } = useMemo(() => createResolver({ operationName }), [operationName]);

    const render = useRerender();
    const throttledRender = useThrottledCallback(
      render,
      [render],
      renderThrottleDelay
    );
    const [error, setError] = useState<GQtyError>();
    if (error) throw error;

    useEffect(() => {
      return subscribe({
        onNext: () => throttledRender(),
        onError(error) {
          const theError = GQtyError.create(error);

          if (onError) {
            onError(theError);
          } else {
            setError(theError);
          }
        },
      });
    }, [onError, selections, selections.size]);

    if (!subscription) {
      throw new GQtyError(`Subscription is not defined in the schema.`);
    }

    return subscription;
  };

  return useSubscription;
}
