import { useRouter } from "expo-router";
import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { apiBase } from "../utils/apiBase";

interface InsightNotificationData {
  message: string;
  dimension: string;
  visible: boolean;
}

interface InsightStreamContextData {
  notification: InsightNotificationData;
  userId: string | null;
  handleNotificationPress: () => void;
  handleNotificationDismiss: () => void;
  connectStream: () => Promise<void>;
  disconnectStream: () => void;
  setUserIdFromApp: (uid: string | null) => void;
}

const InsightStreamContext = createContext<InsightStreamContextData | undefined>(
  undefined
);

export const InsightStreamProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notification, setNotification] = useState<InsightNotificationData>({
    message: "",
    dimension: "",
    visible: false,
  });
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const abortRef = useRef<AbortController | null>(null);

  const setupStream = useCallback(async () => {
    // Abort any existing connection
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const streamUrl = `${apiBase()}/v1/insights/stream`;
      const res = await fetch(streamUrl, {
        headers: { Accept: "text/event-stream" },
        credentials: "include",
        signal: controller.signal,
      });

      if (!res.body) return;

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      const processStream = async () => {
        while (!controller.signal.aborted) {
          try {
            const { value, done } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            let idx;
            while ((idx = buffer.indexOf("\n\n")) !== -1) {
              const rawEvent = buffer.slice(0, idx);
              buffer = buffer.slice(idx + 2);

              let eventName = "";
              for (const line of rawEvent.split("\n")) {
                if (line.startsWith("event:")) {
                  eventName = line.slice(6).trim();
                }
              }

              if (eventName && !notification.visible) {
                const message = `New insight for ${eventName}`;
                setNotification({
                  message,
                  dimension: eventName,
                  visible: true,
                });
              }
            }
          } catch (error) {
            if (!controller.signal.aborted) {
              console.error("Error reading from stream:", error);
            }
            break;
          }
        }
      };

      processStream();
    } catch (error) {
      if (!controller.signal.aborted) {
        console.error("Error setting up insight stream:", error);
      }
    }
  }, [notification.visible]);
  // Allow app layer to set the known uid (from Welcome/Settings flows)
  const setUserIdFromApp = useCallback((uid: string | null) => {
    setUserId(uid);
  }, []);

  // Controls for the SSE connection managed by the app layer
  const connectStream = useCallback(async () => {
    await setupStream();
  }, [setupStream]);

  const disconnectStream = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  }, []);
  const handleNotificationPress = () => {
    router.push("/(tabs)/insights");
    setNotification((prev) => ({ ...prev, visible: false }));
  };

  const handleNotificationDismiss = () => {
    setNotification((prev) => ({ ...prev, visible: false }));
  };

  return (
    <InsightStreamContext.Provider
      value={{
        notification,
        userId,
        handleNotificationPress,
        handleNotificationDismiss,
        connectStream,
        disconnectStream,
        setUserIdFromApp,
      }}
    >
      {children}
    </InsightStreamContext.Provider>
  );
};

export const useInsightStream = (): InsightStreamContextData => {
  const context = useContext(InsightStreamContext);
  if (context === undefined) {
    throw new Error(
      "useInsightStream must be used within an InsightStreamProvider"
    );
  }
  return context;
};
