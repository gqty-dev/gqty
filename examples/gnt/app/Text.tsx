import { FunctionComponent } from 'react';
import Skeleton from './Skeleton';

const Text: FunctionComponent<{ textLength?: number }> = ({
  textLength = 25,
  children,
}) => (
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
