# ioBroker.victronvrm

# ioBroker.victronvrm

## Changelog

### **WORK IN PROGRESS**

<p align="center">
  <strong>ioBroker-Adapter für das Victron Energy VRM Portal</strong><br>
  Liest alle Gerätedaten über die offizielle <a href="https://vrm-api-docs.victronenergy.com/">VRM REST API v2</a> – kein lokaler Zugriff auf das GX-Gerät nötig.
</p>

<p align="center">
  <a href="https://vrm.victronenergy.com"><img src="https://img.shields.io/badge/VRM-Portal-blue" alt="VRM Portal"/></a>
  <a href="https://vrm.victronenergy.com/access-tokens"><img src="https://img.shields.io/badge/VRM-Access%20Tokens-orange" alt="Access Tokens"/></a>
  <img src="https://img.shields.io/badge/Version-1.0.1-blue" alt="Version"/>
  <img src="https://img.shields.io/badge/Sensoren-111-brightgreen" alt="111 Sensoren"/>
  <img src="https://img.shields.io/badge/Node.js-%3E%3D18-green" alt="Node.js"/>
</p>

---

## ✨ Features

- **111 Datenpunkte** aus allen Victron-Geräten – identische Sensor-Abdeckung wie der populäre [hass-victron-vrm-api](https://github.com/jayjojayson/hass-victron-vrm-api) Home Assistant Adapter
- **Kein lokaler Zugriff nötig** – funktioniert auch für mobile Systeme (Wohnmobil, Boot, Fahrzeug)
- **Sicherer Access Token** – kein Benutzername/Passwort im Adapter gespeichert
- **Berechnete Werte** direkt im Adapter (Leistung, Zellspannungsdifferenz, PV-Gesamtertrag …)
- **Overall Stats** für Heute, Woche, Monat und Jahr
- **21 Alarm-States** für detaillierte Batterie-Überwachung
- **Text-Mappings** für VE.Bus Zustand und Solar Ladezustand als lesbare Strings
- **Robustes Error-Handling** mit Rate-Limit-Erkennung (HTTP 429 + Retry-After)

---

## 📋 Voraussetzungen

- ioBroker mit js-controller ≥ 3.3.0
- Node.js ≥ 18 (nutzt Built-in `fetch`)
- Victron VRM Account: [vrm.victronenergy.com](https://vrm.victronenergy.com)
- Personal Access Token: **[vrm.victronenergy.com/access-tokens](https://vrm.victronenergy.com/access-tokens)**
- Installations-ID (idSite) deiner Anlage

---

## 🚀 Installation

### Manuell (lokaler Ordner)

```bash
# ZIP entpacken, dann:
cd /opt/iobroker
npm install /pfad/zum/entpackten/iobroker.victronvrm-Ordner
iobroker add victronvrm
```

### Via ioBroker Admin (Custom URL)

1. Admin → Adapter → **+** → „Von eigener URL"
2. Lokalen Pfad oder GitHub-URL eintragen
3. Instanz erstellen und konfigurieren

---

## ⚙️ Konfiguration

| Feld | Beschreibung |
|------|-------------|
| **Personal Access Token** | Erstellen unter: [vrm.victronenergy.com/access-tokens](https://vrm.victronenergy.com/access-tokens) |
| **Installations-ID (idSite)** | Zahl aus der VRM-URL: `https://vrm.victronenergy.com/installation/`**`123456`**`/` |
| **Diagnostics-Intervall** | Alle Sensor-Werte (Standard: 30 s, min. 10 s) |
| **Overall-Stats Intervall** | Ertrag/Verbrauch-Summen (Standard: 300 s) |

### Access Token erstellen

1. Direkt öffnen: **[vrm.victronenergy.com/access-tokens](https://vrm.victronenergy.com/access-tokens)**
   *(oder: VRM → Nutzer-Symbol oben rechts → Einstellungen → Integrationen → Access Tokens)*
2. Klicke **„Token hinzufügen"**
3. Vergib einen Namen, z. B. `ioBroker`
4. Den Token kopieren – er wird **nur einmal** angezeigt!
5. In die Adapter-Konfiguration einfügen

### Installations-ID finden

Öffne deine Anlage im VRM-Portal. Die Zahl in der URL ist die `idSite`:

```
https://vrm.victronenergy.com/installation/275629/dashboard
                                            ^^^^^^
                                            Das ist deine idSite
```

---

## 📊 Datenpunkte (111 Sensoren)

### 🔋 `victronvrm.0.battery.*` – 34 Sensoren

#### Messwerte
| State | VRM-ID | Einheit | Beschreibung |
|-------|--------|---------|-------------|
| `soc` | 51 | % | State of Charge (Ladezustand) |
| `voltage` | 47 | V | Batteriespannung |
| `current` | 49 | A | Strom (positiv = lädt) |
| `consumedAh` | 50 | Ah | Verbrauchte Amperestunden |
| `timeToGo` | 52 | h | Verbleibende Zeit bis leer |
| `temperature` | 115 | °C | Batterietemperatur |
| `minCellVoltage` | 173 | V | Minimale Zellspannung (BMS) |
| `maxCellVoltage` | 174 | V | Maximale Zellspannung (BMS) |
| `chargeCycles` | 58 | – | Ladezyklen gesamt |

#### Berechnete Werte *(direkt im Adapter, kein extra API-Call)*
| State | Formel | Einheit | Beschreibung |
|-------|--------|---------|-------------|
| `power` | Voltage × Current | W | Aktuelle Leistung |
| `cellVoltageDiff` | Max − Min | V | Zellspannungsdifferenz |

#### Tagesenergie
| State | Key | Einheit | Beschreibung |
|-------|-----|---------|-------------|
| `energyToConsumersToday` | Bc | kWh | Batterie → Verbraucher (heute) |
| `energyToGridToday` | Bg | kWh | Batterie → Netz (heute) |

#### Alarmzustände *(0 = OK · 1 = Warnung · 2 = Alarm)*
| State | VRM-ID | Beschreibung |
|-------|--------|-------------|
| `alarms.lowVoltage` | 119 | Unterspannung |
| `alarms.highVoltage` | 120 | Überspannung |
| `alarms.lowStarterVoltage` | 121 | Starterbatterie zu niedrig |
| `alarms.highStarterVoltage` | 122 | Starterbatterie zu hoch |
| `alarms.lowSoc` | 123 | SoC zu niedrig |
| `alarms.lowTemperature` | 124 | Temperatur zu niedrig |
| `alarms.highTemperature` | 125 | Temperatur zu hoch |
| `alarms.midVoltage` | 126 | Mid-Voltage Anomalie |
| `alarms.lowFusedVoltage` | 155 | Gesicherte Spannung zu niedrig |
| `alarms.highFusedVoltage` | 156 | Gesicherte Spannung zu hoch |
| `alarms.fuseBlown` | 157 | Sicherung ausgelöst |
| `alarms.highInternalTemp` | 158 | Innentemperatur zu hoch |
| `alarms.cellImbalance` | 286 | Zellungleichgewicht |
| `alarms.highChargeCurrent` | 287 | Ladestrom zu hoch |
| `alarms.highDischargeCurrent` | 288 | Entladestrom zu hoch |
| `alarms.internalFailure` | 289 | Interner Fehler |
| `alarms.highChargeTemp` | 459 | Ladetemperatur zu hoch |
| `alarms.lowChargeTemp` | 460 | Ladetemperatur zu niedrig |
| `alarms.lowCellVoltage` | 522 | Zellspannung kritisch niedrig |
| `alarms.chargeBlocked` | 739 | Laden gesperrt (BMS) |
| `alarms.dischargeBlocked` | 740 | Entladen gesperrt (BMS) |

---

### ⚡ `victronvrm.0.multiplus.*` – 12 Sensoren

| State | VRM-ID | Einheit | Beschreibung |
|-------|--------|---------|-------------|
| `acInput.voltageL1` | 8 | V | AC Eingangsspannung L1 |
| `acInput.powerL1` | 17 | W | AC Eingangsleistung L1 |
| `acOutput.voltageL1` | 20 | V | AC Ausgangsspannung L1 |
| `acOutput.powerL1` | 29 | W | AC Ausgangsleistung L1 |
| `dc.voltage` | 32 | V | DC Bus Spannung |
| `dc.current` | 33 | A | DC Bus Strom |
| `dc.power` | *calc* | W | DC Bus Leistung (V × A) |
| `state` | 40 | – | VE.Bus Zustand (Zahl) |
| `stateText` | – | – | VE.Bus Zustand (Text) |
| `temperature` | 521 | °C | Gerätetemperatur |
| `soc` | 144 | % | System State of Charge |
| `energyGridToConsumersToday` | Gc | kWh | Netz → Verbraucher (heute) |
| `energyGridToBatteryToday` | Gb | kWh | Netz → Batterie (heute) |

**VE.Bus Zustände:** `0`=Off · `1`=Low Power · `2`=Fault · `3`=Bulk · `4`=Absorption · `5`=Float · `6`=Storage · `7`=Equalize · `8`=Passthru · `9`=Inverting · `10`=Power Assist · `11`=Power Supply · `244`=Sustain · `252`=External Control

---

### 🔌 `victronvrm.0.grid.*` – 10 Sensoren

| State | VRM-ID | Einheit | Beschreibung |
|-------|--------|---------|-------------|
| `voltageL1` / `voltageL2` / `voltageL3` | 834 / 837 / 840 | V | Netzspannung je Phase |
| `currentL1` / `currentL2` / `currentL3` | 835 / 838 / 841 | A | Netzstrom je Phase |
| `powerL1` / `powerL2` / `powerL3` | 379 / 380 / 381 | W | Netzleistung je Phase |
| `powerTotal` | *calc* | W | Gesamtleistung (L1 + L2 + L3) |

> Vorzeichen: **positiv** = Netzbezug · **negativ** = Einspeisung

---

### ☀️ `victronvrm.0.pvInverter.*` – 17 Sensoren

| State | VRM-ID | Einheit | Beschreibung |
|-------|--------|---------|-------------|
| `voltageL1/L2/L3` | 203 / 207 / 211 | V | Spannung je Phase |
| `currentL1/L2/L3` | 204 / 208 / 212 | A | Strom je Phase |
| `powerL1/L2/L3` | 205 / 209 / 213 | W | Leistung je Phase |
| `energyL1/L2/L3` | 206 / 210 / 214 | kWh | Gesamtertrag je Phase |
| `status` | 246 | – | Status-Code |
| `energyToConsumersToday` | Pc | kWh | PV → Verbraucher (heute) |
| `energyToBatteryToday` | Pb | kWh | PV → Batterie (heute) |
| `energyToGridToday` | Pg | kWh | PV → Netz (heute) |
| `totalYieldToday` | *calc* | kWh | PV Gesamt heute (Pc + Pb + Pg) |

---

### 🏺 `victronvrm.0.tank.*` – 6 Sensoren

| State | VRM-ID | Einheit | Beschreibung |
|-------|--------|---------|-------------|
| `capacity` | 328 | m³ | Tankkapazität |
| `type` | 329 | – | Flüssigkeitstyp |
| `level` | 330 | % | Füllstand |
| `remaining` | 331 | m³ | Verbleibende Menge |
| `status` | 443 | – | Tank-Status |
| `name` | 638 | – | Benutzerdefinierter Name |

---

### 🌞 `victronvrm.0.solar.*` – 7 Sensoren

| State | VRM-ID | Einheit | Beschreibung |
|-------|--------|---------|-------------|
| `power` | 107 | W | Ladeleistung zur Batterie |
| `voltage` | 81 | V | Batteriespannung am MPPT |
| `chargeState` | 85 | – | Ladezustand (Zahl) |
| `chargeStateText` | – | – | Ladezustand (Text) |
| `temperature` | 83 | °C | Batterietemperatur |
| `yieldToday` | 94 | kWh | Ertrag heute |
| `yieldYesterday` | 96 | kWh | Ertrag gestern |
| `relayStatus` | 90 | – | Relais-Status |

**Solar Ladezustände:** `0`=Off · `2`=Fault · `3`=Bulk · `4`=Absorption · `5`=Float · `6`=Storage · `7`=Equalize

---

### 🖥️ `victronvrm.0.system.*` – 5 Sensoren (ESS / BatteryLife)

| State | VRM-ID | Einheit | Beschreibung |
|-------|--------|---------|-------------|
| `ess.batteryLifeState` | 332 | – | BatteryLife Algorithmus-Status |
| `ess.batteryLifeSocLimit` | 333 | % | Dynamisches SoC-Limit (BatteryLife) |
| `ess.minSoc` | 334 | % | Benutzerdefiniertes Mindest-SoC |
| `ess.scheduledCharging` | 469 | – | Geplantes Laden (Aktiv / Nicht aktiv) |

---

### 📈 `victronvrm.0.overall.*` – 20 Sensoren

Jeder der 8 Werte ist für **4 Zeiträume** verfügbar → 32 States. Suffix: `Today` / `ThisWeek` / `ThisMonth` / `ThisYear`

| State-Prefix | API-Key | Einheit | Beschreibung |
|--------------|---------|---------|-------------|
| `overall.totalSolarYield` | `total_solar_yield` | kWh | PV Gesamtertrag |
| `overall.totalConsumption` | `total_consumption` | kWh | Gesamtverbrauch |
| `overall.gridEnergyIn` | `grid_history_from` | kWh | Netzbezug |
| `overall.gridEnergyOut` | `grid_history_to` | kWh | Netzeinspeisung |
| `overall.batteriesPowerTotal` | `vrm_batteries_power_total` | W | Batterien Gesamtleistung |
| `overall.pvInverterPowerTotal` | `vrm_pv_inverters_power_total` | W | PV-Wechselrichter Gesamtleistung |
| `overall.solarChargerPowerTotal` | `vrm_solar_chargers_power_total` | W | Solar Charger Gesamtleistung |
| `overall.dcLoads` | `vrm_dc_loads` | W | DC-Lasten |

**Beispiele:** `overall.totalSolarYieldToday`, `overall.gridEnergyInThisMonth`, `overall.totalConsumptionThisYear`

---

### ℹ️ `victronvrm.0.meta.*`

| State | Beschreibung |
|-------|-------------|
| `siteName` | Name der Anlage aus VRM |
| `idSite` | Verwendete Installations-ID |
| `timezone` | Zeitzone der Anlage |
| `country` | Land |
| `lastUpdate` | Zeitstempel letzter Diagnostics-Abruf |
| `lastStatsUpdate` | Zeitstempel letzter Stats-Abruf |
| `activeAlarmCount` | Anzahl aktuell aktiver Alarme |
| `alarmsJson` | Alle aktiven Alarme als JSON-String |

---

## ⚡ API & Rate-Limit

Die VRM API erlaubt **max. ~3 Anfragen/Sekunde** (200 Requests im Rolling-Window, ~0,33 s je Slot).

Pro Polling-Zyklus werden folgende Calls gemacht:

| Abruf | Calls | Häufigkeit |
|-------|-------|------------|
| `/diagnostics` | 1 | Diagnostics-Intervall (Standard: 30 s) |
| `/alarms` | 1 | Diagnostics-Intervall |
| `/stats` × 4 Perioden | 4 | Stats-Intervall (Standard: 300 s) |

Bei Standard-Einstellungen entstehen **2 Calls alle 30 s** – weit unter dem Limit.

> Bei HTTP 429 loggt der Adapter eine Warnung mit der Retry-After-Zeit und versucht es beim nächsten regulären Intervall erneut.

---

## 🔧 Troubleshooting

| Symptom | Ursache & Lösung |
|---------|-----------------|
| `warn: Anlage-Metadaten: VRM API [400]` | Normal – der `/installations/{id}` Endpunkt ist in der API nicht verfügbar. Der Adapter fällt automatisch auf `/users/{id}/installations` zurück. |
| Keine Werte in den States | Im Log prüfen ob Diagnostics erfolgreich sind. Debug-Log aktivieren um rohe VRM-IDs zu sehen. Manche Geräte (z.B. Tank) erscheinen nur wenn konfiguriert. |
| `VRM API [401]` | Access Token ungültig oder abgelaufen → neuen Token erstellen: [vrm.victronenergy.com/access-tokens](https://vrm.victronenergy.com/access-tokens) |
| `VRM API [429]` | Rate-Limit erreicht → Diagnostics-Intervall erhöhen (min. 15 s empfohlen) |
| Overall-Stats leer | Werden erst nach dem Stats-Intervall (Standard: 5 min) befüllt – beim ersten Start normal |

---

## 📁 Dateistruktur

```
iobroker.victronvrm/
├── main.js                      ← Adapter-Hauptdatei
├── lib/
│   ├── vrm-api.js               ← VRM API v2 Client
│   └── sensor-definitions.js   ← Alle 111 Sensoren mit VRM-IDs
├── admin/
│   └── jsonConfig.json          ← Admin-UI Konfiguration
├── io-package.json              ← ioBroker Manifest
├── package.json
└── README.md
```

---

## 🔗 Links

| | |
|--|--|
| 🌐 VRM Portal | [vrm.victronenergy.com](https://vrm.victronenergy.com) |
| 🔑 Access Token erstellen | [vrm.victronenergy.com/access-tokens](https://vrm.victronenergy.com/access-tokens) |
| 📖 VRM API Dokumentation | [vrm-api-docs.victronenergy.com](https://vrm-api-docs.victronenergy.com/) |
| 🏠 Referenz HA-Adapter | [github.com/jayjojayson/hass-victron-vrm-api](https://github.com/jayjojayson/hass-victron-vrm-api) |
| 💬 Victron Community | [community.victronenergy.com](https://community.victronenergy.com) |

---

## 📜 Lizenz

MIT – frei verwendbar und anpassbar.
