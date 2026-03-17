import { useState } from "react";

const DOWNLOAD_TEST_BYTES = 5 * 1024 * 1024;
const UPLOAD_TEST_BYTES = 1 * 1024 * 1024;

function toMbps(bytes, durationMs) {
  if (!bytes || !durationMs || durationMs <= 0) {
    return 0;
  }

  return (bytes * 8) / (durationMs / 1000) / (1024 * 1024);
}

async function measurePing(baseUrl, attempts = 3) {
  const samples = [];

  for (let i = 0; i < attempts; i += 1) {
    const startedAt = performance.now();
    await fetch(`${baseUrl}/api/speedtest/ping?t=${Date.now()}-${i}`, {
      method: "HEAD",
      cache: "no-store",
    });
    samples.push(performance.now() - startedAt);
  }

  const total = samples.reduce((sum, sample) => sum + sample, 0);
  return total / samples.length;
}

async function measureDownload(baseUrl) {
  const startedAt = performance.now();
  const response = await fetch(
    `${baseUrl}/api/speedtest/download?bytes=${DOWNLOAD_TEST_BYTES}&t=${Date.now()}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok || !response.body) {
    throw new Error("Download test failed");
  }

  const reader = response.body.getReader();
  let bytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    bytes += value.length;
  }

  const durationMs = performance.now() - startedAt;
  return toMbps(bytes, durationMs);
}

async function measureUpload(baseUrl) {
  const payload = new Uint8Array(UPLOAD_TEST_BYTES);
  crypto.getRandomValues(payload.subarray(0, Math.min(payload.length, 65536)));

  const startedAt = performance.now();
  const response = await fetch(`${baseUrl}/api/speedtest/upload?t=${Date.now()}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
      "Cache-Control": "no-store",
    },
    body: payload,
  });

  if (!response.ok) {
    throw new Error("Upload test failed");
  }

  const result = await response.json();
  const durationMs = performance.now() - startedAt;
  return toMbps(result.received || payload.length, durationMs);
}

export function SpeedTest({ baseUrl, hostname }) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState({ download: 0, upload: 0, ping: 0 });
  const [error, setError] = useState("");

  const runTest = async () => {
    setRunning(true);
    setError("");

    try {
      const ping = await measurePing(baseUrl);
      const download = await measureDownload(baseUrl);
      const upload = await measureUpload(baseUrl);

      setResult({
        download: +download.toFixed(1),
        upload: +upload.toFixed(2),
        ping: +ping.toFixed(1),
      });
    } catch (err) {
      setError(err.message || "Speed test failed");
    } finally {
      setRunning(false);
    }
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const circumference = 2 * Math.PI * 28;

  return (
    <div className="section">
      <div className="speed-test-header">
        <div className="speed-test-title">
          <div className="speed-test-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <div>
            <div className="speed-test-text">SPEED TEST</div>
            <div className="speed-test-subtext">Client to host link measurement</div>
          </div>
        </div>
        <button onClick={runTest} disabled={running} className="run-test-btn">
          {running ? (
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span className="spinner" />
              TESTING
            </span>
          ) : (
            "Run Test"
          )}
        </button>
      </div>

      <div className="speed-results">
        <div className="speed-gauge">
          <svg className="speed-gauge-svg" viewBox="0 0 70 70">
            <circle
              cx="35"
              cy="35"
              r="28"
              fill="none"
              stroke="#f0f0f5"
              strokeWidth="6"
            />
            <circle
              cx="35"
              cy="35"
              r="28"
              fill="none"
              stroke="#10b981"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${Math.min(result.upload / 50, 1) * circumference} ${circumference}`}
              transform="rotate(-90 35 35)"
              style={{ transition: "stroke-dasharray 0.5s ease" }}
            />
            {/* Upload Icon */}
            <g transform="translate(35, 18)">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 19V5" />
                <path d="M5 12l7-7 7 7" />
              </svg>
            </g>
          </svg>
          <div className="speed-value">
            {running ? "—" : result.upload.toFixed(2)}
          </div>
          <div className="speed-unit">Mbps</div>
        </div>

        <div className="speed-ping">
          <div className="speed-ping-value">
            {running ? "—" : result.ping.toFixed(1)}
          </div>
          <div className="speed-ping-label">PING ms</div>
        </div>

        <div className="speed-gauge">
          <svg className="speed-gauge-svg" viewBox="0 0 70 70">
            <circle
              cx="35"
              cy="35"
              r="28"
              fill="none"
              stroke="#f0f0f5"
              strokeWidth="6"
            />
            <circle
              cx="35"
              cy="35"
              r="28"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${Math.min(result.download / 150, 1) * circumference} ${circumference}`}
              transform="rotate(-90 35 35)"
              style={{ transition: "stroke-dasharray 0.5s ease" }}
            />
            {/* Download Icon */}
            <g transform="translate(35, 18)">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14" />
                <path d="M19 12l-7 7-7-7" />
              </svg>
            </g>
          </svg>
          <div className="speed-value">
            {running ? "—" : result.download.toFixed(1)}
          </div>
          <div className="speed-unit">Mbps</div>
        </div>
      </div>

      <div className="speed-server">
        Host: {hostname || "Unknown"} · {dateStr} {timeStr}
      </div>
      {error ? (
        <div
          style={{
            marginTop: 10,
            fontSize: 11,
            color: "#dc2626",
          }}
        >
          {error}
        </div>
      ) : null}
    </div>
  );
}
