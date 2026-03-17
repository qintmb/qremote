import { useState, useEffect } from "react";
import { useSocket } from "./hooks/useSocket";
import { CpuCard } from "./components/CpuCard";
import { RamCard } from "./components/RamCard";
import { DiskCard } from "./components/DiskCard";
import { NetworkCard } from "./components/NetworkCard";
import { SpeedTest } from "./components/SpeedTest";
import { DiskPartitions } from "./components/DiskPartitions";
import { formatUptime, getBackendBaseUrl } from "./lib/api";

export default function App() {
  const backendUrl = getBackendBaseUrl();
  const { metrics, connected } = useSocket(backendUrl);
  const [hostname, setHostname] = useState("Loading...");
  const [uptimeSeconds, setUptimeSeconds] = useState(0);

  useEffect(() => {
    const fetchHostInfo = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/info`);
        const data = await response.json();
        setHostname(data.hostname || "Unknown");
        setUptimeSeconds(data.uptime || 0);
      } catch {
        setHostname("Unknown");
      }
    };
    fetchHostInfo();

    const interval = setInterval(() => {
      setUptimeSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [backendUrl]);

  const uptime = formatUptime(uptimeSeconds);

  const uptimeStr = `${uptime.d}d ${String(uptime.h).padStart(2, "0")}h ${String(uptime.m).padStart(2, "0")}m`;

  return (
    <div className="app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          padding: 12px;
        }

        .app {
          max-width: 100%;
          margin: 0 auto;
        }

        /* Header */
        .header {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 14px 16px;
          margin-bottom: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        }

        .header-left h1 {
          font-size: 15px;
          font-weight: 700;
          color: #1a1a2e;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .header-left .uptime {
          font-size: 11px;
          color: #888;
          margin-top: 3px;
          padding-left: 28px;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .live-indicator {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 10px;
          color: #10b981;
          font-weight: 600;
        }

        .live-dot {
          width: 6px;
          height: 6px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }

        .clock {
          font-size: 11px;
          font-weight: 600;
          color: #555;
          background: #f5f5f7;
          padding: 6px 10px;
          border-radius: 6px;
        }

        /* Grid Layout - 2 columns for metric cards */
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-bottom: 12px;
        }

        /* Cards */
        .card {
          background: white;
          border-radius: 12px;
          padding: 14px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
          transition: transform 0.2s;
        }

        .card:active {
          transform: scale(0.98);
        }

        .ram-card-button {
          width: 100%;
          border: 0;
          text-align: left;
          cursor: pointer;
          font: inherit;
        }

        /* Full-width sections */
        .section {
          background: white;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
        }

        /* Card Header */
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 10px;
        }

        .card-icon {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .icon-box {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-box.cpu { background: linear-gradient(135deg, #667eea, #764ba2); }
        .icon-box.ram { background: linear-gradient(135deg, #10b981, #059669); }
        .icon-box.disk { background: linear-gradient(135deg, #f59e0b, #d97706); }
        .icon-box.network { background: linear-gradient(135deg, #3b82f6, #2563eb); }

        .card-label {
          font-size: 10px;
          color: #888;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .card-sublabel {
          font-size: 9px;
          color: #aaa;
          margin-top: 1px;
        }

        .status-badge {
          font-size: 9px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 10px;
        }

        .status-normal { background: #d1fae5; color: #059669; }
        .status-high { background: #fef3c7; color: #d97706; }
        .status-critical { background: #fef2f2; color: #dc2626; }

        /* Value Display */
        .card-value {
          font-size: 22px;
          font-weight: 700;
          color: #1a1a2e;
          margin-bottom: 8px;
        }

        /* Progress Bar */
        .progress-track {
          width: 100%;
          height: 5px;
          background: #f0f0f5;
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .progress-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.5s ease;
        }

        .progress-fill.cpu { background: linear-gradient(90deg, #667eea, #764ba2); }
        .progress-fill.ram { background: linear-gradient(90deg, #10b981, #059669); }
        .progress-fill.disk { background: linear-gradient(90deg, #f59e0b, #d97706); }

        /* Card Footer */
        .card-footer {
          font-size: 9px;
          color: #999;
        }

        /* Network specific */
        .network-value {
          display: flex;
          align-items: baseline;
          gap: 3px;
          margin-bottom: 8px;
        }

        .network-arrow {
          color: #10b981;
          font-weight: 700;
        }

        .network-stats {
          display: flex;
          justify-content: space-between;
          padding-top: 8px;
          border-top: 1px solid #f5f5f7;
          font-size: 9px;
          color: #aaa;
        }

        /* Speed Test */
        .speed-test-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .speed-test-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .speed-test-icon {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .speed-test-text {
          font-size: 13px;
          font-weight: 600;
          color: #666;
        }

        .speed-test-subtext {
          font-size: 10px;
          color: #aaa;
          margin-top: 1px;
        }

        .run-test-btn {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          border: none;
          border-radius: 10px;
          padding: 10px 20px;
          color: white;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .run-test-btn:disabled {
          background: #e0e0e5;
          cursor: not-allowed;
        }

        .speed-results {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-bottom: 12px;
        }

        .speed-gauge {
          text-align: center;
        }

        .speed-gauge-svg {
          width: 70px;
          height: 70px;
          margin: 0 auto 4px;
        }

        .speed-value {
          font-size: 16px;
          font-weight: 700;
          color: #1a1a2e;
        }

        .speed-unit {
          font-size: 8px;
          color: #aaa;
        }

        .speed-ping {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .speed-ping-value {
          font-size: 24px;
          font-weight: 700;
          color: #f59e0b;
        }

        .speed-ping-label {
          font-size: 9px;
          color: #aaa;
          font-weight: 500;
        }

        .speed-server {
          text-align: center;
          font-size: 10px;
          color: #aaa;
        }

        /* Disk Partitions */
        .partitions-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 14px;
        }

        .partitions-icon {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .partitions-title {
          font-size: 13px;
          font-weight: 600;
          color: #1a1a2e;
        }

        .partitions-subtitle {
          font-size: 10px;
          color: #aaa;
          margin-top: 1px;
        }

        .partition-item {
          margin-bottom: 14px;
        }

        .partition-item:last-child {
          margin-bottom: 0;
        }

        .partition-item:not(:last-child) {
          padding-bottom: 14px;
          border-bottom: 1px solid #f5f5f7;
        }

        .partition-name {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 6px;
        }

        .partition-folder {
          width: 14px;
          height: 14px;
        }

        .partition-label {
          font-size: 11px;
          font-weight: 600;
          color: #1a1a2e;
        }

        .partition-type {
          font-size: 9px;
          color: #aaa;
        }

        .partition-percent {
          margin-left: auto;
          font-size: 11px;
          font-weight: 700;
        }

        .partition-bar {
          width: 100%;
          height: 6px;
          background: #f0f0f5;
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 6px;
        }

        .partition-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.5s ease;
        }

        .partition-info {
          font-size: 9px;
          color: #aaa;
          display: flex;
          justify-content: space-between;
        }

        /* Spinner */
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .spinner {
          display: inline-block;
          width: 12px;
          height: 12px;
          border: 2px solid #999;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          z-index: 50;
        }

        .modal-panel {
          width: min(100%, 520px);
          max-height: 80vh;
          overflow: hidden;
          background: white;
          border-radius: 16px;
          box-shadow: 0 16px 48px rgba(15, 23, 42, 0.2);
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          padding: 16px;
          border-bottom: 1px solid #eef2f7;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .modal-title {
          font-size: 16px;
          font-weight: 700;
          color: #1a1a2e;
        }

        .modal-subtitle {
          margin-top: 4px;
          font-size: 12px;
          color: #64748b;
        }

        .modal-close {
          border: 0;
          background: #f1f5f9;
          color: #0f172a;
          width: 32px;
          height: 32px;
          border-radius: 999px;
          font-size: 22px;
          line-height: 1;
          cursor: pointer;
        }

        .modal-body {
          padding: 12px 16px 16px;
          overflow: auto;
        }

        .modal-state {
          padding: 16px 8px;
          text-align: center;
          font-size: 13px;
          color: #64748b;
        }

        .modal-state.error {
          color: #dc2626;
        }

        .process-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .process-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px;
          border-radius: 12px;
          background: #f8fafc;
        }

        .process-main {
          min-width: 0;
        }

        .process-name {
          font-size: 13px;
          font-weight: 700;
          color: #0f172a;
          word-break: break-word;
        }

        .process-meta {
          margin-top: 3px;
          font-size: 11px;
          color: #64748b;
        }

        .process-metrics {
          flex-shrink: 0;
          text-align: right;
          font-size: 12px;
          font-weight: 600;
          color: #0f172a;
        }
      `}</style>

      {/* Header */}
      <header className="header">
        <div className="header-left">
          <h1>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#667eea"
              strokeWidth="2.5"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            {hostname}
          </h1>
          <div className="uptime">⏱ {uptimeStr}</div>
        </div>
        <div className="header-right">
          <div className="live-indicator">
            <span className="live-dot" />
            {connected ? "LIVE" : "OFFLINE"}
          </div>
          <div className="clock">
            {new Date().toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </header>

      {/* Metrics Grid - 2 columns */}
      <div className="metrics-grid">
        <CpuCard cpu={metrics?.cpu} />
        <RamCard ram={metrics?.ram} backendUrl={backendUrl} />
        <DiskCard disk={metrics?.disk} />
        <NetworkCard network={metrics?.network} />
      </div>

      <SpeedTest baseUrl={backendUrl} hostname={hostname} />

      {/* Disk Partitions Section */}
      <DiskPartitions partitions={metrics?.partitions} />
    </div>
  );
}
