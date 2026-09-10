import { message as antdMessage } from "antd";
import { useEffect } from "react";

export default function Feedback({ error, message, durationMs = 6000, onClear }) {
  useEffect(() => {
    if (!error && !message) return;

    if (error) {
      antdMessage.error({
        content: error,
        duration: durationMs / 1000,
        onClose: onClear,
      });
    } else if (message) {
      antdMessage.success({
        content: message,
        duration: durationMs / 1000,
        onClose: onClear,
      });
    }
  }, [error, message, durationMs, onClear]);

  return null;
}
