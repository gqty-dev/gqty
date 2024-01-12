import { memo, type ButtonHTMLAttributes, type FunctionComponent } from 'react';
import { type Accents } from './Accents';
import { type Breakpoints } from './Breakpoints';

export type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'> & {
  accent?: Accents;
  size?: Breakpoints;
  rounded?: boolean;
};

export const Button: FunctionComponent<Props> = ({
  accent = 'primary',
  size = 'md',
  rounded,
  className = '',
  disabled,
  ...props
}) => (
  <button
    type="button"
    disabled={disabled}
    className={`${className}
      cursor-pointer inline-flex items-center border font-medium shadow-sm
      focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
      ${
        accent === 'primary'
          ? `border-transparent bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-500 text-white`
          : accent === 'secondary'
          ? `border-transparent bg-indigo-100 hover:bg-indigo-200 active:bg-indigo-50 text-indigo-700`
          : accent === 'white'
          ? `border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700`
          : ``
      }
      ${
        size === 'xs'
          ? `${
              rounded === undefined
                ? `rounded px-2.5 py-1.5`
                : rounded
                ? `rounded-full p-1`
                : `px-2.5 py-1.5`
            } text-xs`
          : size === 'sm'
          ? `${
              rounded === undefined
                ? `rounded-md px-3 py-2`
                : rounded
                ? `rounded-full p-1.5`
                : `px-3 py-2`
            }  text-sm leading-4`
          : size === 'md'
          ? `${
              rounded === undefined
                ? `rounded-md px-4 py-2`
                : rounded
                ? `rounded-full p-2`
                : `px-4 py-2`
            } text-sm`
          : size === 'lg'
          ? `${
              rounded === undefined
                ? `rounded-md px-4 py-2`
                : rounded
                ? `rounded-full p-2`
                : `px-4 py-2`
            } text-base`
          : size === 'xl'
          ? `${
              rounded === undefined
                ? `rounded-md px-6 py-3`
                : rounded
                ? `rounded-full p-3`
                : `px-6 py-3`
            } text-base`
          : ``
      }`}
    {...props}
  />
);

export default memo(Button);
