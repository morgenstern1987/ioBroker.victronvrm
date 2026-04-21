'use strict';

/**
 * Sensor definitions for iobroker.victronvrm
 * Source: hass-victron-vrm-api (jayjojayson) + VRM API v2 docs
 *
 * State roles: https://github.com/ioBroker/ioBroker/blob/master/doc/STATE_ROLES.md
 * Object hierarchy: device → channel → state
 *
 * vrmId: numeric idDataAttribute from /diagnostics, or string key for overall-stats
 * calc: function(vrmValues) → computed value (no extra API call needed)
 */

// ─── Battery (34) ────────────────────────────────────────────────────────────
const BATTERY_SENSORS = [
 { id: 'battery.soc', name: { en: 'State of Charge', de: 'Ladezustand' }, vrmId: 51, unit: '%', type: 'number', role: 'value.battery' },
 { id: 'battery.voltage', name: { en: 'Voltage', de: 'Spannung' }, vrmId: 47, unit: 'V', type: 'number', role: 'value.voltage' },
 { id: 'battery.current', name: { en: 'Current', de: 'Strom' }, vrmId: 49, unit: 'A', type: 'number', role: 'value.current' },
 { id: 'battery.consumedAh', name: { en: 'Consumed Ah', de: 'Verbrauchte Ah' }, vrmId: 50, unit: 'Ah', type: 'number', role: 'value' },
 { id: 'battery.timeToGo', name: { en: 'Time to Go', de: 'Verbleibende Zeit' }, vrmId: 52, unit: 'h', type: 'number', role: 'value' },
 { id: 'battery.temperature', name: { en: 'Temperature', de: 'Temperatur' }, vrmId: 115, unit: '°C', type: 'number', role: 'value.temperature' },
 { id: 'battery.minCellVoltage', name: { en: 'Min Cell Voltage', de: 'Min. Zellspannung' }, vrmId: 173, unit: 'V', type: 'number', role: 'value.voltage' },
 { id: 'battery.maxCellVoltage', name: { en: 'Max Cell Voltage', de: 'Max. Zellspannung' }, vrmId: 174, unit: 'V', type: 'number', role: 'value.voltage' },
 { id: 'battery.cellVoltageDiff', name: { en: 'Cell Voltage Difference', de: 'Zellspannungsdifferenz' }, vrmId: null, unit: 'V', type: 'number', role: 'value.voltage',
 calc: d => (d[174] != null && d[173] != null) ? Math.round((d[174] - d[173]) * 1000) / 1000 : null },
 { id: 'battery.power', name: { en: 'Power', de: 'Leistung' }, vrmId: null, unit: 'W', type: 'number', role: 'value.power',
 calc: d => (d[47] != null && d[49] != null) ? Math.round(d[47] * d[49]) : null },
 { id: 'battery.chargeCycles', name: { en: 'Charge Cycles', de: 'Ladezyklen' }, vrmId: 58, unit: '', type: 'number', role: 'value' },
 { id: 'battery.energyToConsumersToday', name: { en: 'Battery to Consumers Today', de: 'Batterie → Verbraucher (heute)' }, vrmId: 'Bc', unit: 'kWh', type: 'number', role: 'value.energy' },
 { id: 'battery.energyToGridToday', name: { en: 'Battery to Grid Today', de: 'Batterie → Netz (heute)' }, vrmId: 'Bg', unit: 'kWh', type: 'number', role: 'value.energy' },
 // Alarms
 { id: 'battery.alarms.lowVoltage', name: { en: 'Low Voltage Alarm', de: 'Alarm: Unterspannung' }, vrmId: 119, unit: '', type: 'number', role: 'value.warning' },
 { id: 'battery.alarms.highVoltage', name: { en: 'High Voltage Alarm', de: 'Alarm: Überspannung' }, vrmId: 120, unit: '', type: 'number', role: 'value.warning' },
 { id: 'battery.alarms.lowStarterVoltage', name: { en: 'Low Starter Voltage Alarm', de: 'Alarm: Starterbatt. zu niedrig' }, vrmId: 121, unit: '', type: 'number', role: 'value.warning' },
 { id: 'battery.alarms.highStarterVoltage', name: { en: 'High Starter Voltage Alarm', de: 'Alarm: Starterbatt. zu hoch' }, vrmId: 122, unit: '', type: 'number', role: 'value.warning' },
 { id: 'battery.alarms.lowSoc', name: { en: 'Low SoC Alarm', de: 'Alarm: SoC zu niedrig' }, vrmId: 123, unit: '', type: 'number', role: 'value.warning' },
 { id: 'battery.alarms.lowTemperature', name: { en: 'Low Temperature Alarm', de: 'Alarm: Temp. zu niedrig' }, vrmId: 124, unit: '', type: 'number', role: 'value.warning' },
 { id: 'battery.alarms.highTemperature', name: { en: 'High Temperature Alarm', de: 'Alarm: Temp. zu hoch' }, vrmId: 125, unit: '', type: 'number', role: 'value.warning' },
 { id: 'battery.alarms.midVoltage', name: { en: 'Mid Voltage Alarm', de: 'Alarm: Mid-Voltage' }, vrmId: 126, unit: '', type: 'number', role: 'value.warning' },
 { id: 'battery.alarms.lowFusedVoltage', name: { en: 'Low Fused Voltage Alarm', de: 'Alarm: Gesich.-Spg. niedrig' }, vrmId: 155, unit: '', type: 'number', role: 'value.warning' },
 { id: 'battery.alarms.highFusedVoltage', name: { en: 'High Fused Voltage Alarm', de: 'Alarm: Gesich.-Spg. hoch' }, vrmId: 156, unit: '', type: 'number', role: 'value.warning' },
 { id: 'battery.alarms.fuseBlown', name: { en: 'Fuse Blown Alarm', de: 'Alarm: Sicherung ausgelöst' }, vrmId: 157, unit: '', type: 'number', role: 'value.warning' },
 { id: 'battery.alarms.highInternalTemp', name: { en: 'High Internal Temp Alarm', de: 'Alarm: Innentemperatur hoch' }, vrmId: 158, unit: '', type: 'number', role: 'value.warning' },
 { id: 'battery.alarms.cellImbalance', name: { en: 'Cell Imbalance Alarm', de: 'Alarm: Zellungleichgewicht' }, vrmId: 286, unit: '', type: 'number', role: 'value.warning' },
 { id: 'battery.alarms.highChargeCurrent', name: { en: 'High Charge Current Alarm', de: 'Alarm: Ladestrom zu hoch' }, vrmId: 287, unit: '', type: 'number', role: 'value.warning' },
 { id: 'battery.alarms.highDischargeCurrent',name: { en: 'High Discharge Current Alarm',de: 'Alarm: Entladestrom zu hoch' }, vrmId: 288, unit: '', type: 'number', role: 'value.warning' },
 { id: 'battery.alarms.internalFailure', name: { en: 'Internal Failure Alarm', de: 'Alarm: Interner Fehler' }, vrmId: 289, unit: '', type: 'number', role: 'value.warning' },
 { id: 'battery.alarms.highChargeTemp', name: { en: 'High Charge Temp Alarm', de: 'Alarm: Ladetemp. zu hoch' }, vrmId: 459, unit: '', type: 'number', role: 'value.warning' },
 { id: 'battery.alarms.lowChargeTemp', name: { en: 'Low Charge Temp Alarm', de: 'Alarm: Ladetemp. zu niedrig' }, vrmId: 460, unit: '', type: 'number', role: 'value.warning' },
 { id: 'battery.alarms.lowCellVoltage', name: { en: 'Low Cell Voltage Alarm', de: 'Alarm: Zellspannung niedrig' }, vrmId: 522, unit: '', type: 'number', role: 'value.warning' },
 { id: 'battery.alarms.chargeBlocked', name: { en: 'Charge Blocked (BMS)', de: 'Laden gesperrt (BMS)' }, vrmId: 739, unit: '', type: 'number', role: 'value.warning' },
 { id: 'battery.alarms.dischargeBlocked', name: { en: 'Discharge Blocked (BMS)', de: 'Entladen gesperrt (BMS)' }, vrmId: 740, unit: '', type: 'number', role: 'value.warning' },
];

