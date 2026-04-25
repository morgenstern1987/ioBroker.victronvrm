# ioBroker.victronvrm

<p align="center">
  <strong>ioBroker adapter for the Victron Energy VRM Portal</strong><br>
  Reads all device data via the official <a href="https://vrm-api-docs.victronenergy.com/">VRM REST API v2</a> – no local access to the GX device required.
</p>

<p align="center">
  <a href="https://vrm.victronenergy.com"><img src="https://img.shields.io/badge/VRM-Portal-blue" alt="VRM Portal"/></a>
  <a href="https://vrm.victronenergy.com/access-tokens"><img src="https://img.shields.io/badge/VRM-Access%20Tokens-orange" alt="Access Tokens"/></a>
  <img src="https://img.shields.io/badge/Version-1.4.8-blue" alt="Version"/>
  <img src="https://img.shields.io/badge/Sensors-111-brightgreen" alt="111 Sensors"/>
  <img src="https://img.shields.io/badge/Node.js-%3E%3D18-green" alt="Node.js"/>
</p>

---

## Changelog

### **WORK IN PROGRESS**
- (no changes yet)

### 1.4.8 (2026-04-25)
- Fix: migrate to @iobroker/eslint-config (W0062 resolved)
- Fix: remove redundant eslint/js/globals devDependencies

### 1.4.7 (2026-04-25)
- Fix: workflow job names corrected (check-and-lint, adapter-tests, deploy)
- Fix: removed ioBroker testing actions that required npm ci
- Fix: dependabot open-pull-requests-limit set to 15

### 1.4.6 (2026-04-25)
- Fix: remove redundant devDependencies (chai/mocha/sinon are included by @iobroker/testing)
- Fix: admin globalDependency updated to 7.6.20
- Fix: vscode schema URLs corrected (io-package.json and jsonConfig)
- Fix: news entries trimmed to 7 (repository builder limit)
- Fix: workflow now uses official ioBroker testing actions (check, adapter, deploy)
- Fix: added auto-merge.yml for Dependabot PRs
- Added CHANGELOG_OLD.md for older entries

### 1.4.5 (2026-04-25)
- Fix: remove non-existent @iobroker/eslint-config dependency
- Fix: all adapter checker errors resolved
  - Updated adapter-core to ^3.3.2, @iobroker/testing to ^5.2.2
  - Updated release-script and plugins to ^5.x
  - Updated @iobroker/adapter-dev to ^1.5.0
  - Node.js minimum raised to >=20
  - js-controller dependency raised to >=6.0.11
  - admin >=7.6.17 added to globalDependencies
  - Removed invalid io-package.json /common properties: nodeVersion, allowInit
  - Moved encryptedNative/protectedNative to io-package.json root level
  - Fixed extIcon URL to raw.githubusercontent.com
  - Added tags trigger to workflow (v[0-9]+.[0-9]+.[0-9]+)
  - Added concurrency configuration to workflow
  - Added required jobs: check-and-lint, adapter-tests (matrix 20/22/24), deploy
  - Added .github/dependabot.yml with cooldown and github-actions entry
  - Added .github/workflows/automerge-dependabot.yml
  - Added .vscode/settings.json with JSON schema definitions
  - Added .commitinfo to .gitignore
  - Use node:fs and node:path instead of fs and path
  - Removed direct npm install instructions from README

### 1.4.4 (2026-04-25)
- Add adapter icon (admin/victronvrm.png)
- Migrate to ESLint v9 Flat Config (eslint.config.mjs), remove deprecated .eslintrc.json
- Inject adapter sleep function into VrmApiClient (no Node.js global setTimeout in lib)
- Add real package-lock.json for reproducible installs

### 1.4.3 (2026-04-21)
- Docs: added GX device log interval explanation (set to 1 min for best update frequency)
- Changed default diagnostics polling interval from 30s to 60s

### 1.4.2 (2026-04-21)
- Fix: correct `/overallstats` endpoint (previously `/stats?type=kwh` always returned empty arrays)
- Fix: two-letter API codes (`Pc`, `Pb`, `Pg`, `Gc`, `Gb`, `Bc`, `Bg`) instead of invented key names
- Fix: period keys `today/week/month/year` (not `this_week/this_month`)
- Fix: populate string-vrmId sensors from overallstats today data
- Fix: `meta.siteName`, `meta.timezone`, `meta.country` now correctly populated
- Fix: `batteryLifeState` unit corrected from `%` to empty string
- Fix: Docker rate-limit – stats delayed 5s on startup, automatic retry on HTTP 429

### 1.1.0 (2026-04-20)
- Improved stability, fixed release workflow
- Added `.releaseconfig.json` for automatic version sync

### 1.0.1 (2026-04-17)
- First stable release: 111 sensors, i18n, correct project structure
- Fix: `/installations/{id}` returns 400, use user list instead
- Fix: jsonConfig schema (`def` → `default`)

---

## Features

