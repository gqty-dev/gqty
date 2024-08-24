import type { Component, JSX, ParentProps } from 'solid-js';

export type Props = ParentProps<{
  fallback?: JSX.Element;
}>;

const Skeleton: Component<Props> = ({ children, fallback }) => {
  return <>{children ?? fallback}</>;
};

export default Skeleton;