// ─── MultiPlus / VE.Bus (12) ─────────────────────────────────────────────────
const MULTIPLUS_SENSORS = [
 { id: 'multiplus.acInput.voltageL1', name: { en: 'AC Input Voltage L1', de: 'AC Eingangsspannung L1' }, vrmId: 8, unit: 'V', type: 'number', role: 'value.voltage' },
 { id: 'multiplus.acInput.powerL1', name: { en: 'AC Input Power L1', de: 'AC Eingangsleistung L1' }, vrmId: 17, unit: 'W', type: 'number', role: 'value.power' },
 { id: 'multiplus.acOutput.voltageL1', name: { en: 'AC Output Voltage L1', de: 'AC Ausgangsspannung L1' }, vrmId: 20, unit: 'V', type: 'number', role: 'value.voltage' },
 { id: 'multiplus.acOutput.powerL1', name: { en: 'AC Output Power L1', de: 'AC Ausgangsleistung L1' }, vrmId: 29, unit: 'W', type: 'number', role: 'value.power' },
 { id: 'multiplus.dc.voltage', name: { en: 'DC Bus Voltage', de: 'DC Bus Spannung' }, vrmId: 32, unit: 'V', type: 'number', role: 'value.voltage' },
 { id: 'multiplus.dc.current', name: { en: 'DC Bus Current', de: 'DC Bus Strom' }, vrmId: 33, unit: 'A', type: 'number', role: 'value.current' },
 { id: 'multiplus.state', name: { en: 'VE.Bus State', de: 'VE.Bus Zustand' }, vrmId: 40, unit: '', type: 'number', role: 'value' },
 { id: 'multiplus.temperature', name: { en: 'Temperature', de: 'Temperatur' }, vrmId: 521, unit: '°C', type: 'number', role: 'value.temperature' },
 { id: 'multiplus.dc.power', name: { en: 'DC Bus Power', de: 'DC Bus Leistung' }, vrmId: null, unit: 'W', type: 'number', role: 'value.power',
 calc: d => (d[32] != null && d[33] != null) ? Math.round(d[32] * d[33]) : null },
 { id: 'multiplus.soc', name: { en: 'System State of Charge', de: 'System SoC' }, vrmId: 144, unit: '%', type: 'number', role: 'value.battery' },
 { id: 'multiplus.energyGridToConsumersToday', name: { en: 'Grid to Consumers Today', de: 'Netz → Verbraucher (heute)' }, vrmId: 'Gc', unit: 'kWh', type: 'number', role: 'value.energy' },
 { id: 'multiplus.energyGridToBatteryToday', name: { en: 'Grid to Battery Today', de: 'Netz → Batterie (heute)' }, vrmId: 'Gb', unit: 'kWh', type: 'number', role: 'value.energy' },
];

