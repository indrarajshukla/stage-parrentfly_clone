import React, { createContext, useContext, useState } from "react";
import {
  Alert,
  AlertActionCloseButton,
  AlertProps,
  getUniqueId,
} from "@patternfly/react-core";

export interface NotificationProps {
  title: string;
  srTitle: string;
  variant: "success" | "danger" | "warning" | "info";
  key: React.Key;
  timestamp: string;
  description: string;
  isNotificationRead: boolean;
}

interface NotificationContextProps {
  notifications: NotificationProps[];
  alerts: React.ReactElement<AlertProps>[];
  isDrawerExpanded: boolean;
  addNotification: (variant: NotificationProps["variant"]) => void;
  removeAlert: (key: React.Key) => void;
  setDrawerExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  setAlerts: React.Dispatch<React.SetStateAction<React.ReactElement<AlertProps>[]>>;
  setNotifications: React.Dispatch<React.SetStateAction<NotificationProps[]>>;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(
  undefined
);

const alertTimeout = 8000;

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [alerts, setAlerts] = useState<React.ReactElement<AlertProps>[]>([]);
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);
  const [isDrawerExpanded, setDrawerExpanded] = useState(false);

  const getTimeCreated = () => {
    const dateCreated = new Date();
    return (
      dateCreated.toDateString() +
      " at " +
      ("00" + dateCreated.getHours().toString()).slice(-2) +
      ":" +
      ("00" + dateCreated.getMinutes().toString()).slice(-2)
    );
  };

  const removeAlert = (key: React.Key) => {
    setAlerts((prevAlerts) =>
      prevAlerts.filter((alert) => alert.props.id !== key.toString())
    );
  };

  const addNotification = (variant: NotificationProps["variant"]) => {
    const variantFormatted = variant.charAt(0).toUpperCase() + variant.slice(1);
    const title = variantFormatted + " alert notification";
    const srTitle = variantFormatted + " alert";
    const description = variantFormatted + " alert notification description";
    const key = getUniqueId();
    const timestamp = getTimeCreated();

    setNotifications((prevNotifications) => [
      {
        title,
        srTitle,
        variant,
        key,
        timestamp,
        description,
        isNotificationRead: false,
      },
      ...prevNotifications,
    ]);

    if (!isDrawerExpanded) {
      setAlerts((prevAlerts) => [
        <Alert
          variant={variant}
          title={title}
          timeout={alertTimeout}
          onTimeout={() => removeAlert(key)}
          isLiveRegion
          actionClose={
            <AlertActionCloseButton
              title={title}
              variantLabel={`${variant} alert`}
              onClose={() => removeAlert(key)}
            />
          }
          key={key}
          id={key.toString()}
        >
          <p>{description}</p>
        </Alert>,
        ...prevAlerts,
      ]);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        alerts,
        isDrawerExpanded,
        addNotification,
        removeAlert,
        setDrawerExpanded,
        setAlerts,
        setNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};
