# ioBroker.victronvrm

ioBroker-Adapter für das **Victron Energy VRM Portal** – [VRM REST API v2](https://vrm-api-docs.victronenergy.com/)

**111 Datenpunkte** aus allen Victron-Geräten, identische Sensor-Abdeckung wie der [hass-victron-vrm-api](https://github.com/jayjojayson/hass-victron-vrm-api) Home Assistant Adapter.

---

## Installation

```bash
cd /opt/iobroker
npm install /pfad/zu/iobroker.victronvrm
iobroker add victronvrm
```

## Konfiguration

| Feld | Beschreibung |
|------|-------------|
| **Personal Access Token** | VRM → Nutzer → Einstellungen → Integrationen → Access Tokens |
| **Installations-ID** | Zahl aus der URL: `.../installation/**123456**/` |
| **Diagnostics-Intervall** | Alle Sensor-Werte (Standard: 30s, min. 10s) |
| **Overall-Stats Intervall** | Ertrag/Verbrauch (Standard: 300s) |

---

## Datenpunkte (111 Sensoren)

### `victronvrm.0.battery.*` – 34 Sensoren

| State | VRM-ID | Einheit | Beschreibung |
|-------|--------|---------|-------------|
| `soc` | 51 | % | State of Charge |
| `voltage` | 47 | V | Spannung |
| `current` | 49 | A | Strom |
| `consumedAh` | 50 | Ah | Verbrauchte Ah |
| `timeToGo` | 52 | h | Verbleibende Zeit |
| `temperature` | 115 | °C | Temperatur |
| `minCellVoltage` | 173 | V | Min. Zellspannung |
| `maxCellVoltage` | 174 | V | Max. Zellspannung |
| `cellVoltageDiff` | *calc* | V | Differenz Max-Min |
| `power` | *calc* | W | Leistung (V×A) |
| `chargeCycles` | 58 | – | Ladezyklen |
| `energyToConsumersToday` | Bc | kWh | → Verbraucher (heute) |
| `energyToGridToday` | Bg | kWh | → Netz (heute) |
| `alarms.*` | 119–740 | – | 21 Alarm-States |

### `victronvrm.0.multiplus.*` – 12 Sensoren

| State | VRM-ID | Einheit | Beschreibung |
|-------|--------|---------|-------------|
| `acInput.voltageL1` | 8 | V | AC Eingangsspannung |
| `acInput.powerL1` | 17 | W | AC Eingangsleistung |
| `acOutput.voltageL1` | 20 | V | AC Ausgangsspannung |
| `acOutput.powerL1` | 29 | W | AC Ausgangsleistung |
| `dc.voltage` | 32 | V | DC Bus Spannung |
| `dc.current` | 33 | A | DC Bus Strom |
| `dc.power` | *calc* | W | DC Bus Leistung |
| `state` | 40 | – | VE.Bus Zustand |
| `stateText` | – | – | Zustand als Text |
| `temperature` | 521 | °C | Temperatur |
| `soc` | 144 | % | System SoC |
| `energyGridToConsumersToday` | Gc | kWh | Netz→Verbraucher (heute) |
| `energyGridToBatteryToday` | Gb | kWh | Netz→Batterie (heute) |

### `victronvrm.0.grid.*` – 10 Sensoren
Spannung, Strom, Leistung für L1/L2/L3 + berechnete Gesamtleistung

### `victronvrm.0.pvInverter.*` – 17 Sensoren
Spannung, Strom, Leistung, Energie für L1/L2/L3 + Status + Tageswerte

### `victronvrm.0.tank.*` – 6 Sensoren
Kapazität, Typ, Füllstand, Verbleibend, Status, Name

### `victronvrm.0.solar.*` – 7 Sensoren
Ladeleistung, Spannung, Ladezustand, Temperatur, Ertrag heute/gestern, Relais

### `victronvrm.0.system.*` – 5 Sensoren
ESS BatteryLife Zustand/SoC-Limit, ESS Min-SoC, Geplantes Laden

### `victronvrm.0.overall.*` – 20 Sensoren
8 Energie-Werte × 4 Perioden (Heute / Woche / Monat / Jahr):
- `batteriesPowerTotal`, `pvInverterPowerTotal`, `solarChargerPowerTotal`, `dcLoads`
- `totalSolarYield`, `totalConsumption`, `gridEnergyIn`, `gridEnergyOut`

### `victronvrm.0.meta.*`
Anlagenname, ID, Zeitzone, Land, Zeitstempel, Alarm-Zähler, Alarm-JSON

---

## Rate-Limit

Die VRM API erlaubt ~3 Anfragen/Sekunde. Pro Zyklus werden verwendet:
- 1x Diagnostics
- 1x Alarme
- 4x Overall-Stats (eine pro Periode)

Bei Standard-Einstellungen (30s/300s) bleibt der Adapter weit unter dem Limit.

---

## Lizenz
MIT
