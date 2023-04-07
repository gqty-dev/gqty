import { FunctionComponent, ReactNode } from 'react';

export type Props = {
  fallback?: ReactNode;
};

const Skeleton: FunctionComponent<Props> = ({ children, fallback }) => {
  return <>{children ?? fallback}</>;
};

export default Skeleton;
