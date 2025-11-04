import fs from "fs";
import { dbConnectionStatus } from "../config/db.js";

const DOWNTIME_FILE = "./downtime.json";
let lastRestart = Date.now();
let lastShutdown = null;

// Load last shutdown time
try {
  if (fs.existsSync(DOWNTIME_FILE)) {
    const data = JSON.parse(fs.readFileSync(DOWNTIME_FILE, "utf8"));
    lastShutdown = data.lastShutdown;
  }
} catch (err) {
  console.warn("⚠️ Could not read downtime file:", err.message);
}

// Save shutdown time on exit
process.on("exit", () => {
  fs.writeFileSync(DOWNTIME_FILE, JSON.stringify({ lastShutdown: Date.now() }));
});

// 🧠 Helper function to format seconds to days/hours/minutes/seconds
function formatDuration(seconds) {
  const days = Math.floor(seconds / (24 * 3600));
  seconds %= 24 * 3600;
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  seconds = Math.floor(seconds % 60);

  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  if (seconds || parts.length === 0) parts.push(`${seconds}s`);
  return parts.join(" ");
}

export const ping = (req, res) => {
  try {
    const now = Date.now();
    const uptimeSeconds = Math.floor(process.uptime());
    const downtimeSeconds = lastShutdown
      ? Math.floor((lastRestart - lastShutdown) / 1000)
      : 0;

    res.status(200).json({
      ok: true,
      db: dbConnectionStatus, // Placeholder: Replace with actual DB health check if needed
      message: "😊 Ping successful",
      uptime: formatDuration(uptimeSeconds),
      downtime: formatDuration(downtimeSeconds),
      lastRestart: new Date(lastRestart).toISOString(),
      lastShutdown: lastShutdown ? new Date(lastShutdown).toISOString() : "N/A",
      timestamp: now
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Can't ping server or Internal Server Error",
      error: error.message
    });
  }
};
