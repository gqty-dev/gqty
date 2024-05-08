import type { Component, JSX } from 'solid-js';

const Card: Component<JSX.HTMLAttributes<HTMLDivElement>> = ({
  class: classProp,
  ...props
}) => (
  <div
    class={`p-3 border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 rounded-xl ${classProp} flex items-start`}
    {...props}
  />
);

export default Card;
