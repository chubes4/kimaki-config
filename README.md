# ⚠️ ARCHIVED — moved to wp-coding-agents

**This repo is no longer maintained.** Its contents have been absorbed into [Extra-Chill/wp-coding-agents](https://github.com/Extra-Chill/wp-coding-agents) under the `kimaki/` directory, which is now the single source of truth for fleet Kimaki configuration.

## New location

| Old path (here) | New path (wp-coding-agents) |
|-----------------|------------------------------|
| `skills-kill-list.txt` | `kimaki/skills-kill-list.txt` |
| `post-upgrade.sh` | `kimaki/post-upgrade.sh` |
| `plugins/*.ts` | `kimaki/plugins/*.ts` |

## Why

`wp-coding-agents` installs and configures Kimaki as part of the VPS bootstrap (`setup.sh`) and provides an idempotent upgrade path (`upgrade.sh`). Keeping the Kimaki config alongside the install script eliminates drift between what gets deployed and what the fleet runs.

## If you're on an old VPS

The contents of `/opt/kimaki-config/` are still used at runtime — the install layout hasn't changed. What changed is the authoritative upstream:

```bash
# Old (DO NOT USE — this repo is archived):
# git clone https://github.com/chubes4/kimaki-config.git /opt/kimaki-config

# New workflow — pull updates via wp-coding-agents/upgrade.sh:
cd /var/lib/datamachine/workspace/wp-coding-agents
git pull origin main
./upgrade.sh --kimaki-only
```

If your VPS still has a `.git` inside `/opt/kimaki-config/` pointing at this repo, remove it — it is no longer tracked:

```bash
rm -rf /opt/kimaki-config/.git
```

See [wp-coding-agents/kimaki/](https://github.com/Extra-Chill/wp-coding-agents/tree/main/kimaki) for the current files.
