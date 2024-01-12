import {
  type FunctionComponent,
  type PropsWithChildren,
  type ReactNode,
} from 'react';

export type Props = PropsWithChildren<{
  fallback?: ReactNode;
}>;

const Skeleton: FunctionComponent<Props> = ({ children, fallback }) => {
  return <>{children ?? fallback}</>;
};

export default Skeleton;
