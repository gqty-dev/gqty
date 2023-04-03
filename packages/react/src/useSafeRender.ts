import { useRerender } from '@react-hookz/web';
import { useCallback, useEffect, useRef } from 'react';

/**
 * Triggers a re-render only when outside of a render phase, and at-most once
 * before next render happens.
 */
export const useSafeRender = () => {
  const isCalledRef = useRef(false);

  const isRenderingRef = useRef(true);
  isRenderingRef.current = true;

  useEffect(() => {
    isCalledRef.current = false;
    isRenderingRef.current = false;
  });

  const render = useRerender();

  return useCallback(() => {
    if (isCalledRef.current || isRenderingRef.current) return;
    isCalledRef.current = true;

    render();
  }, [render]);
};
