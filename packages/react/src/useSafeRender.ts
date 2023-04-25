import { useRerender } from '@react-hookz/web';
import { useCallback, useEffect, useRef } from 'react';
import { useIsRendering } from './useIsRendering';

/**
 * Triggers a re-render only when outside of a render phase, and at-most once
 * before next render happens.
 */
export const useSafeRender = () => {
  const isCalledRef = useRef(false);

  useEffect(() => {
    isCalledRef.current = false;
  });

  const render = useRerender();
  const isRendering = useIsRendering();

  return useCallback(() => {
    if (isCalledRef.current || isRendering()) return;
    isCalledRef.current = true;

    render();
  }, [render]);
};