// ─── Grid Meter (10) ──────────────────────────────────────────────────────────
const GRID_SENSORS = [
 { id: 'grid.voltageL1', name: { en: 'Grid Voltage L1', de: 'Netzspannung L1' }, vrmId: 834, unit: 'V', type: 'number', role: 'value.voltage' },
 { id: 'grid.currentL1', name: { en: 'Grid Current L1', de: 'Netzstrom L1' }, vrmId: 835, unit: 'A', type: 'number', role: 'value.current' },
 { id: 'grid.powerL1', name: { en: 'Grid Power L1', de: 'Netzleistung L1' }, vrmId: 379, unit: 'W', type: 'number', role: 'value.power' },
 { id: 'grid.voltageL2', name: { en: 'Grid Voltage L2', de: 'Netzspannung L2' }, vrmId: 837, unit: 'V', type: 'number', role: 'value.voltage' },
 { id: 'grid.currentL2', name: { en: 'Grid Current L2', de: 'Netzstrom L2' }, vrmId: 838, unit: 'A', type: 'number', role: 'value.current' },
 { id: 'grid.powerL2', name: { en: 'Grid Power L2', de: 'Netzleistung L2' }, vrmId: 380, unit: 'W', type: 'number', role: 'value.power' },
 { id: 'grid.voltageL3', name: { en: 'Grid Voltage L3', de: 'Netzspannung L3' }, vrmId: 840, unit: 'V', type: 'number', role: 'value.voltage' },
 { id: 'grid.currentL3', name: { en: 'Grid Current L3', de: 'Netzstrom L3' }, vrmId: 841, unit: 'A', type: 'number', role: 'value.current' },
 { id: 'grid.powerL3', name: { en: 'Grid Power L3', de: 'Netzleistung L3' }, vrmId: 381, unit: 'W', type: 'number', role: 'value.power' },
 { id: 'grid.powerTotal', name: { en: 'Grid Total Power', de: 'Netz Gesamtleis.' }, vrmId: null, unit: 'W', type: 'number', role: 'value.power',
 calc: d => (d[379] != null || d[380] != null || d[381] != null) ? (d[379] || 0) + (d[380] || 0) + (d[381] || 0) : null },
];

