import type { Component, ParentProps } from 'solid-js';
import Skeleton from './Skeleton';

const Text: Component<ParentProps> = (props) => (
  <Skeleton
    fallback={
      <span
        class={`
          inline-block
          animate-pulse
          bg-gray-400
          leading-tight
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
    {props.children}
  </Skeleton>
);

export default Text;
