#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
report_dir="$PWD/browser-report"
mkdir -p "$report_dir"
export AGENT_BROWSER_SESSION="roofing-check-$$"
server_pid=''
cleanup() {
  agent-browser close >/dev/null 2>&1 || true
  if [ -n "$server_pid" ]; then kill "$server_pid" 2>/dev/null || true; fi
}
trap cleanup EXIT
if curl -fsS --max-time 1 http://127.0.0.1:43187/ >/dev/null 2>&1; then
  echo 'Port 43187 is already in use; stop that server before retrying.' >&2
  exit 1
fi
pnpm exec vite dev --host 127.0.0.1 --port 43187 --strictPort >"$report_dir/server.log" 2>&1 &
server_pid=$!
ready=false
for attempt in {1..60}; do
  if curl -fsS --max-time 2 http://127.0.0.1:43187/ >/dev/null 2>&1; then ready=true; break; fi
  if ! kill -0 "$server_pid" 2>/dev/null; then cat "$report_dir/server.log"; exit 1; fi
  sleep 1
done
if [ "$ready" != true ]; then cat "$report_dir/server.log"; exit 1; fi
agent-browser open http://127.0.0.1:43187/
agent-browser set viewport 1440 1000
agent-browser snapshot >"$report_dir/home-desktop.txt"
agent-browser screenshot --full "$report_dir/home-desktop.png"
agent-browser a11y --json >"$report_dir/home-accessibility.json" || true
agent-browser set viewport 390 844
agent-browser screenshot --full "$report_dir/home-mobile.png"
agent-browser open http://127.0.0.1:43187/checkout
agent-browser set viewport 1440 1000
agent-browser snapshot >"$report_dir/checkout-desktop.txt"
agent-browser screenshot --full "$report_dir/checkout-desktop.png"
agent-browser set viewport 390 844
agent-browser screenshot --full "$report_dir/checkout-mobile.png"
agent-browser errors >"$report_dir/browser-errors.txt"
echo "Browser inspection artifacts saved in $report_dir"
echo 'No payment was submitted. Inspect screenshots and errors before declaring checkout verified.'
