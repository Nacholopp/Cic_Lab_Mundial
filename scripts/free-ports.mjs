import { execSync } from "node:child_process";

const ports = [4000, 5173];

function run(command) {
  try {
    return execSync(command, { stdio: ["ignore", "pipe", "ignore"], encoding: "utf8" });
  } catch {
    return "";
  }
}

function killPortWindows(port) {
  const output = run(`netstat -ano | findstr :${port}`);
  if (!output) return;

  const pids = new Set();
  for (const line of output.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || !trimmed.includes("LISTENING")) continue;
    const parts = trimmed.split(/\s+/);
    const pid = parts[parts.length - 1];
    if (pid && pid !== "0") pids.add(pid);
  }

  for (const pid of pids) {
    run(`taskkill /PID ${pid} /F`);
  }
}

function killPortUnix(port) {
  const pid = run(`lsof -ti tcp:${port}`).trim();
  if (!pid) return;
  run(`kill -9 ${pid}`);
}

for (const port of ports) {
  if (process.platform === "win32") {
    killPortWindows(port);
  } else {
    killPortUnix(port);
  }
}

console.log("Ports released:", ports.join(", "));
