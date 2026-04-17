'use strict';

/**
 * Sensor-Definitionen für den Victron VRM ioBroker Adapter
 * Basierend auf: hass-victron-vrm-api (jayjojayson) + VRM API v2 Doku
 *
 * Jeder Eintrag:
 *   id         ioBroker State-ID (relativ zum Adapter-Namespace)
 *   name       Anzeigename
 *   vrmId      VRM Attribut-ID (Zahl) oder Key-String für overall-stats
 *   unit       Einheit
 *   type       ioBroker Typ: 'number' | 'string' | 'boolean'
 *   role       ioBroker Rolle
 *   calc       optional: Berechnungsfunktion (erhält das gesamte device-Objekt)
 *   isAlarm    true = Alarm-State (0=OK, 1=Warning, 2=Alarm)
 *
 * API-Endpunkte:
 *   /installations/{id}/diagnostics          → liefert Array mit {idDataAttribute, rawValue, ...}
 *   /installations/{id}/system-overview      → liefert {devices: [{...}], records: {...}}
 *   /installations/{id}/stats                → Zeitreihen/Overall-Stats
 */

// ─── Batterie ─────────────────────────────────────────────────────────────────
const BATTERY_SENSORS = [
    { id: 'battery.soc',                   name: 'State of Charge',               vrmId: 51,   unit: '%',   type: 'number',  role: 'value.battery'     },
    { id: 'battery.voltage',               name: 'Spannung',                       vrmId: 47,   unit: 'V',   type: 'number',  role: 'value.voltage'     },
    { id: 'battery.current',               name: 'Strom',                          vrmId: 49,   unit: 'A',   type: 'number',  role: 'value.current'     },
    { id: 'battery.consumedAh',            name: 'Verbrauchte Amperestunden',      vrmId: 50,   unit: 'Ah',  type: 'number',  role: 'value'             },
    { id: 'battery.timeToGo',              name: 'Verbleibende Zeit',              vrmId: 52,   unit: 'h',   type: 'number',  role: 'value'             },
    { id: 'battery.temperature',           name: 'Temperatur',                     vrmId: 115,  unit: '°C',  type: 'number',  role: 'value.temperature' },
    { id: 'battery.minCellVoltage',        name: 'Min. Zellspannung (BMS)',        vrmId: 173,  unit: 'V',   type: 'number',  role: 'value.voltage'     },
    { id: 'battery.maxCellVoltage',        name: 'Max. Zellspannung (BMS)',        vrmId: 174,  unit: 'V',   type: 'number',  role: 'value.voltage'     },
    { id: 'battery.cellVoltageDiff',       name: 'Zellspannungsdifferenz',         vrmId: null, unit: 'V',   type: 'number',  role: 'value.voltage',
      calc: d => d[174] != null && d[173] != null ? Math.round((d[174] - d[173]) * 1000) / 1000 : null },
    { id: 'battery.power',                 name: 'Leistung',                       vrmId: null, unit: 'W',   type: 'number',  role: 'value.power',
      calc: d => d[47] != null && d[49] != null ? Math.round(d[47] * d[49]) : null },
    { id: 'battery.chargeCycles',          name: 'Ladezyklen',                     vrmId: 58,   unit: '',    type: 'number',  role: 'value'             },
    { id: 'battery.energyToConsumersToday',name: 'Batterie → Verbraucher (heute)', vrmId: 'Bc', unit: 'kWh', type: 'number',  role: 'value.energy'      },
    { id: 'battery.energyToGridToday',     name: 'Batterie → Netz (heute)',        vrmId: 'Bg', unit: 'kWh', type: 'number',  role: 'value.energy'      },
    // Alarme
    { id: 'battery.alarms.lowVoltage',           name: 'Alarm: Unterspannung',          vrmId: 119, unit: '', type: 'number', role: 'value', isAlarm: true },
    { id: 'battery.alarms.highVoltage',          name: 'Alarm: Überspannung',           vrmId: 120, unit: '', type: 'number', role: 'value', isAlarm: true },
    { id: 'battery.alarms.lowStarterVoltage',    name: 'Alarm: Starterbatterie min.',   vrmId: 121, unit: '', type: 'number', role: 'value', isAlarm: true },
    { id: 'battery.alarms.highStarterVoltage',   name: 'Alarm: Starterbatterie max.',   vrmId: 122, unit: '', type: 'number', role: 'value', isAlarm: true },
    { id: 'battery.alarms.lowSoc',               name: 'Alarm: SoC zu niedrig',         vrmId: 123, unit: '', type: 'number', role: 'value', isAlarm: true },
    { id: 'battery.alarms.lowTemperature',       name: 'Alarm: Temp. zu niedrig',       vrmId: 124, unit: '', type: 'number', role: 'value', isAlarm: true },
    { id: 'battery.alarms.highTemperature',      name: 'Alarm: Temp. zu hoch',          vrmId: 125, unit: '', type: 'number', role: 'value', isAlarm: true },
    { id: 'battery.alarms.midVoltage',           name: 'Alarm: Mid-Voltage',            vrmId: 126, unit: '', type: 'number', role: 'value', isAlarm: true },
    { id: 'battery.alarms.lowFusedVoltage',      name: 'Alarm: Gesich.-Spannung min.',  vrmId: 155, unit: '', type: 'number', role: 'value', isAlarm: true },
    { id: 'battery.alarms.highFusedVoltage',     name: 'Alarm: Gesich.-Spannung max.',  vrmId: 156, unit: '', type: 'number', role: 'value', isAlarm: true },
    { id: 'battery.alarms.fuseBlown',            name: 'Alarm: Sicherung ausgelöst',    vrmId: 157, unit: '', type: 'number', role: 'value', isAlarm: true },
    { id: 'battery.alarms.highInternalTemp',     name: 'Alarm: Innentemperatur hoch',   vrmId: 158, unit: '', type: 'number', role: 'value', isAlarm: true },
    { id: 'battery.alarms.cellImbalance',        name: 'Alarm: Zellungleichgewicht',    vrmId: 286, unit: '', type: 'number', role: 'value', isAlarm: true },
    { id: 'battery.alarms.highChargeCurrent',    name: 'Alarm: Ladestrom zu hoch',      vrmId: 287, unit: '', type: 'number', role: 'value', isAlarm: true },
    { id: 'battery.alarms.highDischargeCurrent', name: 'Alarm: Entladestrom zu hoch',   vrmId: 288, unit: '', type: 'number', role: 'value', isAlarm: true },
    { id: 'battery.alarms.internalFailure',      name: 'Alarm: Interner Fehler',        vrmId: 289, unit: '', type: 'number', role: 'value', isAlarm: true },
    { id: 'battery.alarms.highChargeTemp',       name: 'Alarm: Ladetemp. zu hoch',      vrmId: 459, unit: '', type: 'number', role: 'value', isAlarm: true },
    { id: 'battery.alarms.lowChargeTemp',        name: 'Alarm: Ladetemp. zu niedrig',   vrmId: 460, unit: '', type: 'number', role: 'value', isAlarm: true },
    { id: 'battery.alarms.lowCellVoltage',       name: 'Alarm: Zellspannung niedrig',   vrmId: 522, unit: '', type: 'number', role: 'value', isAlarm: true },
    { id: 'battery.alarms.chargeBlocked',        name: 'Alarm: Laden gesperrt (BMS)',   vrmId: 739, unit: '', type: 'number', role: 'value', isAlarm: true },
    { id: 'battery.alarms.dischargeBlocked',     name: 'Alarm: Entladen gesperrt (BMS)',vrmId: 740, unit: '', type: 'number', role: 'value', isAlarm: true },
];

