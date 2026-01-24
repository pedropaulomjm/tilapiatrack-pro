import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Info, AlertTriangle, ChevronRight } from "lucide-react";

export interface ActionableNotificationProps {
  id: string;
  type: "error" | "warning" | "info" | "success";
  title: string;
  message: string;
  actionLabel?: string;
  actionPath?: string;
  actionCallback?: () => void;
  secondaryActionLabel?: string;
  secondaryActionPath?: string;
  secondaryActionCallback?: () => void;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const iconMap = {
  error: <AlertCircle className="h-5 w-5 text-red-600" />,
  warning: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
  info: <Info className="h-5 w-5 text-blue-600" />,
  success: <CheckCircle className="h-5 w-5 text-green-600" />,
};

const bgColorMap = {
  error: "bg-red-50 border-red-200",
  warning: "bg-yellow-50 border-yellow-200",
  info: "bg-blue-50 border-blue-200",
  success: "bg-green-50 border-green-200",
};

const textColorMap = {
  error: "text-red-900",
  warning: "text-yellow-900",
  info: "text-blue-900",
  success: "text-green-900",
};

export function ActionableNotification({
  id,
  type,
  title,
  message,
  actionLabel,
  actionPath,
  actionCallback,
  secondaryActionLabel,
  secondaryActionPath,
  secondaryActionCallback,
  dismissible = true,
  onDismiss,
}: ActionableNotificationProps) {
  const [, navigate] = useLocation();

  const handleAction = () => {
    if (actionCallback) {
      actionCallback();
    } else if (actionPath) {
      navigate(actionPath);
    }
  };

  const handleSecondaryAction = () => {
    if (secondaryActionCallback) {
      secondaryActionCallback();
    } else if (secondaryActionPath) {
      navigate(secondaryActionPath);
    }
  };

  return (
    <Card className={`border ${bgColorMap[type]} p-4 mb-4`}>
      <div className="flex gap-4">
        <div className="flex-shrink-0 pt-0.5">{iconMap[type]}</div>

        <div className="flex-grow">
          <h3 className={`font-semibold ${textColorMap[type]}`}>{title}</h3>
          <p className={`text-sm mt-1 ${textColorMap[type]} opacity-90`}>{message}</p>

          {(actionLabel || secondaryActionLabel) && (
            <div className="flex gap-2 mt-3">
              {actionLabel && (
                <Button
                  size="sm"
                  variant={type === "error" ? "destructive" : "default"}
                  onClick={handleAction}
                  className="gap-1"
                >
                  {actionLabel}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}

              {secondaryActionLabel && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSecondaryAction}
                >
                  {secondaryActionLabel}
                </Button>
              )}
            </div>
          )}
        </div>

        {dismissible && (
          <button
            onClick={onDismiss}
            className={`flex-shrink-0 ${textColorMap[type]} opacity-50 hover:opacity-100`}
          >
            ✕
          </button>
        )}
      </div>
    </Card>
  );
}

export function ActionableNotificationContainer({
  notifications,
  onDismiss,
}: {
  notifications: ActionableNotificationProps[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="fixed top-4 right-4 max-w-md z-50 space-y-2 max-h-96 overflow-y-auto">
      {notifications.map((notification) => (
        <ActionableNotification
          key={notification.id}
          {...notification}
          onDismiss={() => onDismiss(notification.id)}
        />
      ))}
    </div>
  );
}
