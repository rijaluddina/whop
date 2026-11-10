# Browser QA in Codex on Linux

Use `agent-browser` with headed Chrome when the user asks to open a visible browser. In this Codex environment, `DISPLAY` and `WAYLAND_DISPLAY` were unset, so Chrome failed with `Missing X server or $DISPLAY`. Setting `DISPLAY=:1` worked on this machine on 2026-11-06. If the desktop session changes, verify the active display before reusing it.

```bash
export DISPLAY=:1
export AGENT_BROWSER_SESSION=roofing-browser-qa
agent-browser open --headed https://the-curiosity-labs.whop.site/
# Use the same named session for subsequent navigation in that window.
agent-browser open https://the-curiosity-labs.whop.site/checkout
```
