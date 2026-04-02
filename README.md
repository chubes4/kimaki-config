# kimaki-config

Shared [Kimaki](https://github.com/remorses/kimaki) configuration for the fleet. Runs on every crew VPS after Kimaki upgrades to enforce fleet-wide standards.

## What it does

- **Skill kill list** — removes bundled Kimaki skills that aren't useful for our WordPress/Extra Chill workflow
- **Context filter plugin** — strips Kimaki's built-in memory and scheduling from the agent context when an external system (Data Machine) manages those concerns

## Usage

### Install on a new server

```bash
git clone https://github.com/chubes4/kimaki-config.git /opt/kimaki-config

# Add ExecStartPre to kimaki.service
systemctl edit kimaki
# Add under [Service]:
#   ExecStartPre=/opt/kimaki-config/post-upgrade.sh
systemctl daemon-reload
systemctl restart kimaki
```

### Enable the context filter plugin

Add to your project's `opencode.json`:

```json
{
  "plugin": ["/opt/kimaki-config/plugins/fleet-context-filter.ts"]
}
```

This strips:
- **MEMORY.md injection** — Kimaki reads `MEMORY.md` from the project directory and injects it on first message. Conflicts with Data Machine's own memory files.
- **"Update MEMORY.md" reminder** — On idle gaps > 10 minutes, Kimaki tells the agent to update `MEMORY.md`. Redundant with external memory management.
- **Scheduling instructions** — ~50 lines about `kimaki send --send-at`, cron, and task management. Conflicts with Data Machine scheduling.

### Update the kill list

Edit `skills-kill-list.txt` (one skill name per line), commit, push. Then `git pull` on each server — it takes effect on the next Kimaki restart.

## Files

- `skills-kill-list.txt` — skill directory names to remove (one per line)
- `post-upgrade.sh` — script that reads the kill list and removes matching skills
- `plugins/fleet-context-filter.ts` — OpenCode plugin that strips memory/scheduling from agent context