// ─── MultiPlus / VE.Bus ───────────────────────────────────────────────────────
const MULTIPLUS_SENSORS = [
    { id: 'multiplus.acInput.voltageL1',   name: 'AC Eingangsspannung L1',         vrmId: 8,    unit: 'V',   type: 'number',  role: 'value.voltage' },
    { id: 'multiplus.acInput.powerL1',     name: 'AC Eingangsleistung L1',         vrmId: 17,   unit: 'W',   type: 'number',  role: 'value.power'   },
    { id: 'multiplus.acOutput.voltageL1',  name: 'AC Ausgangsspannung L1',         vrmId: 20,   unit: 'V',   type: 'number',  role: 'value.voltage' },
    { id: 'multiplus.acOutput.powerL1',    name: 'AC Ausgangsleistung L1',         vrmId: 29,   unit: 'W',   type: 'number',  role: 'value.power'   },
    { id: 'multiplus.dc.voltage',          name: 'DC Bus Spannung',                vrmId: 32,   unit: 'V',   type: 'number',  role: 'value.voltage' },
    { id: 'multiplus.dc.current',          name: 'DC Bus Strom',                   vrmId: 33,   unit: 'A',   type: 'number',  role: 'value.current' },
    { id: 'multiplus.state',               name: 'VE.Bus Zustand',                 vrmId: 40,   unit: '',    type: 'number',  role: 'value'         },
    { id: 'multiplus.temperature',         name: 'Temperatur',                     vrmId: 521,  unit: '°C',  type: 'number',  role: 'value.temperature' },
    { id: 'multiplus.dc.power',            name: 'DC Bus Leistung',                vrmId: null, unit: 'W',   type: 'number',  role: 'value.power',
      calc: d => d[32] != null && d[33] != null ? Math.round(d[32] * d[33]) : null },
    { id: 'multiplus.soc',                 name: 'System SoC',                     vrmId: 144,  unit: '%',   type: 'number',  role: 'value.battery' },
    { id: 'multiplus.energyGridToConsumersToday', name: 'Netz → Verbraucher (heute)', vrmId: 'Gc', unit: 'kWh', type: 'number', role: 'value.energy' },
    { id: 'multiplus.energyGridToBatteryToday',   name: 'Netz → Batterie (heute)',    vrmId: 'Gb', unit: 'kWh', type: 'number', role: 'value.energy' },
];

