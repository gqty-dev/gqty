import type { Component, ParentProps } from 'solid-js';
import Skeleton from './Skeleton';

const SmallText: Component<ParentProps> = ({ children }) => (
  <p class="text-xs text-gray-500 dark:text-gray-400">
    <Skeleton
      fallback={
        <span
          class={`
          inline-block
          animate-pulse
          bg-gray-400
          leading-none
          max-w-prose
          min-w-10
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
  </p>
);

export default SmallText;
