# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Repo & PR Workflow

- **Upstream:** `morgenstern1987/ioBroker.victronvrm` (origin) — PRs go here
- **Fork:** `gregor-samosir/ioBroker.victronvrm` (remote: fork) — development branch
- PR branch: `fix/overall-stats-api-keys`
- `gh` CLI is available; `GITHUB_TOKEN` is set in `~/.zshrc`
- For clean PRs: `git reset --soft origin/main` then re-commit in logical units, force-push fork

## ioBroker on Synology — Deployment

- SSH host alias: `ssh syno`
- Docker exec: `sudo /volume2/@appstore/ContainerManager/usr/bin/docker exec iobroker <cmd>`
- Logs: `/volume2/docker/iobroker/log/iobroker.current.log`
- Install adapter from fork: `npm install gregor-samosir/ioBroker.victronvrm#<branch>`
- Restart adapter: `iobroker restart victronvrm`
- If npm install fails with ENOTEMPTY: `rm -rf /opt/iobroker/node_modules/iobroker.victronvrm` first

## VRM API Quirks

- **Overall stats endpoint:** `GET /installations/{id}/overallstats?type=custom&attributeCodes[]=Pc&attributeCodes[]=Pb&...`
  — NOT `/stats` (always returns empty arrays) and NOT `type=kwh` (only returns aggregate total)
- **Energy flow codes:** `Pc`(PV→consumers), `Pb`(PV→battery), `Pg`(PV→grid), `Gc`(grid→consumers), `Gb`(grid→battery), `Bc`(battery→consumers), `Bg`(battery→grid)
- **Period keys in response:** `today / week / month / year` (NOT `this_week` etc.)
- **`GET /users/me`** returns `{ success, user: {...} }` — use `d.user`, not `d.record`
- **`/installations/{id}`** returns HTTP 400 — must fetch user's installation list and search by idSite

## Code Architecture

- `lib/sensor-definitions.js` — all state definitions: `ALL_SENSORS`, `OVERALL_STAT_KEYS`, `TEXT_STATES`, `META_STATES`, `CHANNELS`
- `lib/vrm-api.js` — VRM API client (fetch-based, no external deps)
- `main.js` — adapter lifecycle, `_pollDiagnostics()` (numeric vrmIds from `/diagnostics`), `_pollStats()` (energy flow from `/overallstats`), `_loadInstallationMeta()`
- Sensors with string `vrmId` (e.g. `'Pc'`) are populated from overallstats today totals, not diagnostics
- Sensors with `vrmId: null` + `calc` function use diagnostics numeric values

## Commands

```bash
npm test        # validates io-package.json, package.json, README.md structure only — no logic tests exist
npm run lint    # eslint check
```
