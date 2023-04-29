import { type FunctionComponent, type HTMLAttributes } from 'react';

const Card: FunctionComponent<HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div
    className={`p-3 my-3 border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 rounded-xl ${className} flex items-start`}
    {...props}
  />
);

export default Card;