- **111 data points** from all Victron devices – identical coverage to the [hass-victron-vrm-api](https://github.com/jayjojayson/hass-victron-vrm-api) Home Assistant adapter
- **No local access required** – works for mobile systems (motorhome, boat, vehicle)
- **Secure Access Token** – no username/password stored in the adapter
- **Calculated values** directly in the adapter (power, cell voltage difference, PV total yield...)
- **Overall Stats** for today, week, month and year via `/overallstats` endpoint
- **21 alarm states** for detailed battery monitoring
- **Text mappings** for VE.Bus state and solar charge state
- **Automatic retry** on HTTP 429 rate limit with Retry-After support
- **Post-release hook** – automatically re-inserts changelog placeholder after every release

---

## Prerequisites

- ioBroker with js-controller ≥ 5.0.19
- Node.js ≥ 18
- Victron VRM account: [vrm.victronenergy.com](https://vrm.victronenergy.com)
- Personal Access Token: **[vrm.victronenergy.com/access-tokens](https://vrm.victronenergy.com/access-tokens)**
- Installation ID (idSite)

---

## Installation

Install via ioBroker Admin interface:

1. Open ioBroker Admin → **Adapter**
2. Search for **victronvrm**
3. Click **Install**

Or via ioBroker CLI:

```bash
iobroker add victronvrm
```

---

## Configuration

| Field | Description |
|-------|-------------|
| **Personal Access Token** | Create at: [vrm.victronenergy.com/access-tokens](https://vrm.victronenergy.com/access-tokens) |
| **Installation ID (idSite)** | Number from VRM URL: `https://vrm.victronenergy.com/installation/`**`123456`**`/` |
| **Diagnostics Interval** | How often the adapter polls the VRM API (default: 30s, min: 10s) |
| **Overall Stats Interval** | Energy totals today/week/month/year (default: 300s) |

### ⚠️ Important: GX Device Log Interval

The VRM API (`/diagnostics`) only serves data as fresh as the **log interval configured on your GX device**. No matter how often the adapter polls, values will not update more frequently than that interval.

**To get the most frequent updates possible, set the log interval on your GX device to 1 minute:**

```
GX Device → Settings → VRM Online Portal → Log interval → 1 min
```

With this setting, sensor values in ioBroker will update approximately **every 60 seconds** – regardless of a shorter adapter polling interval. Setting the adapter diagnostics interval below 60 seconds therefore provides no benefit and only wastes API calls.

---

## Data Points (111 Sensors)

### `battery.*` – 34 sensors
SoC, voltage, current, power, temperature, min/max cell voltage, cell voltage diff, time to go, charge cycles, energy flows, 21 alarm states

### `multiplus.*` – 12 sensors
AC input/output voltage & power L1, DC bus voltage/current/power, VE.Bus state, temperature, system SoC, energy flows

### `grid.*` – 10 sensors
Voltage, current, power for L1/L2/L3 + calculated total power

### `pvInverter.*` – 17 sensors
Voltage, current, power, energy for L1/L2/L3, status, energy flows today, total yield today

### `tank.*` – 6 sensors
Capacity, type, level, remaining, status, custom name

### `solar.*` – 7 sensors
Charging power, battery voltage, charge state, temperature, yield today/yesterday, relay status

### `system.*` – 5 sensors (ESS/BatteryLife)
BatteryLife state/SoC limit, minimum SoC, scheduled charging

### `overall.*` – 28 states (7 flows × 4 periods)
| Flow | Today | Week | Month | Year |
|------|-------|------|-------|------|
| PV → Consumers | ✅ | ✅ | ✅ | ✅ |
| PV → Battery | ✅ | ✅ | ✅ | ✅ |
| PV → Grid | ✅ | ✅ | ✅ | ✅ |
| Grid → Consumers | ✅ | ✅ | ✅ | ✅ |
| Grid → Battery | ✅ | ✅ | ✅ | ✅ |
| Battery → Consumers | ✅ | ✅ | ✅ | ✅ |
| Battery → Grid | ✅ | ✅ | ✅ | ✅ |

### `meta.*`
Site name, ID, timezone, country, last update timestamps, active alarm count, alarms JSON

---

## Release Workflow

```bash
# Create a new release (bumps version, updates changelog, pushes to GitHub)
npx release-script minor   # or patch / major
npx release-script minor --no-translate  # skip auto-translation if service unavailable

# The postrelease hook automatically re-inserts ### **WORK IN PROGRESS**
# into README.md so it is ready for the next release.
```

---

## Links

| | |
|--|--|
| 🌐 VRM Portal | [vrm.victronenergy.com](https://vrm.victronenergy.com) |
| 🔑 Create Access Token | [vrm.victronenergy.com/access-tokens](https://vrm.victronenergy.com/access-tokens) |
| 📖 VRM API Docs | [vrm-api-docs.victronenergy.com](https://vrm-api-docs.victronenergy.com/) |
| 🏠 Reference HA adapter | [github.com/jayjojayson/hass-victron-vrm-api](https://github.com/jayjojayson/hass-victron-vrm-api) |
| 💬 Victron Community | [community.victronenergy.com](https://community.victronenergy.com) |

---

## License

MIT © 2026 morgenstern1987