// ─── Grid Meter ───────────────────────────────────────────────────────────────
const GRID_SENSORS = [
    { id: 'grid.voltageL1',   name: 'Spannung L1',      vrmId: 834,  unit: 'V',  type: 'number', role: 'value.voltage' },
    { id: 'grid.currentL1',   name: 'Strom L1',         vrmId: 835,  unit: 'A',  type: 'number', role: 'value.current' },
    { id: 'grid.powerL1',     name: 'Leistung L1',      vrmId: 379,  unit: 'W',  type: 'number', role: 'value.power'   },
    { id: 'grid.voltageL2',   name: 'Spannung L2',      vrmId: 837,  unit: 'V',  type: 'number', role: 'value.voltage' },
    { id: 'grid.currentL2',   name: 'Strom L2',         vrmId: 838,  unit: 'A',  type: 'number', role: 'value.current' },
    { id: 'grid.powerL2',     name: 'Leistung L2',      vrmId: 380,  unit: 'W',  type: 'number', role: 'value.power'   },
    { id: 'grid.voltageL3',   name: 'Spannung L3',      vrmId: 840,  unit: 'V',  type: 'number', role: 'value.voltage' },
    { id: 'grid.currentL3',   name: 'Strom L3',         vrmId: 841,  unit: 'A',  type: 'number', role: 'value.current' },
    { id: 'grid.powerL3',     name: 'Leistung L3',      vrmId: 381,  unit: 'W',  type: 'number', role: 'value.power'   },
    { id: 'grid.powerTotal',  name: 'Gesamtleistung',   vrmId: null, unit: 'W',  type: 'number', role: 'value.power',
      calc: d => d[379] != null || d[380] != null || d[381] != null
              ? (d[379] || 0) + (d[380] || 0) + (d[381] || 0) : null },
];

