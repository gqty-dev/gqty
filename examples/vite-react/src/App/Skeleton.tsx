import {
  type FunctionComponent,
  type PropsWithChildren,
  type ReactNode,
} from 'react';
import { useMetaState } from '../gqty';

export type Props = { fallback?: ReactNode };

const Skeleton: FunctionComponent<PropsWithChildren<Props>> = ({
  children,
  fallback,
}) => {
  const { isFetching } = useMetaState();

  return <>{children ?? fallback}</>;
};

export default Skeleton;
