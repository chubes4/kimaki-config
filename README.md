# kimaki-config

Shared Kimaki configuration for the fleet. Runs on every crew VPS after Kimaki upgrades to enforce fleet-wide standards.

## What it does

- Removes bundled Kimaki skills that aren't useful for our WordPress/Extra Chill workflow
- Provides a single source of truth for skill management across all servers

## Usage

The `post-upgrade.sh` script is called by a systemd `ExecStartPre` on each crew VPS's `kimaki.service`. Every time Kimaki restarts (including after upgrades), unwanted skills are automatically removed before the bot starts.

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

### Update the kill list

Edit `skills-kill-list.txt` (one skill name per line), commit, push. Then `git pull` on each server — it takes effect on the next Kimaki restart.

## Files

- `skills-kill-list.txt` — skill directory names to remove (one per line)
- `post-upgrade.sh` — script that reads the kill list and removes matching skills
