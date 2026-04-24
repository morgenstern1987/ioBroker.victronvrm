# ioBroker.victronvrm

[![NPM version](https://img.shields.io/npm/v/iobroker.victronvrm.svg)](https://www.npmjs.com/package/iobroker.victronvrm)
[![Downloads](https://img.shields.io/npm/dm/iobroker.victronvrm.svg)](https://www.npmjs.com/package/iobroker.victronvrm)
![Number of Installations](https://iobroker.live/badges/victronvrm-installed.svg)
![Current version in stable repository](https://iobroker.live/badges/victronvrm-stable.svg)

[![NPM](https://nodei.co/npm/iobroker.victronvrm.png?downloads=true)](https://nodei.co/npm/iobroker.victronvrm/)

**Tests:** ![Test and Release](https://github.com/morgenstern1987/ioBroker.victronvrm/workflows/Test%20and%20Release/badge.svg)

## victronvrm adapter for ioBroker

Connects ioBroker to the **Victron Energy VRM Portal** via the official [VRM REST API v2](https://vrm-api-docs.victronenergy.com/).  
Reads all device telemetry and energy statistics **without requiring local network access** to the GX device – ideal for mobile installations (motorhome, boat, vehicle).

## Features

- **111 data points** covering all major Victron device categories
- **No local access required** – fully cloud-based via VRM API
- **Secure token authentication** – no username/password stored
- **Energy statistics** (today / week / month / year) via `/overallstats`
- **21 alarm states** for detailed battery monitoring
- **Text mappings** for VE.Bus state and solar charger state
- **Automatic retry** with exponential back-off on HTTP 429 rate limiting
- **Compact mode** supported

## Prerequisites

- ioBroker with js-controller **≥ 6.0.11**
- Node.js **≥ 18**
- Victron VRM account: [vrm.victronenergy.com](https://vrm.victronenergy.com)
- Personal Access Token (create at: [vrm.victronenergy.com/access-tokens](https://vrm.victronenergy.com/access-tokens))
- Installation ID (`idSite`) – visible in the VRM Portal URL: `https://vrm.victronenergy.com/installation/`**`123456`**`/`

## Installation

Install via the ioBroker Admin interface (**Admin → Adapter → Search for victronvrm**).

For manual GitHub install, use the ioBroker Admin interface with the GitHub URL:
`https://github.com/morgenstern1987/ioBroker.victronvrm`

> ⚠️ Do **not** install via direct `npm install` commands – always use the ioBroker Admin interface.

## Configuration

| Field | Description |
|---|---|
| **Personal Access Token** | Create at [vrm.victronenergy.com/access-tokens](https://vrm.victronenergy.com/access-tokens) |
| **Installation ID (idSite)** | Numeric ID from the VRM Portal URL |
| **Diagnostics Interval (s)** | How often device telemetry is polled (default: 60 s, min: 10 s) |
| **Overall Stats Interval (s)** | How often energy totals are fetched (default: 300 s) |

### ⚠️ Important: GX Device Log Interval

The VRM API only serves data as fresh as the **log interval configured on your GX device**. Setting the adapter polling interval below the GX log interval wastes API calls without any benefit.

**Recommended: set the GX log interval to 1 minute:**

```
GX Device → Settings → VRM Online Portal → Log interval → 1 min
```

## Data Points

### `battery.*` – 34 states
SoC, voltage, current, power, temperature, min/max cell voltage, cell voltage difference, time to go, charge cycles, energy flows, 21 alarm states

### `multiplus.*` – 12 states
AC input/output voltage & power L1, DC bus voltage/current/power, VE.Bus state, temperature, system SoC, energy flows

### `grid.*` – 10 states
Voltage, current and power for L1/L2/L3 plus calculated total power

### `pvInverter.*` – 17 states
Voltage, current, power and energy for L1/L2/L3, status, energy flows today, total yield today

### `solar.*` – 7 states
Charging power, battery voltage, charge state, temperature, yield today/yesterday, relay status

### `tank.*` – 6 states
Capacity, type, level, remaining, status, custom name

### `system.*` – 5 states
BatteryLife state/SoC limit, minimum SoC, scheduled charging flags

### `overall.*` – 28 states
7 energy flows × 4 time periods (today / week / month / year):  
PV→Consumers, PV→Battery, PV→Grid, Grid→Consumers, Grid→Battery, Battery→Consumers, Battery→Grid

### `meta.*`
Site name, ID, timezone, country, last update timestamps, active alarm count, alarm details JSON

## Links

| Resource | URL |
|---|---|
| 🌐 VRM Portal | [vrm.victronenergy.com](https://vrm.victronenergy.com) |
| 🔑 Access Tokens | [vrm.victronenergy.com/access-tokens](https://vrm.victronenergy.com/access-tokens) |
| 📖 VRM API Docs | [vrm-api-docs.victronenergy.com](https://vrm-api-docs.victronenergy.com/) |
| 💬 Victron Community | [community.victronenergy.com](https://community.victronenergy.com) |
| 🏠 Reference HA adapter | [hass-victron-vrm-api](https://github.com/jayjojayson/hass-victron-vrm-api) |

## Changelog

<!--
    Placeholder for the next version (at the beginning of the line):
    ### **WORK IN PROGRESS**
-->

### 1.4.5 (2026-04-24)
- Fix: all dependencies updated to current versions (adapter-core 3.3.2, testing 5.2.2, adapter-dev 1.5.0)
- Fix: io-package.json schema corrected (nodeVersion removed from common, encryptedNative/protectedNative moved to root level)
- Fix: admin globalDependency added (>=7.6.17)
- Fix: GitHub Actions workflow replaced with official ioBroker standard (check-and-lint, adapter-tests, deploy jobs; tag triggers; concurrency)
- Fix: jsonConfig size attributes (xs/sm/md/lg/xl) added to all staticText elements
- Fix: node:fs and node:path prefixes applied in all source files
- Fix: migrated to @iobroker/eslint-config

### 1.4.4 (2026-04-24)
- Fix: E112 icon path corrected (filename only, no folder prefix)
- Fix: removed deprecated `common.title` from io-package.json
- Fix: migrated from ESLint v8 (`.eslintrc.json`) to ESLint v9 flat config (`eslint.config.mjs`)
- Fix: raised js-controller dependency to `>=6.0.11`
- Fix: `setTimeout` in `lib/vrm-api.js` now injected from adapter context (no raw Node.js global)

### 1.4.3 (2026-04-21)
- Docs: added GX device log interval explanation
- Changed default diagnostics polling interval from 30 s to 60 s

### 1.4.2 (2026-04-21)
- Fix: correct `/overallstats` endpoint (previously `/stats?type=kwh` always returned empty arrays)
- Fix: two-letter API codes (`Pc`, `Pb`, `Pg`, `Gc`, `Gb`, `Bc`, `Bg`)
- Fix: period keys `today/week/month/year`
- Fix: populate string-vrmId sensors from overallstats today data
- Fix: `meta.siteName`, `meta.timezone`, `meta.country` now correctly populated
- Fix: `batteryLifeState` unit corrected from `%` to empty string
- Fix: Docker rate-limit – stats delayed 5 s on startup, automatic retry on HTTP 429

### 1.1.0 (2026-04-20)
- Improved stability, fixed release workflow
- Added `.releaseconfig.json` for automatic version sync

### 1.0.1 (2026-04-17)
- First stable release: 111 sensors, i18n, correct project structure
- Fix: `/installations/{id}` returns 400, use user list instead
- Fix: jsonConfig schema (`def` → `default`)

### 0.1.0 (2026-04-10)
- Initial release

## License

MIT License

Copyright (c) 2026 morgenstern1987

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
