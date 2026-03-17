import { useState, useEffect } from "react";

const rand = (min, max) => Math.random() * (max - min) + min;

export function useSimulatedMetrics() {
  const [metrics, setMetrics] = useState({
    cpu: { usage: 49.4, cores: 4, freq: 1512, load: 2.83 },
    ram: { percent: 43.9, used: 0.83, total: 1.88, free: 1.06 },
    disk: { percent: 78.2, used: 5.42, total: 6.95 },
    network: { upload: 1.373, download: 0.037, sent: 1867088, recv: 1805264 },
    uptime: { d: 0, h: 15, m: 53, s: 30 },
    speedtest: { download: 87.6, upload: 2.05, ping: 28.1, ran: true },
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        cpu: {
          ...prev.cpu,
          usage: Math.max(5, Math.min(95, prev.cpu.usage + rand(-3, 3))),
          load: Math.max(0.1, Math.min(4, prev.cpu.load + rand(-0.2, 0.2))),
        },
        ram: {
          ...prev.ram,
          percent: Math.max(20, Math.min(90, prev.ram.percent + rand(-1, 1))),
          used: +(prev.ram.used + rand(-0.02, 0.02)).toFixed(2),
        },
        network: {
          upload: Math.max(0, prev.network.upload + rand(-0.3, 0.5)),
          download: Math.max(0, prev.network.download + rand(-0.02, 0.08)),
          sent: prev.network.sent + Math.floor(rand(1000, 5000)),
          recv: prev.network.recv + Math.floor(rand(500, 3000)),
        },
        uptime: (() => {
          let { d, h, m, s } = prev.uptime;
          s++;
          if (s >= 60) { s = 0; m++; }
          if (m >= 60) { m = 0; h++; }
          if (h >= 24) { h = 0; d++; }
          return { d, h, m, s };
        })(),
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return metrics;
}
