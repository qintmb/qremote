import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { getBackendBaseUrl } from "../lib/api";

export function useSocket(url = getBackendBaseUrl()) {
  const [socket, setSocket] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const socketInstance = io(url, {
      transports: ["websocket", "polling"],
    });

    socketInstance.on("connect", () => {
      setConnected(true);
      setError(null);
    });

    socketInstance.on("disconnect", () => {
      setConnected(false);
    });

    socketInstance.on("metrics", (data) => {
      setMetrics(data);
    });

    socketInstance.on("error", (err) => {
      setError(err.message);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.close();
    };
  }, [url]);

  return { socket, metrics, connected, error };
}
