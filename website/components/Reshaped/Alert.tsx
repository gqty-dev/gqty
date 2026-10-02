import {
  type ComponentProps,
  type FunctionComponent,
  type ReactElement,
} from "react";
import { AlertOctagon, AlertTriangle, CheckCircle } from "react-feather";
import { Alert as ReshapedAlert } from "reshaped/bundle";

export type Severity = "error" | "warning" | "info" | "success";

const severityColor: Record<Severity, NonNullable<Props["color"]>> = {
  error: "critical",
  warning: "neutral",
  info: "primary",
  success: "positive",
};

const severityIcons: Record<Severity, ReactElement> = {
  error: <AlertOctagon />,
  warning: <AlertTriangle />,
  info: (
    <span className="inline-block h-5 w-5 cursor-default" aria-hidden="true">
      💡
    </span>
  ),
  success: <CheckCircle />,
};

export type Props = ComponentProps<typeof ReshapedAlert> & {
  severity?: Severity;
};

export const Alert: FunctionComponent<Props> = ({
  severity = "info",
  ...props
}) => {
  return (
    <ReshapedAlert
      icon={severityIcons[severity]}
      color={severityColor[severity]}
      {...props}
    />
  );
};

export default Alert;