// ─── PV Inverter (17) ────────────────────────────────────────────────────────
const PVINVERTER_SENSORS = [
 { id: 'pvInverter.voltageL1', name: { en: 'PV Voltage L1', de: 'PV Spannung L1' }, vrmId: 203, unit: 'V', type: 'number', role: 'value.voltage' },
 { id: 'pvInverter.currentL1', name: { en: 'PV Current L1', de: 'PV Strom L1' }, vrmId: 204, unit: 'A', type: 'number', role: 'value.current' },
 { id: 'pvInverter.powerL1', name: { en: 'PV Power L1', de: 'PV Leistung L1' }, vrmId: 205, unit: 'W', type: 'number', role: 'value.power' },
 { id: 'pvInverter.energyL1', name: { en: 'PV Energy L1 (Total)', de: 'PV Energie L1 (Gesamt)' }, vrmId: 206, unit: 'kWh', type: 'number', role: 'value.energy' },
 { id: 'pvInverter.voltageL2', name: { en: 'PV Voltage L2', de: 'PV Spannung L2' }, vrmId: 207, unit: 'V', type: 'number', role: 'value.voltage' },
 { id: 'pvInverter.currentL2', name: { en: 'PV Current L2', de: 'PV Strom L2' }, vrmId: 208, unit: 'A', type: 'number', role: 'value.current' },
 { id: 'pvInverter.powerL2', name: { en: 'PV Power L2', de: 'PV Leistung L2' }, vrmId: 209, unit: 'W', type: 'number', role: 'value.power' },
 { id: 'pvInverter.energyL2', name: { en: 'PV Energy L2 (Total)', de: 'PV Energie L2 (Gesamt)' }, vrmId: 210, unit: 'kWh', type: 'number', role: 'value.energy' },
 { id: 'pvInverter.voltageL3', name: { en: 'PV Voltage L3', de: 'PV Spannung L3' }, vrmId: 211, unit: 'V', type: 'number', role: 'value.voltage' },
 { id: 'pvInverter.currentL3', name: { en: 'PV Current L3', de: 'PV Strom L3' }, vrmId: 212, unit: 'A', type: 'number', role: 'value.current' },
 { id: 'pvInverter.powerL3', name: { en: 'PV Power L3', de: 'PV Leistung L3' }, vrmId: 213, unit: 'W', type: 'number', role: 'value.power' },
 { id: 'pvInverter.energyL3', name: { en: 'PV Energy L3 (Total)', de: 'PV Energie L3 (Gesamt)' }, vrmId: 214, unit: 'kWh', type: 'number', role: 'value.energy' },
 { id: 'pvInverter.status', name: { en: 'PV Inverter Status', de: 'PV Wechselrichter Status' }, vrmId: 246, unit: '', type: 'number', role: 'value' },
 { id: 'pvInverter.energyToConsumersToday',name: { en: 'PV to Consumers Today', de: 'PV → Verbraucher (heute)' }, vrmId: 'Pc', unit: 'kWh', type: 'number', role: 'value.energy' },
 { id: 'pvInverter.energyToBatteryToday', name: { en: 'PV to Battery Today', de: 'PV → Batterie (heute)' }, vrmId: 'Pb', unit: 'kWh', type: 'number', role: 'value.energy' },
 { id: 'pvInverter.energyToGridToday', name: { en: 'PV to Grid Today', de: 'PV → Netz (heute)' }, vrmId: 'Pg', unit: 'kWh', type: 'number', role: 'value.energy' },
 { id: 'pvInverter.totalYieldToday', name: { en: 'PV Total Yield Today', de: 'PV Gesamtertrag heute' }, vrmId: null, unit: 'kWh', type: 'number', role: 'value.energy',
 calc: d => {
 const pc = d['Pc'], pb = d['Pb'], pg = d['Pg'];
 if (pc == null && pb == null && pg == null) return null;
 return Math.round(((pc || 0) + (pb || 0) + (pg || 0)) * 100) / 100;
 }},
];

