# SysMonitor — Local System Information Dashboard

A Next.js web app that runs on your own machine and shows live system information:
- **Dashboard** — CPU load, RAM usage, OS details, GPU, battery
- **Ports & Services** — all listening ports with clickable localhost links
- **Hardware** — detailed CPU, memory, GPU, battery info
- **Processes** — top 50 processes by CPU/memory with live updates
- **Disks** — physical drives and filesystem usage
- **Network** — interfaces, IP/MAC addresses, live bandwidth

No database. No external API. When you open the app on `localhost`, data is read directly from your machine. When you host it on the web, the dashboard and hardware pages fall back to browser-safe device information for the current visitor.

---

## Requirements

- Node.js 18 or later
- npm (comes with Node.js)

---

## Setup & Run

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```

Then open your browser at: **http://localhost:3000**

---

## Notes

- On **Linux/macOS**, some process and port info may require running as root or with elevated permissions to see all processes.
- On **Windows**, the `systeminformation` package works but some fields (like port PIDs) may be limited.
- The dashboard auto-refreshes every 5 seconds. Network page refreshes every 3 seconds.
- Hosted deployments cannot inspect a visitor's real processes, ports, disks, or network interfaces because browsers do not expose that information.
- If you want full machine metrics, open the app directly on `localhost`.
