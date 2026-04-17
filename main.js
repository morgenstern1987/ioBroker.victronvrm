'use strict';

/*
 * iobroker.victronvrm  –  Victron Energy VRM API v2 Adapter  v0.3.0
 * ──────────────────────────────────────────────────────────────────
 *
 * 111 Sensoren aus:
 *   Battery (34), MultiPlus (12), Grid Meter (10),
 *   PV Inverter (17), Tank (6), Solar Charger (7),
 *   System Overview (5), Overall Stats (20)
 *
 * Datenquelle: /installations/{id}/diagnostics
 *   → liefert alle Geräte-Attribute mit ihrer VRM-ID (idDataAttribute)
 *   → Instanz-Filter über Instance-Number (instanceId) möglich
 *
 * Poll-Strategie:
 *   Schnell  (pollInterval, Standard 30s):  Diagnostics → alle 111 States
 *   Statistik (statsInterval, Standard 300s): Overall-Stats für Heute/Woche/Monat/Jahr
 *
 * Auth: Personal Access Token
 *   VRM → Nutzer-Symbol → Einstellungen → Integrationen → Access Tokens
 */

const utils = require('@iobroker/adapter-core');
const VrmApiClient = require('./lib/vrm-api');
const {
    ALL_SENSORS, OVERALL_STAT_KEYS, OVERALL_PERIODS, META_STATES,
    VRM_ID_MAP,
    BATTERY_STATE_TEXT, VEBUS_STATE_TEXT, SOLAR_CHARGE_STATE_TEXT, ESS_BATTERY_LIFE_TEXT,
    BATTERY_SENSORS, MULTIPLUS_SENSORS, GRID_SENSORS,
    PVINVERTER_SENSORS, TANK_SENSORS, SOLAR_SENSORS, SYSTEM_SENSORS,
} = require('./lib/sensor-definitions');

// ─── Kanal-Definitionen ───────────────────────────────────────────────────────
const CHANNELS = {
    battery:     'Batterie',
    multiplus:   'MultiPlus / VE.Bus',
    grid:        'Netz (Grid Meter)',
    pvInverter:  'PV-Wechselrichter',
    tank:        'Tank',
    solar:       'Solar Charger (MPPT)',
    system:      'System Overview',
    overall:     'Overall Stats',
    meta:        'Meta / Info',
};

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

/** Beginn eines Tages in Unix-Sekunden (UTC) */
function dayStart(daysAgo = 0) {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() - daysAgo);
    return Math.floor(d.getTime() / 1000);
}

/** Beginn der aktuellen Woche (Montag, UTC) */
function weekStart() {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    const day = d.getUTCDay();
    d.setUTCDate(d.getUTCDate() - ((day + 6) % 7));
    return Math.floor(d.getTime() / 1000);
}

/** Beginn des aktuellen Monats (UTC) */
function monthStart() {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(1);
    return Math.floor(d.getTime() / 1000);
}

/** Beginn des aktuellen Jahres (UTC) */
function yearStart() {
    const d = new Date(Date.UTC(new Date().getUTCFullYear(), 0, 1));
    return Math.floor(d.getTime() / 1000);
}

function nowUnix() { return Math.floor(Date.now() / 1000); }

// ─── Adapter-Klasse ───────────────────────────────────────────────────────────

class VictronVrmAdapter extends utils.Adapter {