// ─── Tank (6) ─────────────────────────────────────────────────────────────────
const TANK_SENSORS = [
 { id: 'tank.capacity', name: { en: 'Tank Capacity', de: 'Tankkapazität' }, vrmId: 328, unit: 'm³', type: 'number', role: 'value' },
 { id: 'tank.type', name: { en: 'Fluid Type', de: 'Flüssigkeitstyp' }, vrmId: 329, unit: '', type: 'number', role: 'value' },
 { id: 'tank.level', name: { en: 'Tank Level', de: 'Füllstand' }, vrmId: 330, unit: '%', type: 'number', role: 'value' },
 { id: 'tank.remaining', name: { en: 'Tank Remaining', de: 'Verbleibend' }, vrmId: 331, unit: 'm³', type: 'number', role: 'value' },
 { id: 'tank.status', name: { en: 'Tank Status', de: 'Tank Status' }, vrmId: 443, unit: '', type: 'number', role: 'value' },
 { id: 'tank.name', name: { en: 'Custom Name', de: 'Eigener Name' }, vrmId: 638, unit: '', type: 'string', role: 'text' },
];

// ─── Solar Charger (7) ────────────────────────────────────────────────────────
const SOLAR_SENSORS = [
 { id: 'solar.power', name: { en: 'Charging Power', de: 'Ladeleistung' }, vrmId: 107, unit: 'W', type: 'number', role: 'value.power' },
 { id: 'solar.voltage', name: { en: 'Battery Voltage', de: 'Batteriespannung' }, vrmId: 81, unit: 'V', type: 'number', role: 'value.voltage' },
 { id: 'solar.chargeState', name: { en: 'Charge State', de: 'Ladezustand' }, vrmId: 85, unit: '', type: 'number', role: 'value' },
 { id: 'solar.temperature', name: { en: 'Battery Temp', de: 'Batterietemperatur' }, vrmId: 83, unit: '°C', type: 'number', role: 'value.temperature'},
 { id: 'solar.yieldToday', name: { en: 'Yield Today', de: 'Ertrag heute' }, vrmId: 94, unit: 'kWh', type: 'number', role: 'value.energy' },
 { id: 'solar.yieldYesterday', name: { en: 'Yield Yesterday', de: 'Ertrag gestern' }, vrmId: 96, unit: 'kWh', type: 'number', role: 'value.energy' },
 { id: 'solar.relayStatus', name: { en: 'Relay Status', de: 'Relais-Status' }, vrmId: 90, unit: '', type: 'number', role: 'value' },
];

