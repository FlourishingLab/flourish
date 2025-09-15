import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { apiBase } from "../utils/apiBase";

interface InsightNotificationData {
  message: string;
  dimension: string;
  visible: boolean;
}

export const useInsightStream = () => {
  const [notification, setNotification] = useState<InsightNotificationData>({
    message: "",
    dimension: "",
    visible: false,
  });
  const router = useRouter();
  const abortRef = useRef<AbortController | null>(null);
  const isSetupRef = useRef<boolean>(false);

  useEffect(() => {
    // Only set up once for the lifetime of this provider/component
    if (isSetupRef.current) return;
    isSetupRef.current = true;

    let isActive = true;

    const setupStream = async () => {
      try {
        if (!isActive) return;

        const streamUrl = `${apiBase()}/v1/insights/stream`;
        const controller = new AbortController();
        abortRef.current = controller;

        const res = await fetch(streamUrl, {
          headers: { Accept: "text/event-stream" },
          credentials: "include",
          signal: controller.signal,
        });
        if (!res.body) return;

        const reader = res.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";

        while (isActive) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          // Process complete SSE events separated by blank line
          let idx;
          while ((idx = buffer.indexOf("\n\n")) !== -1) {
            const rawEvent = buffer.slice(0, idx);
            buffer = buffer.slice(idx + 2);

            let dimension = "";
            const dataLines: string[] = [];
            const commentLines: string[] = [];
            for (const line of rawEvent.split("\n")) {
              if (line.startsWith(":")) {
                commentLines.push(line.slice(1).trim());
                continue;
              }
              if (line.startsWith("event:")) {
                dimension = line.slice(6).trim();
              }
            }

            // const dataStr = dataLines.join("\n");
            // let parsed: any = null;
            // if (dataStr) {
            //   try {
            //     parsed = JSON.parse(dataStr);
            //   } catch {
            //     // not JSON, keep as string
            //   }
            // }

            // Only show a notification when a named event (dimension) is present
            if (!dimension) {
              continue;
            }
            const message = `New insight for ${dimension}`;
            setNotification({ message, dimension, visible: true });
          }
        }
      } catch (error) {
        console.error("Error setting up insight stream:", error);
      }
    };

    setupStream();

    return () => {
      isActive = false;
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
      isSetupRef.current = false;
    };
  }, []);

  const handleNotificationPress = () => {
    router.push("/(tabs)/insights");
    setNotification((prev) => ({ ...prev, visible: false }));
  };

  const handleNotificationDismiss = () => {
    setNotification((prev) => ({ ...prev, visible: false }));
  };

  return {
    notification,
    handleNotificationPress,
    handleNotificationDismiss,
  };
};