// ─── PV Inverter ──────────────────────────────────────────────────────────────
const PVINVERTER_SENSORS = [
    { id: 'pvInverter.voltageL1',          name: 'Spannung L1',                    vrmId: 203,  unit: 'V',   type: 'number', role: 'value.voltage' },
    { id: 'pvInverter.currentL1',          name: 'Strom L1',                       vrmId: 204,  unit: 'A',   type: 'number', role: 'value.current' },
    { id: 'pvInverter.powerL1',            name: 'Leistung L1',                    vrmId: 205,  unit: 'W',   type: 'number', role: 'value.power'   },
    { id: 'pvInverter.energyL1',           name: 'Energie L1 (Gesamt)',            vrmId: 206,  unit: 'kWh', type: 'number', role: 'value.energy'  },
    { id: 'pvInverter.voltageL2',          name: 'Spannung L2',                    vrmId: 207,  unit: 'V',   type: 'number', role: 'value.voltage' },
    { id: 'pvInverter.currentL2',          name: 'Strom L2',                       vrmId: 208,  unit: 'A',   type: 'number', role: 'value.current' },
    { id: 'pvInverter.powerL2',            name: 'Leistung L2',                    vrmId: 209,  unit: 'W',   type: 'number', role: 'value.power'   },
    { id: 'pvInverter.energyL2',           name: 'Energie L2 (Gesamt)',            vrmId: 210,  unit: 'kWh', type: 'number', role: 'value.energy'  },
    { id: 'pvInverter.voltageL3',          name: 'Spannung L3',                    vrmId: 211,  unit: 'V',   type: 'number', role: 'value.voltage' },
    { id: 'pvInverter.currentL3',          name: 'Strom L3',                       vrmId: 212,  unit: 'A',   type: 'number', role: 'value.current' },
    { id: 'pvInverter.powerL3',            name: 'Leistung L3',                    vrmId: 213,  unit: 'W',   type: 'number', role: 'value.power'   },
    { id: 'pvInverter.energyL3',           name: 'Energie L3 (Gesamt)',            vrmId: 214,  unit: 'kWh', type: 'number', role: 'value.energy'  },
    { id: 'pvInverter.status',             name: 'Status',                         vrmId: 246,  unit: '',    type: 'number', role: 'value'         },
    { id: 'pvInverter.energyToConsumersToday', name: 'PV → Verbraucher (heute)',   vrmId: 'Pc', unit: 'kWh', type: 'number', role: 'value.energy'  },
    { id: 'pvInverter.energyToBatteryToday',   name: 'PV → Batterie (heute)',      vrmId: 'Pb', unit: 'kWh', type: 'number', role: 'value.energy'  },
    { id: 'pvInverter.energyToGridToday',      name: 'PV → Netz (heute)',          vrmId: 'Pg', unit: 'kWh', type: 'number', role: 'value.energy'  },
    { id: 'pvInverter.totalYieldToday',    name: 'PV Gesamt heute (Pc+Pb+Pg)',    vrmId: null, unit: 'kWh', type: 'number', role: 'value.energy',
      calc: d => {
          const pc = d['Pc'], pb = d['Pb'], pg = d['Pg'];
          if (pc == null && pb == null && pg == null) return null;
          return Math.round(((pc || 0) + (pb || 0) + (pg || 0)) * 100) / 100;
      }},
];

// ─── Tank ─────────────────────────────────────────────────────────────────────
const TANK_SENSORS = [
    { id: 'tank.capacity',  name: 'Tankkapazität',  vrmId: 328, unit: 'm³', type: 'number', role: 'value'    },
    { id: 'tank.type',      name: 'Flüssigkeitstyp',vrmId: 329, unit: '',   type: 'number', role: 'value'    },
    { id: 'tank.level',     name: 'Füllstand',      vrmId: 330, unit: '%',  type: 'number', role: 'value'    },
    { id: 'tank.remaining', name: 'Verbleibend',    vrmId: 331, unit: 'm³', type: 'number', role: 'value'    },
    { id: 'tank.status',    name: 'Status',         vrmId: 443, unit: '',   type: 'number', role: 'value'    },
    { id: 'tank.name',      name: 'Benutzerdefined. Name', vrmId: 638, unit: '', type: 'string', role: 'text'},
];

