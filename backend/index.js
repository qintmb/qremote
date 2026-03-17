const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const metrics = require("./metrics");
const os = require("os");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 3000;
const SPEEDTEST_DOWNLOAD_SIZE = 5 * 1024 * 1024;
const SPEEDTEST_UPLOAD_LIMIT = 2 * 1024 * 1024;

app.get("/", (req, res) => {
  res.json({ status: "QRemote Backend Running" });
});

app.get("/api/metrics", async (req, res) => {
  try {
    const data = await metrics.getAllMetrics();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/processes/memory", async (req, res) => {
  try {
    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), 30)
      : 12;
    const processes = await metrics.getTopRamProcesses(limit);
    res.json({ processes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/info", (req, res) => {
  res.json({
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    cpus: os.cpus().length,
    totalMem: os.totalmem(),
    uptime: os.uptime(),
  });
});

app.head("/api/speedtest/ping", (req, res) => {
  res.status(204).end();
});

app.get("/api/speedtest/download", (req, res) => {
  const requestedSize = Number.parseInt(req.query.bytes, 10);
  const totalBytes = Number.isFinite(requestedSize)
    ? Math.min(Math.max(requestedSize, 64 * 1024), SPEEDTEST_DOWNLOAD_SIZE)
    : SPEEDTEST_DOWNLOAD_SIZE;
  const chunkSize = 64 * 1024;
  const chunk = Buffer.alloc(chunkSize);
  let sent = 0;

  res.setHeader("Content-Type", "application/octet-stream");
  res.setHeader("Content-Length", totalBytes);
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");

  const writeChunk = () => {
    while (sent < totalBytes) {
      const remaining = totalBytes - sent;
      const payload = remaining >= chunkSize ? chunk : chunk.subarray(0, remaining);
      const shouldContinue = res.write(payload);
      sent += payload.length;

      if (!shouldContinue) {
        res.once("drain", writeChunk);
        return;
      }
    }

    res.end();
  };

  writeChunk();
});

app.post("/api/speedtest/upload", (req, res) => {
  let received = 0;
  let aborted = false;

  req.on("data", (chunk) => {
    if (aborted) {
      return;
    }

    received += chunk.length;
    if (received > SPEEDTEST_UPLOAD_LIMIT) {
      aborted = true;
      res.status(413).json({ error: "Payload too large" });
      req.destroy();
    }
  });

  req.on("end", () => {
    if (aborted) {
      return;
    }

    res.json({ received });
  });

  req.on("error", () => {
    if (!res.headersSent) {
      res.status(400).json({ error: "Upload failed" });
    }
  });
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  const sendMetrics = async () => {
    try {
      const data = await metrics.getAllMetrics();
      socket.emit("metrics", data);
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  };

  sendMetrics();
  const interval = setInterval(sendMetrics, 2000);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    clearInterval(interval);
  });
});

server.listen(PORT, () => {
  console.log(`QRemote Backend running on port ${PORT}`);
});