// ─── System Overview / ESS (5) ───────────────────────────────────────────────
const SYSTEM_SENSORS = [
 { id: 'system.ess.batteryLifeState', name: { en: 'ESS BatteryLife State', de: 'ESS BatteryLife Zustand' }, vrmId: 332, unit: '', type: 'number', role: 'value' },
 { id: 'system.ess.batteryLifeSocLimit', name: { en: 'ESS BatteryLife SoC Limit', de: 'ESS BatteryLife SoC-Limit' }, vrmId: 333, unit: '%', type: 'number', role: 'value' },
 { id: 'system.ess.minSoc', name: { en: 'ESS Minimum SoC', de: 'ESS Minimum SoC' }, vrmId: 334, unit: '%', type: 'number', role: 'value' },
 { id: 'system.ess.scheduledCharging', name: { en: 'ESS Scheduled Charging', de: 'ESS Geplantes Laden' }, vrmId: 469, unit: '', type: 'number', role: 'value' },
];

// ─── Overall Stats keys ───────────────────────────────────────────────────────
// Source: GET /installations/{id}/overallstats?type=custom&attributeCodes[]=Pc&...
// Response: { records: { today: { totals: {Pc, Pb, Pg, Gc, Gb, Bc, Bg} }, week: {...}, month: {...}, year: {...} } }
// NOTE: /stats?type=kwh returns empty arrays – WRONG endpoint, use /overallstats!
const OVERALL_STAT_KEYS = [
 { id: 'overall.pvToConsumers', name: { en: 'PV to Consumers', de: 'PV → Verbraucher' }, key: 'Pc', unit: 'kWh' },
 { id: 'overall.pvToBattery', name: { en: 'PV to Battery', de: 'PV → Batterie' }, key: 'Pb', unit: 'kWh' },
 { id: 'overall.pvToGrid', name: { en: 'PV to Grid', de: 'PV → Netz' }, key: 'Pg', unit: 'kWh' },
 { id: 'overall.gridToConsumers', name: { en: 'Grid to Consumers', de: 'Netz → Verbraucher' }, key: 'Gc', unit: 'kWh' },
 { id: 'overall.gridToBattery', name: { en: 'Grid to Battery', de: 'Netz → Batterie' }, key: 'Gb', unit: 'kWh' },
 { id: 'overall.batteryToConsumers', name: { en: 'Battery to Consumers', de: 'Batterie → Verbraucher' }, key: 'Bc', unit: 'kWh' },
 { id: 'overall.batteryToGrid', name: { en: 'Battery to Grid', de: 'Batterie → Netz' }, key: 'Bg', unit: 'kWh' },
];

// API period keys from /overallstats response (today/week/month/year – NOT this_week!)
const OVERALL_PERIODS = [
 { suffix: 'Today', apiKey: 'today', label: { en: 'Today', de: 'Heute' } },
 { suffix: 'ThisWeek', apiKey: 'week', label: { en: 'This Week', de: 'Diese Woche' } },
 { suffix: 'ThisMonth', apiKey: 'month', label: { en: 'This Month', de: 'Dieser Monat' } },
 { suffix: 'ThisYear', apiKey: 'year', label: { en: 'This Year', de: 'Dieses Jahr' } },
];

// ─── Text-state definitions (stateText etc.) ──────────────────────────────────
const TEXT_STATES = [
 { id: 'multiplus.stateText', name: { en: 'VE.Bus State Text', de: 'VE.Bus Zustand (Text)' }, type: 'string', role: 'text' },
 { id: 'solar.chargeStateText', name: { en: 'Charge State Text', de: 'Ladezustand (Text)' }, type: 'string', role: 'text' },
];