// ─── Solar Charger ────────────────────────────────────────────────────────────
const SOLAR_SENSORS = [
    { id: 'solar.power',         name: 'Ladeleistung',           vrmId: 107, unit: 'W',   type: 'number', role: 'value.power'   },
    { id: 'solar.voltage',       name: 'Batteriespannung',       vrmId: 81,  unit: 'V',   type: 'number', role: 'value.voltage' },
    { id: 'solar.chargeState',   name: 'Ladezustand',            vrmId: 85,  unit: '',    type: 'number', role: 'value'         },
    { id: 'solar.temperature',   name: 'Batterietemperatur',     vrmId: 83,  unit: '°C',  type: 'number', role: 'value.temperature' },
    { id: 'solar.yieldToday',    name: 'Ertrag heute',           vrmId: 94,  unit: 'kWh', type: 'number', role: 'value.energy'  },
    { id: 'solar.yieldYesterday',name: 'Ertrag gestern',         vrmId: 96,  unit: 'kWh', type: 'number', role: 'value.energy'  },
    { id: 'solar.relayStatus',   name: 'Relais',                 vrmId: 90,  unit: '',    type: 'number', role: 'value'         },
];

// ─── System Overview ──────────────────────────────────────────────────────────
const SYSTEM_SENSORS = [
    { id: 'system.ess.batteryLifeState',   name: 'ESS BatteryLife Zustand',        vrmId: 332, unit: '',  type: 'number', role: 'value' },
    { id: 'system.ess.batteryLifeSocLimit',name: 'ESS BatteryLife SoC-Limit',      vrmId: 333, unit: '%', type: 'number', role: 'value' },
    { id: 'system.ess.minSoc',             name: 'ESS Minimum SoC',               vrmId: 334, unit: '%', type: 'number', role: 'value' },
    { id: 'system.ess.scheduledCharging',  name: 'ESS Geplantes Laden',           vrmId: 469, unit: '',  type: 'number', role: 'value' },
];

// ─── Overall Stats ────────────────────────────────────────────────────────────
// Diese kommen aus /installations/{id}/stats (overall-stats Endpoint)
// Werden für Perioden: today, thisWeek, thisMonth, thisYear berechnet
const OVERALL_STAT_KEYS = [
    { id: 'overall.batteriesPowerTotal',   name: 'Batterien Gesamtleistung',       key: 'vrm_batteries_power_total',       unit: 'W'   },
    { id: 'overall.pvInverterPowerTotal',  name: 'PV-Wechselrichter Gesamtleis.',  key: 'vrm_pv_inverters_power_total',    unit: 'W'   },
    { id: 'overall.solarChargerPowerTotal',name: 'Solarladegerät Gesamtleistung',  key: 'vrm_solar_chargers_power_total',  unit: 'W'   },
    { id: 'overall.dcLoads',               name: 'DC Lasten',                       key: 'vrm_dc_loads',                    unit: 'W'   },
    { id: 'overall.totalSolarYield',       name: 'PV Gesamtertrag',                key: 'total_solar_yield',               unit: 'kWh' },
    { id: 'overall.totalConsumption',      name: 'Gesamtverbrauch',                key: 'total_consumption',               unit: 'kWh' },
    { id: 'overall.gridEnergyIn',          name: 'Netz Bezug',                     key: 'grid_history_from',               unit: 'kWh' },
    { id: 'overall.gridEnergyOut',         name: 'Netz Einspeisung',               key: 'grid_history_to',                 unit: 'kWh' },
];

// Perioden für Overall-Stats
const OVERALL_PERIODS = [
    { suffix: 'Today',     label: 'Heute' },
    { suffix: 'ThisWeek',  label: 'Diese Woche' },
    { suffix: 'ThisMonth', label: 'Dieser Monat' },
    { suffix: 'ThisYear',  label: 'Dieses Jahr' },
];

