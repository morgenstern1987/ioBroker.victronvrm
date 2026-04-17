'use strict';

/**
 * Datenpunkt-Definitionen für den Victron VRM Adapter.
 *
 * STATE_OVERVIEW: Mapping aus system-overview API-Feldern → ioBroker-States
 * STATE_DIAG:     Datenpunkte die aus /diagnostics befüllt werden
 * CHANNELS:       Kanal-Definitionen
 *
 * Format STATE_OVERVIEW:
 *   'vrmKey': { id, name, type, role, unit, write }
 */

// ─── Kanäle ───────────────────────────────────────────────────────────────────

const CHANNELS = {
    'battery':   'Batterie',
    'pv':        'PV / Solar',
    'grid':      'Netz',
    'load':      'Verbraucher',
    'genset':    'Generator',
    'vebus':     'VE.Bus (Multi/Quattro)',
    'alarms':    'Alarme',
    'meta':      'Meta / Anlage',
};

// ─── system-overview Mapping ──────────────────────────────────────────────────

/**
 * Jedes Key entspricht einem Feld aus dem /system-overview response.
 * id = ioBroker State-ID (relativ zum Adapter-Namespace)
 */
const STATE_OVERVIEW = {
    // Batterie
    batterySoc:              { id: 'battery.soc',              name: 'State of Charge',        type: 'number',  role: 'value.battery',        unit: '%'  },
    batteryVoltage:          { id: 'battery.voltage',          name: 'Spannung',               type: 'number',  role: 'value.voltage',        unit: 'V'  },
    batteryCurrent:          { id: 'battery.current',          name: 'Strom',                  type: 'number',  role: 'value.current',        unit: 'A'  },
    batteryPower:            { id: 'battery.power',            name: 'Leistung',               type: 'number',  role: 'value.power',          unit: 'W'  },
    batteryState:            { id: 'battery.state',            name: 'Zustand',                type: 'number',  role: 'value',                unit: ''   },
    batteryTemperature:      { id: 'battery.temperature',      name: 'Temperatur',             type: 'number',  role: 'value.temperature',    unit: '°C' },
    batteryTimeToGo:         { id: 'battery.timeToGo',         name: 'Verbleibende Zeit',      type: 'number',  role: 'value',                unit: 's'  },
    batteryConsumedAh:       { id: 'battery.consumedAh',       name: 'Verbrauchte Amperestunden', type: 'number', role: 'value',             unit: 'Ah' },

    // PV
    pvPower:                 { id: 'pv.power',                 name: 'PV Leistung',            type: 'number',  role: 'value.power',          unit: 'W'  },
    pvCurrent:               { id: 'pv.current',               name: 'PV Strom',               type: 'number',  role: 'value.current',        unit: 'A'  },
    pvVoltage:               { id: 'pv.voltage',               name: 'PV Spannung',            type: 'number',  role: 'value.voltage',        unit: 'V'  },
    pvYieldToday:            { id: 'pv.yieldToday',            name: 'Ertrag heute',           type: 'number',  role: 'value.energy',         unit: 'kWh'},
    pvYieldYesterday:        { id: 'pv.yieldYesterday',        name: 'Ertrag gestern',         type: 'number',  role: 'value.energy',         unit: 'kWh'},

    // Netz
    gridPower:               { id: 'grid.power',               name: 'Netzleistung',           type: 'number',  role: 'value.power',          unit: 'W'  },
    gridPowerL1:             { id: 'grid.powerL1',             name: 'Netz L1',                type: 'number',  role: 'value.power',          unit: 'W'  },
    gridPowerL2:             { id: 'grid.powerL2',             name: 'Netz L2',                type: 'number',  role: 'value.power',          unit: 'W'  },
    gridPowerL3:             { id: 'grid.powerL3',             name: 'Netz L3',                type: 'number',  role: 'value.power',          unit: 'W'  },
    gridVoltageL1:           { id: 'grid.voltageL1',           name: 'Netzspannung L1',        type: 'number',  role: 'value.voltage',        unit: 'V'  },
    gridVoltageL2:           { id: 'grid.voltageL2',           name: 'Netzspannung L2',        type: 'number',  role: 'value.voltage',        unit: 'V'  },
    gridVoltageL3:           { id: 'grid.voltageL3',           name: 'Netzspannung L3',        type: 'number',  role: 'value.voltage',        unit: 'V'  },

    // Verbraucher
    loadPower:               { id: 'load.power',               name: 'Verbraucher Leistung',   type: 'number',  role: 'value.power',          unit: 'W'  },
    loadPowerL1:             { id: 'load.powerL1',             name: 'Verbraucher L1',         type: 'number',  role: 'value.power',          unit: 'W'  },
    loadPowerL2:             { id: 'load.powerL2',             name: 'Verbraucher L2',         type: 'number',  role: 'value.power',          unit: 'W'  },
    loadPowerL3:             { id: 'load.powerL3',             name: 'Verbraucher L3',         type: 'number',  role: 'value.power',          unit: 'W'  },

    // Generator
    gensetPower:             { id: 'genset.power',             name: 'Generator Leistung',     type: 'number',  role: 'value.power',          unit: 'W'  },

    // VE.Bus
    vebusState:              { id: 'vebus.state',              name: 'VE.Bus Zustand',         type: 'number',  role: 'value',                unit: ''   },
    vebusError:              { id: 'vebus.error',              name: 'VE.Bus Fehler',          type: 'number',  role: 'value',                unit: ''   },
    vebusSoc:                { id: 'vebus.soc',                name: 'VE.Bus SoC',             type: 'number',  role: 'value.battery',        unit: '%'  },
    vebusChargeState:        { id: 'vebus.chargeState',        name: 'Ladezustand',            type: 'number',  role: 'value',                unit: ''   },
    activeInputSource:       { id: 'vebus.activeInput',        name: 'Aktive Eingangsquelle',  type: 'number',  role: 'value',                unit: ''   },
};

