# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm test              # JS-Tests + Package-Tests (Standardlauf)
npm run test:js       # Nur Mocha-Tests auf main.js-Ebene und lib/
npm run test:unit     # Unit-Tests in test/unit/
npm run test:package  # Paketstruktur-Tests (io-package.json, package.json)
npm run lint          # ESLint (ecmaVersion 2022, eslint:recommended)
npm run translate     # i18n-Übersetzungen synchronisieren (translate-adapter)
npm run release       # Release-Script (@alcalzone/release-script)
```

## Architektur

Der Adapter folgt dem offiziellen [iobroker-ai-developer-guide](https://github.com/ioBroker/ioBroker.template).

```
main.js                     ← Adapter-Einstiegspunkt (VictronVrmAdapter extends utils.Adapter)
lib/vrm-api.js              ← VRM REST API v2 Client (fetch, kein axios)
lib/sensor-definitions.js   ← Alle 111 Sensor-Definitionen als Array-Konstanten
admin/jsonConfig.json        ← Admin-UI-Konfigurationsschema (JSON Config)
admin/i18n/                  ← i18n-Übersetzungsdateien
io-package.json              ← Adapter-Metadaten, instanceObjects, encryptedNative
```

### Datenfluss

1. `onReady()` → `_ensureObjects()` baut den gesamten State-Baum einmalig auf
2. Zwei unabhängige Polling-Schleifen via `adapter.setInterval`:
   - **Diagnostics** (Standard 30 s): `GET /installations/{id}/diagnostics` → alle Sensor-Rohwerte per `idDataAttribute`-Lookup-Map → States setzen
   - **Overall Stats** (Standard 300 s): `GET /installations/{id}/stats` → Energie-Summen für Heute/Woche/Monat/Jahr
3. Alarme werden am Ende jedes Diagnostics-Polls als Nebenaufruf geholt (`_pollAlarms`)

### sensor-definitions.js – Struktur

Jeder Sensor hat: `{ id, name: {en, de}, vrmId, unit, type, role, calc? }`

- `vrmId`: numerische `idDataAttribute` aus dem Diagnostics-Endpunkt, oder ein String-Key für Overall-Stats-Felder
- `vrmId: null` + `calc: (vals) => ...`: berechnete Werte (z. B. `battery.power = voltage × current`)
- Exportierte Konstanten: `ALL_SENSORS`, `OVERALL_STAT_KEYS`, `OVERALL_PERIODS`, `TEXT_STATES`, `META_STATES`, `CHANNELS`, `VEBUS_STATE_TEXT`, `SOLAR_CHARGE_STATE_TEXT`

### ioBroker-Pflichtregeln (Guide)

- Immer `adapter.setTimeout` / `adapter.setInterval` statt globaler Node-Pendants
- `adapter.terminate()` statt `process.exit()`
- `setObjectNotExistsAsync` (nie bestehende Objekte überschreiben)
- `ack: true` für Gerätewerte, `ack: false` für Befehle
- Alle Log-Meldungen in Englisch
- Vollständige device → channel → state Hierarchie (jedes Zwischenobjekt explizit anlegen)
- `accessToken` ist in `encryptedNative` + `protectedNative` (io-package.json)

### API-Besonderheiten

- `GET /installations/{id}` liefert HTTP 400 → Metadaten werden über `/users/me` + `/users/{uid}/installations` aufgelöst (`getInstallation()`)
- Rate Limit: ~3 req/s; HTTP 429 wirft einen Fehler mit `Retry-After`-Wert (kein automatisches Retry im Client)
- Auth-Header: `X-Authorization: Token <accessToken>`
