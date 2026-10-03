import {
  type FunctionComponent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { AlertOctagon, AlertTriangle, CheckCircle } from 'react-feather';

export type Severity = 'error' | 'warning' | 'info' | 'success';

const severityIcons: Record<Severity, ReactElement> = {
  error: <AlertOctagon size={20} aria-hidden="true" />,
  warning: <AlertTriangle size={20} aria-hidden="true" />,
  info: (
    <span className="alert__emoji" aria-hidden="true">
      💡
    </span>
  ),
  success: <CheckCircle size={20} aria-hidden="true" />,
};

export type Props = {
  severity?: Severity;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export const Alert: FunctionComponent<Props> = ({
  severity = 'info',
  title,
  children,
  className,
}) => {
  const classes = ['alert', `alert--${severity}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} role="note">
      <span className="alert__icon">{severityIcons[severity]}</span>
      <div className="alert__body">
        {title ? <p className="alert__title">{title}</p> : null}
        <div className="alert__content">{children}</div>
      </div>
    </div>
  );
};

export default Alert;