// ─── Meta states ──────────────────────────────────────────────────────────────
const META_STATES = [
 { id: 'meta.siteName', name: { en: 'Site Name', de: 'Anlagenname' }, type: 'string', role: 'text' },
 { id: 'meta.idSite', name: { en: 'Installation ID', de: 'Installations-ID' }, type: 'number', role: 'value' },
 { id: 'meta.timezone', name: { en: 'Timezone', de: 'Zeitzone' }, type: 'string', role: 'text' },
 { id: 'meta.country', name: { en: 'Country', de: 'Land' }, type: 'string', role: 'text' },
 { id: 'meta.lastUpdate', name: { en: 'Last Update', de: 'Letzter Abruf' }, type: 'string', role: 'date' },
 { id: 'meta.lastStatsUpdate', name: { en: 'Last Stats Update', de: 'Letzter Stats-Abruf' }, type: 'string', role: 'date' },
 { id: 'meta.activeAlarmCount',name: { en: 'Active Alarm Count', de: 'Aktive Alarme' }, type: 'number', role: 'value' },
 { id: 'meta.alarmsJson', name: { en: 'Active Alarms (JSON)', de: 'Aktive Alarme (JSON)' }, type: 'string', role: 'json' },
];

// ─── Aggregated list ──────────────────────────────────────────────────────────
const ALL_SENSORS = [
 ...BATTERY_SENSORS,
 ...MULTIPLUS_SENSORS,
 ...GRID_SENSORS,
 ...PVINVERTER_SENSORS,
 ...TANK_SENSORS,
 ...SOLAR_SENSORS,
 ...SYSTEM_SENSORS,
];

// ─── Text mappings ────────────────────────────────────────────────────────────
const VEBUS_STATE_TEXT = {
 0: 'Off', 1: 'Low Power', 2: 'Fault', 3: 'Bulk', 4: 'Absorption',
 5: 'Float', 6: 'Storage', 7: 'Equalize', 8: 'Passthru', 9: 'Inverting',
 10: 'Power Assist', 11: 'Power Supply', 244: 'Sustain', 252: 'External Control',
};

const SOLAR_CHARGE_STATE_TEXT = {
 0: 'Off', 2: 'Fault', 3: 'Bulk', 4: 'Absorption', 5: 'Float',
 6: 'Storage', 7: 'Equalize', 11: 'Other (Hub-1)', 252: 'External Control',
};

// ─── Channel definitions ──────────────────────────────────────────────────────
// device → channel → state (guide: alle Zwischenobjekte explizit anlegen!)
const CHANNELS = {
 battery: { name: { en: 'Battery', de: 'Batterie' } },
 'battery.alarms':{ name: { en: 'Battery Alarms', de: 'Batterie Alarme' } },
 multiplus: { name: { en: 'MultiPlus / VE.Bus',de: 'MultiPlus / VE.Bus'} },
 'multiplus.acInput': { name: { en: 'AC Input', de: 'AC Eingang' } },
 'multiplus.acOutput': { name: { en: 'AC Output', de: 'AC Ausgang' } },
 'multiplus.dc': { name: { en: 'DC Bus', de: 'DC Bus' } },
 grid: { name: { en: 'Grid Meter', de: 'Netz (Grid Meter)'} },
 pvInverter: { name: { en: 'PV Inverter', de: 'PV-Wechselrichter'} },
 tank: { name: { en: 'Tank', de: 'Tank' } },
 solar: { name: { en: 'Solar Charger', de: 'Solar Charger' } },
 system: { name: { en: 'System Overview', de: 'System Übersicht' } },
 'system.ess': { name: { en: 'ESS', de: 'ESS' } },
 overall: { name: { en: 'Overall Stats', de: 'Overall Stats' } },
 meta: { name: { en: 'Meta / Info', de: 'Meta / Info' } },
};

module.exports = {
 ALL_SENSORS,
 BATTERY_SENSORS, MULTIPLUS_SENSORS, GRID_SENSORS,
 PVINVERTER_SENSORS, TANK_SENSORS, SOLAR_SENSORS, SYSTEM_SENSORS,
 OVERALL_STAT_KEYS, OVERALL_PERIODS,
 TEXT_STATES, META_STATES, CHANNELS,
 VEBUS_STATE_TEXT, SOLAR_CHARGE_STATE_TEXT,
};
