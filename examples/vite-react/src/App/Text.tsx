import type { FunctionComponent, PropsWithChildren } from 'react';
import Skeleton from './Skeleton';

export const Text: FunctionComponent<
  PropsWithChildren<{ textLength?: number }>
> = ({ textLength = 25, children }) => (
  <Skeleton
    fallback={
      <span
        className={`
          inline-block
          animate-pulse
          bg-gray-400
          leading-tight
          max-w-[${textLength}ch]
          max-w-prose
          min-w-10
          my-1
          w-full
          rounded-full
        `}
      >
        &nbsp;
      </span>
    }
  >
    {children}
  </Skeleton>
);

export default Text;