// ─── Meta / Info ──────────────────────────────────────────────────────────────
const META_STATES = [
    { id: 'meta.siteName',       name: 'Anlagen-Name',              type: 'string', role: 'text' },
    { id: 'meta.idSite',         name: 'Installations-ID',           type: 'number', role: 'value' },
    { id: 'meta.timezone',       name: 'Zeitzone',                   type: 'string', role: 'text' },
    { id: 'meta.country',        name: 'Land',                       type: 'string', role: 'text' },
    { id: 'meta.lastUpdate',     name: 'Letzter Abruf',              type: 'string', role: 'date' },
    { id: 'meta.lastStatsUpdate',name: 'Letzter Stats-Abruf',        type: 'string', role: 'date' },
    { id: 'battery.stateText',   name: 'Batterie-Zustand (Text)',    type: 'string', role: 'text' },
    { id: 'multiplus.stateText', name: 'MultiPlus-Zustand (Text)',   type: 'string', role: 'text' },
    { id: 'solar.chargeStateText',name:'Solar Ladezustand (Text)',   type: 'string', role: 'text' },
];

// ─── Lookup-Maps ──────────────────────────────────────────────────────────────

/** Alle Sensor-Listen zusammengeführt */
const ALL_SENSORS = [
    ...BATTERY_SENSORS,
    ...MULTIPLUS_SENSORS,
    ...GRID_SENSORS,
    ...PVINVERTER_SENSORS,
    ...TANK_SENSORS,
    ...SOLAR_SENSORS,
    ...SYSTEM_SENSORS,
];

/** Map: vrmId (Zahl oder String) → Array von Sensor-Definitionen */
const VRM_ID_MAP = new Map();
for (const s of ALL_SENSORS) {
    if (s.vrmId == null) continue;
    if (!VRM_ID_MAP.has(s.vrmId)) VRM_ID_MAP.set(s.vrmId, []);
    VRM_ID_MAP.get(s.vrmId).push(s);
}

// ─── Text-Mappings ────────────────────────────────────────────────────────────

const BATTERY_STATE_TEXT = {
    0: 'Idle', 1: 'Lädt', 2: 'Entlädt',
};

const VEBUS_STATE_TEXT = {
    0: 'Off', 1: 'Low Power', 2: 'Fault', 3: 'Bulk', 4: 'Absorption',
    5: 'Float', 6: 'Storage', 7: 'Equalize', 8: 'Passthru', 9: 'Inverting',
    10: 'Power Assist', 11: 'Power Supply', 244: 'Sustain', 252: 'External Control',
};

const SOLAR_CHARGE_STATE_TEXT = {
    0: 'Off', 2: 'Fault', 3: 'Bulk', 4: 'Absorption', 5: 'Float',
    6: 'Storage', 7: 'Equalize', 11: 'Other (Hub-1)', 252: 'External Control',
};

const ESS_BATTERY_LIFE_TEXT = {
    1: 'BL Disabled', 2: 'Self-consumption', 3: 'Self-consumption (LB)', 4: 'Discharge disabled',
    5: 'Force Charge', 6: 'Sustain', 7: 'Low SOC recharge', 8: 'Keep batteries charged',
    9: 'BL Disabled (LB)', 10: 'BL Disabled - auto recharge',
};

module.exports = {
    BATTERY_SENSORS, MULTIPLUS_SENSORS, GRID_SENSORS, PVINVERTER_SENSORS,
    TANK_SENSORS, SOLAR_SENSORS, SYSTEM_SENSORS, ALL_SENSORS,
    OVERALL_STAT_KEYS, OVERALL_PERIODS, META_STATES,
    VRM_ID_MAP,
    BATTERY_STATE_TEXT, VEBUS_STATE_TEXT, SOLAR_CHARGE_STATE_TEXT, ESS_BATTERY_LIFE_TEXT,
};
