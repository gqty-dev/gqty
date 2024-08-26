import type { Component, JSX, ParentProps } from 'solid-js';

export type Props = ParentProps<{
  fallback?: JSX.Element;
}>;

const Skeleton: Component<Props> = (props) => {
  return <>{props.children ?? props.fallback}</>;
};

export default Skeleton;
