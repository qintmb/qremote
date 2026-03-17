const DEFAULT_BACKEND_PORT = "3000";

export function getBackendBaseUrl() {
  const envUrl = import.meta.env.VITE_BACKEND_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/+$/, "");
  }

  if (typeof window === "undefined") {
    return `http://localhost:${DEFAULT_BACKEND_PORT}`;
  }

  const { protocol, hostname } = window.location;
  const normalizedProtocol = protocol === "https:" ? "https:" : "http:";
  const normalizedHost = hostname || "localhost";

  return `${normalizedProtocol}//${normalizedHost}:${DEFAULT_BACKEND_PORT}`;
}

export function formatUptime(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds || 0));
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  return { d, h, m, s };
}