// ─── Feste ioBroker-States (nicht aus API-Feldern) ────────────────────────────

const STATE_STATIC = {
    // Alarme
    'alarms.count':          { name: 'Anzahl aktiver Alarme',  type: 'number',  role: 'value',       unit: ''   },
    'alarms.json':           { name: 'Alarme (JSON)',           type: 'string',  role: 'json',         unit: ''   },

    // Meta
    'meta.siteName':         { name: 'Anlagen-Name',            type: 'string',  role: 'text',         unit: ''   },
    'meta.idSite':           { name: 'Installations-ID',        type: 'number',  role: 'value',        unit: ''   },
    'meta.timezone':         { name: 'Zeitzone',                type: 'string',  role: 'text',         unit: ''   },
    'meta.country':          { name: 'Land',                    type: 'string',  role: 'text',         unit: ''   },
    'meta.lastUpdate':       { name: 'Letzter Abruf',           type: 'string',  role: 'date',         unit: ''   },
    'meta.lastDiagUpdate':   { name: 'Letzter Diagnose-Abruf',  type: 'string',  role: 'date',         unit: ''   },

    // Batterie-Berechnungen
    'battery.stateText':     { name: 'Zustand (Text)',          type: 'string',  role: 'text',         unit: ''   },
    'battery.timeToGoHours': { name: 'Verbleibende Zeit (Std)', type: 'number',  role: 'value',        unit: 'h'  },

    // Netz-Summe
    'grid.powerTotal':       { name: 'Netz Gesamt',             type: 'number',  role: 'value.power',  unit: 'W'  },
};

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

/** Batterie-Zustand als Text */
function batteryStateText(state) {
    return { 0: 'Idle', 1: 'Lädt', 2: 'Entlädt' }[state] || `Unbekannt (${state})`;
}

/** VE.Bus-Zustand als Text */
function vebusStateText(state) {
    const map = {
        0: 'Off', 1: 'Low Power', 2: 'Fault', 3: 'Bulk', 4: 'Absorption',
        5: 'Float', 6: 'Storage', 7: 'Equalize', 8: 'Passthru', 9: 'Inverting',
        10: 'Power Assist', 11: 'Power Supply', 244: 'Sustain', 252: 'External Control',
    };
    return map[state] || `Unbekannt (${state})`;
}

/** Sekunden → Stunden, auf 2 Dezimalstellen gerundet */
function secondsToHours(s) {
    return Math.round((s / 3600) * 100) / 100;
}

/** Unix-Timestamp für heute 00:00 UTC */
function todayStart() {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    return Math.floor(d.getTime() / 1000);
}

/** Unix-Timestamp für jetzt */
function nowUnix() {
    return Math.floor(Date.now() / 1000);
}

module.exports = {
    CHANNELS,
    STATE_OVERVIEW,
    STATE_STATIC,
    batteryStateText,
    vebusStateText,
    secondsToHours,
    todayStart,
    nowUnix,
};
