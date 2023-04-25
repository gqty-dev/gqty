import { useCallback, useEffect, useRef } from 'react';

/**
 * Returns a stable getter of a boolean value that indicates if the component is
 * currently rendering.
 */
export const useIsRendering = () => {
  const isRenderingRef = useRef(true);
  isRenderingRef.current = true;

  useEffect(() => {
    isRenderingRef.current = false;
  });

  return useCallback(() => isRenderingRef.current, []);
};
