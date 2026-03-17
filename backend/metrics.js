const si = require("systeminformation");
const os = require("os");

// Store previous network stats for calculating speed
let prevNetworkStats = null;
let prevNetworkTime = null;
let prevNetworkKey = null;

async function getCpuUsage() {
  const data = await si.currentLoad();
  return {
    usage: data.currentLoad,
    cores: data.cores,
    brand: data.brand,
    speed: data.speed,
  };
}

async function getRamUsage() {
  const data = await si.mem();
  const platform = os.platform();

  let used = data.used;
  let free = data.available || data.free;

  if (platform === "darwin" && data.active > 0) {
    used = data.active;
    free = Math.max(0, data.total - used);
  } else if (data.available > 0) {
    used = data.total - data.available;
    free = data.available;
  }

  const percent = data.total > 0 ? (used / data.total) * 100 : 0;

  return {
    total: data.total,
    used,
    free,
    available: data.available,
    percent: Math.max(0, Math.min(100, percent)),
  };
}

async function getDiskUsage() {
  const data = await si.fsSize();
  const mainDisk = data.find((d) => d.mount === "/") || data[0] || {};
  return {
    total: mainDisk.size || 0,
    used: mainDisk.used || 0,
    free: mainDisk.available || 0,
    percent: mainDisk.use || 0,
    mount: mainDisk.mount || "/",
  };
}

async function getDiskPartitions() {
  const data = await si.fsSize();
  return data.map((d) => ({
    mount: d.mount,
    type: d.type,
    total: d.size,
    used: d.used,
    free: d.available,
    percent: d.use,
  }));
}

async function getNetworkSpeed() {
  const interfaces = await si.networkInterfaces();
  const candidateInterfaces = interfaces.filter(
    (iface) =>
      iface.iface &&
      !iface.internal &&
      !iface.virtual &&
      iface.operstate === "up",
  );

  const selectedInterfaces =
    candidateInterfaces.filter((iface) => iface.default) || [];
  const activeInterfaces =
    selectedInterfaces.length > 0 ? selectedInterfaces : candidateInterfaces;
  const interfaceNames = activeInterfaces.map((iface) => iface.iface);

  if (interfaceNames.length === 0) {
    prevNetworkStats = null;
    prevNetworkTime = null;
    prevNetworkKey = null;

    return {
      rx_bytes: 0,
      tx_bytes: 0,
      speed_rx_bytes: 0,
      speed_tx_bytes: 0,
      primary_interface: null,
      interfaces: [],
    };
  }

  const currentStats = await si.networkStats(interfaceNames.join(","));
  const currentTime = Date.now();
  const statsByName = new Map(
    currentStats.map((stat) => [stat.iface, stat]),
  );
  const networkKey = interfaceNames.slice().sort().join(",");

  const total = interfaceNames.reduce(
    (acc, iface) => {
      const stat = statsByName.get(iface);
      if (!stat) {
        return acc;
      }

      acc.rx_bytes += stat.rx_bytes || 0;
      acc.tx_bytes += stat.tx_bytes || 0;
      return acc;
    },
    { rx_bytes: 0, tx_bytes: 0 },
  );

  let speedRx = 0;
  let speedTx = 0;

  // Calculate speed from cumulative bytes
  if (prevNetworkStats && prevNetworkTime && prevNetworkKey === networkKey) {
    const timeDiff = (currentTime - prevNetworkTime) / 1000; // seconds
    if (timeDiff > 0 && timeDiff < 60) {
      // Ignore if gap too large
      speedRx = Math.max(
        0,
        (total.rx_bytes - prevNetworkStats.rx_bytes) / timeDiff,
      );
      speedTx = Math.max(
        0,
        (total.tx_bytes - prevNetworkStats.tx_bytes) / timeDiff,
      );
    }
  }

  // Fallback: use rx_sec/tx_sec if available from systeminformation
  if (speedRx === 0 && speedTx === 0) {
    const rxSec = currentStats.reduce(
      (acc, iface) => acc + (iface.rx_sec || 0),
      0,
    );
    const txSec = currentStats.reduce(
      (acc, iface) => acc + (iface.tx_sec || 0),
      0,
    );
    if (rxSec > 0 || txSec > 0) {
      speedRx = rxSec;
      speedTx = txSec;
    }
  }

  prevNetworkStats = { ...total };
  prevNetworkTime = currentTime;
  prevNetworkKey = networkKey;

  return {
    rx_bytes: total.rx_bytes,
    tx_bytes: total.tx_bytes,
    speed_rx_bytes: speedRx,
    speed_tx_bytes: speedTx,
    primary_interface: interfaceNames[0] || null,
    interfaces: activeInterfaces.map((iface) => {
      const stat = statsByName.get(iface.iface);
      return {
        name: iface.iface,
        ip4: iface.ip4 || null,
        default: Boolean(iface.default),
        rx_bytes: stat?.rx_bytes || 0,
        tx_bytes: stat?.tx_bytes || 0,
      };
    }),
  };
}

async function getTopRamProcesses(limit = 12) {
  const data = await si.processes();
  const processes = Array.isArray(data.list) ? data.list : [];

  return processes
    .filter((process) => Number.isFinite(process.memRss) || Number.isFinite(process.mem))
    .map((process) => ({
      pid: process.pid,
      name: process.name || process.command || "Unknown",
      command: process.command || "",
      user: process.user || "",
      mem_percent: Number.isFinite(process.mem) ? process.mem : 0,
      mem_bytes: Number.isFinite(process.memRss) ? process.memRss : 0,
      cpu_percent: Number.isFinite(process.pcpu) ? process.pcpu : 0,
    }))
    .sort((a, b) => {
      if (b.mem_bytes !== a.mem_bytes) {
        return b.mem_bytes - a.mem_bytes;
      }
      return b.mem_percent - a.mem_percent;
    })
    .slice(0, limit);
}

async function getAllMetrics() {
  const [cpu, ram, disk, network, partitions] = await Promise.all([
    getCpuUsage(),
    getRamUsage(),
    getDiskUsage(),
    getNetworkSpeed(),
    getDiskPartitions(),
  ]);

  return { cpu, ram, disk, network, partitions };
}

module.exports = {
  getCpuUsage,
  getRamUsage,
  getDiskUsage,
  getNetworkSpeed,
  getTopRamProcesses,
  getAllMetrics,
  getDiskPartitions,
};