    constructor(options = {}) {
        super({ ...options, name: 'victronvrm' });
        this.api = null;
        this.idSite = null;
        this._timerDiag  = null;
        this._timerStats = null;
        this.on('ready',  this.onReady.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }

    // ── Start ─────────────────────────────────────────────────────────────────

    async onReady() {
        const cfg = this.config;

        if (!cfg.accessToken || cfg.accessToken.trim().length < 10) {
            this.log.error('Kein gültiger Access Token! VRM → Einstellungen → Integrationen → Access Tokens');
            await this.setStateAsync('info.connection', false, true);
            return;
        }
        if (!cfg.idSite || isNaN(parseInt(cfg.idSite, 10))) {
            this.log.error('Keine gültige Installations-ID (idSite) konfiguriert!');
            await this.setStateAsync('info.connection', false, true);
            return;
        }

        this.idSite = parseInt(cfg.idSite, 10);
        this.api    = new VrmApiClient(cfg.accessToken.trim(), this.log);

        const diagSecs  = Math.max(10,  parseInt(cfg.pollInterval,  10) || 30);
        const statsSecs = Math.max(60,  parseInt(cfg.statsInterval, 10) || 300);

        // Objektbaum aufbauen
        await this._ensureObjects();

        // Anlagen-Metadaten einmalig laden
        await this._loadInstallationMeta();

        // Erster Abruf sofort
        await this._pollDiagnostics();
        await this._pollStats();

        // Timer
        this.log.info(`Diagnostics-Polling alle ${diagSecs}s | Stats-Polling alle ${statsSecs}s (idSite=${this.idSite})`);
        this._timerDiag  = this.setInterval(() => this._pollDiagnostics(), diagSecs  * 1000);
        this._timerStats = this.setInterval(() => this._pollStats(),       statsSecs * 1000);
    }

    // ── Objektbaum aufbauen ───────────────────────────────────────────────────

    async _ensureObjects() {
        // Kanäle
        for (const [id, name] of Object.entries(CHANNELS)) {
            await this.setObjectNotExistsAsync(id, { type: 'channel', common: { name }, native: {} });
        }

        // Alle 111 Sensor-States
        for (const s of ALL_SENSORS) {
            await this._mkState(s.id, {
                name:  s.name,
                type:  s.type || 'number',
                role:  s.role || 'value',
                unit:  s.unit || '',
                read:  true, write: false,
            });
        }

        // Meta / berechnete Text-States
        for (const m of META_STATES) {
            await this._mkState(m.id, { name: m.name, type: m.type, role: m.role, unit: '', read: true, write: false });
        }

        // Overall-Stats: für jede Periode eigene States
        for (const stat of OVERALL_STAT_KEYS) {
            for (const period of OVERALL_PERIODS) {
                const id = `${stat.id}${period.suffix}`;
                await this._mkState(id, {
                    name:  `${stat.name} (${period.label})`,
                    type:  'number',
                    role:  stat.unit === 'W' ? 'value.power' : 'value.energy',
                    unit:  stat.unit,
                    read:  true, write: false,
                });
            }
        }

        // Alarm-Zusammenfassung
        await this._mkState('meta.activeAlarmCount', { name: 'Aktive Alarme (Anzahl)', type: 'number', role: 'value',   unit: '', read: true, write: false });
        await this._mkState('meta.alarmsJson',        { name: 'Aktive Alarme (JSON)',  type: 'string', role: 'json',    unit: '', read: true, write: false });
    }

    async _mkState(id, common) {
        await this.setObjectNotExistsAsync(id, { type: 'state', common, native: {} });
    }

    // ── Diagnostics-Polling ───────────────────────────────────────────────────

    async _pollDiagnostics() {
        try {
            const records = await this.api.getDiagnostics(this.idSite);

            // Debug: erste Abfrage strukturell loggen
            if (records.length > 0 && !this._diagLogged) {
                this._diagLogged = true;
                this.log.debug(`Diagnostics Beispiel-Record: ${JSON.stringify(records[0])}`);
                this.log.debug(`Diagnostics Gesamt: ${records.length} Einträge`);
            }

            // Baue eine Map: vrmId → rawValue
            // Wichtig: Ein Gerät kann mehrfach vorkommen (mehrere Instanzen).
            // Wir nehmen den letzten Wert (oder konfigurierbare Instanz).
            const vrmValues = {};
            for (const rec of records) {
                const id = rec.idDataAttribute;
                if (id !== undefined && rec.rawValue !== undefined && rec.rawValue !== null) {
                    vrmValues[id] = rec.rawValue;
                }
            }

            // Alle definierten Sensoren schreiben
            for (const sensor of ALL_SENSORS) {
                let val = null;

                if (sensor.calc) {
                    // Berechneter Wert
                    val = sensor.calc(vrmValues);
                } else if (sensor.vrmId !== null) {
                    val = vrmValues[sensor.vrmId] ?? null;
                }

                if (val !== null) {
                    await this.setStateAsync(sensor.id, { val, ack: true });
                }
            }

            // Text-Mappings
            if (vrmValues[51] !== undefined) {
                // Batterie-State aus SoC-Richtung nicht verfügbar; wir nutzen battery state wenn vorhanden
            }
            if (vrmValues[40] !== undefined) {
                const txt = VEBUS_STATE_TEXT[vrmValues[40]] || `Zustand ${vrmValues[40]}`;
                await this.setStateAsync('multiplus.stateText', { val: txt, ack: true });
            }
            if (vrmValues[85] !== undefined) {
                const txt = SOLAR_CHARGE_STATE_TEXT[vrmValues[85]] || `Zustand ${vrmValues[85]}`;
                await this.setStateAsync('solar.chargeStateText', { val: txt, ack: true });
            }
            if (vrmValues[332] !== undefined) {
                // ESS-State als Text verfügbar in system-overview, nicht nochmal mappen
            }

            // Zeitstempel
            await this.setStateAsync('meta.lastUpdate', { val: new Date().toISOString(), ack: true });
            await this.setStateAsync('info.connection', true, true);

            // Alarme separat
            await this._pollAlarms();

            this.log.debug(`Diagnostics OK – ${records.length} Attribute empfangen`);

        } catch (err) {
            this.log.error(`Diagnostics-Fehler: ${err.message}`);
            await this.setStateAsync('info.connection', false, true);
        }
    }

    // ── Alarme ────────────────────────────────────────────────────────────────

    async _pollAlarms() {
        try {
            const alarms = await this.api.getAlarms(this.idSite);
            const active = alarms.filter(a => !a.cleared);
            await this.setStateAsync('meta.activeAlarmCount', { val: active.length, ack: true });
            await this.setStateAsync('meta.alarmsJson',        { val: JSON.stringify(active), ack: true });
            if (active.length > 0) {
                active.forEach(a => this.log.warn(`VRM Alarm: [${a.idAlarm}] ${a.name} – ${a.description || ''}`));
            }
        } catch (err) {
            this.log.warn(`Alarme: ${err.message}`);
        }
    }

    // ── Overall Stats ─────────────────────────────────────────────────────────

    async _pollStats() {
        try {
            const now = nowUnix();
            const periods = [
                { suffix: 'Today',     start: dayStart(0),  end: now },
                { suffix: 'ThisWeek',  start: weekStart(),  end: now },
                { suffix: 'ThisMonth', start: monthStart(), end: now },
                { suffix: 'ThisYear',  start: yearStart(),  end: now },
            ];

            for (const period of periods) {
                let data;
                try {
                    data = await this.api.getOverallStats(this.idSite, period.start, period.end);
                } catch (err) {
                    this.log.warn(`Overall Stats (${period.suffix}): ${err.message}`);
                    continue;
                }

                // VRM API gibt Stats in verschiedenen Strukturen zurück:
                // data.totals{}          → Summen-Objekt (bevorzugt)
                // data.records{}         → flaches Objekt
                // data.records[].totals  → Array-Element mit totals
                const totals  = data.totals  || {};
                const records = data.records || {};

                // Auch aus Array-Format extrahieren
                const arrTotals = Array.isArray(records)
                    ? Object.assign({}, ...(records.map(r => r.totals || {})))
                    : {};

                for (const stat of OVERALL_STAT_KEYS) {
                    const stateId = `${stat.id}${period.suffix}`;
                    let val = totals[stat.key]
                           ?? records[stat.key]
                           ?? arrTotals[stat.key]
                           ?? null;
                    if (val !== null) {
                        val = typeof val === 'number' ? Math.round(val * 100) / 100 : val;
                        await this.setStateAsync(stateId, { val, ack: true });
                    }
                }
            }

            await this.setStateAsync('meta.lastStatsUpdate', { val: new Date().toISOString(), ack: true });
            this.log.debug('Overall Stats OK');

        } catch (err) {
            this.log.error(`Stats-Fehler: ${err.message}`);
        }
    }

    // ── Anlagen-Metadaten ─────────────────────────────────────────────────────

    async _loadInstallationMeta() {
        try {
            const inst = await this.api.getInstallation(this.idSite);
            if (inst.name)     await this.setStateAsync('meta.siteName', { val: inst.name,     ack: true });
            if (inst.timezone) await this.setStateAsync('meta.timezone',  { val: inst.timezone, ack: true });
            if (inst.country)  await this.setStateAsync('meta.country',   { val: inst.country,  ack: true });
            await this.setStateAsync('meta.idSite', { val: this.idSite, ack: true });
        } catch (err) {
            this.log.warn(`Anlage-Metadaten: ${err.message}`);
            await this.setStateAsync('meta.idSite', { val: this.idSite, ack: true });
        }
    }

    // ── Stop ──────────────────────────────────────────────────────────────────

    onUnload(callback) {
        try {
            if (this._timerDiag)  this.clearInterval(this._timerDiag);
            if (this._timerStats) this.clearInterval(this._timerStats);
            this.setStateAsync('info.connection', false, true).finally(callback);
        } catch { callback(); }
    }
}

// ─── Start ────────────────────────────────────────────────────────────────────

if (require.main !== module) {
    module.exports = (options) => new VictronVrmAdapter(options);
} else {
    new VictronVrmAdapter();
}
