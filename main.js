'use strict';

/*
 * ioBroker.victronvrm
 * Victron Energy VRM API v2 adapter
 *
 * Rules followed (iobroker-ai-developer-guide):
 * - adapter.setTimeout / adapter.setInterval (not Node.js globals)
 * - adapter.terminate() (not process.exit())
 * - setObjectNotExistsAsync (never overwrite existing objects)
 * - ack=true for device values, ack=false for commands
 * - All log messages in English
 * - device → channel → state hierarchy (all intermediate objects created)
 * - Correct state roles (not generic "state")
 * - encryptedNative / protectedNative for accessToken (in io-package.json)
 * - Object IDs: only [A-Za-z0-9._-] (dots as separators)
 * - info.connection state implemented
 * - onUnload cleans up ALL timers
 */

const utils = require('@iobroker/adapter-core');
const VrmApiClient = require('./lib/vrm-api');
const {
 ALL_SENSORS,
 OVERALL_STAT_KEYS, OVERALL_PERIODS,
 TEXT_STATES, META_STATES, CHANNELS,
 VEBUS_STATE_TEXT, SOLAR_CHARGE_STATE_TEXT,
} = require('./lib/sensor-definitions');

class VictronVrmAdapter extends utils.Adapter {

 constructor(options = {}) {
 super({ ...options, name: 'victronvrm' });

 /** @type {VrmApiClient|null} */
 this.api = null;
 /** @type {number|null} */
 this.idSite = null;
 this._timerDiag = null;
 this._timerStats = null;
 this._diagLogged = false;

 this.on('ready', this.onReady.bind(this));
 this.on('unload', this.onUnload.bind(this));
 }

 // ── Lifecycle ─────────────────────────────────────────────────────────────

 async onReady() {
 await this.setStateAsync('info.connection', { val: false, ack: true });

 const cfg = this.config;

 if (!cfg.accessToken || cfg.accessToken.trim().length < 10) {
 this.log.error('No valid access token configured! Create one at https://vrm.victronenergy.com/access-tokens');
 return;
 }
 if (!cfg.idSite || isNaN(parseInt(cfg.idSite, 10))) {
 this.log.error('No valid installation ID (idSite) configured!');
 return;
 }

 this.idSite = parseInt(cfg.idSite, 10);
 this.api = new VrmApiClient(cfg.accessToken.trim(), this.log);

 const diagSecs = Math.max(10, parseInt(cfg.pollInterval, 10) || 30);
 const statsSecs = Math.max(60, parseInt(cfg.statsInterval, 10) || 300);

 // Build object tree
 await this._ensureObjects();

 // Load installation metadata once
 await this._loadInstallationMeta();

 // First diagnostics poll immediately
 await this._pollDiagnostics();

 // Stats poll delayed by 5s to avoid rate limiting on startup
 // (especially important in Docker where latency is higher)
 this._timerStats = this.setTimeout(async () => {
 await this._pollStats();
 // After first stats poll, set up regular interval
 this._timerStats = this.setInterval(() => this._pollStats(), statsSecs * 1000);
 }, 5000);

 // Start diagnostics timer
 this.log.info(`Diagnostics polling every ${diagSecs}s, stats every ${statsSecs}s (idSite=${this.idSite})`);
 this._timerDiag = this.setInterval(() => this._pollDiagnostics(), diagSecs * 1000);
 }

 // ── Helper: sleep ─────────────────────────────────────────────────────────

 _sleep(ms) {
 return new Promise(resolve => this.setTimeout(resolve, ms));
 }

 // ── Object tree ───────────────────────────────────────────────────────────

 async _ensureObjects() {
 // All channels (intermediate objects must be created explicitly – guide rule!)
 for (const [id, def] of Object.entries(CHANNELS)) {
 await this.setObjectNotExistsAsync(id, {
 type: 'channel',
 common: { name: def.name },
 native: {},
 });
 }

 // Sensor states
 for (const s of ALL_SENSORS) {
 await this.setObjectNotExistsAsync(s.id, {
 type: 'state',
 common: {
 name: s.name,
 type: s.type || 'number',
 role: s.role || 'value',
 unit: s.unit || '',
 read: true,
 write: false,
 },
 native: {},
 });
 }

 // Text states
 for (const s of TEXT_STATES) {
 await this.setObjectNotExistsAsync(s.id, {
 type: 'state',
 common: { name: s.name, type: s.type, role: s.role, unit: '', read: true, write: false },
 native: {},
 });
 }

 // Overall stats: each key × each period
 for (const stat of OVERALL_STAT_KEYS) {
 for (const period of OVERALL_PERIODS) {
 const id = `${stat.id}${period.suffix}`;
 await this.setObjectNotExistsAsync(id, {
 type: 'state',
 common: {
 name: { en: `${stat.name.en} (${period.label.en})`, de: `${stat.name.de} (${period.label.de})` },
 type: 'number',
 role: stat.unit === 'W' ? 'value.power' : 'value.energy',
 unit: stat.unit,
 read: true, write: false,
 },
 native: {},
 });
 }
 }

 // Meta states
 for (const s of META_STATES) {
 await this.setObjectNotExistsAsync(s.id, {
 type: 'state',
 common: { name: s.name, type: s.type, role: s.role, unit: '', read: true, write: false },
 native: {},
 });
 }
 }

 // ── Diagnostics poll ──────────────────────────────────────────────────────

 async _pollDiagnostics() {
 try {
 const records = await this.api.getDiagnostics(this.idSite);

 // Log structure on first call to help debugging
 if (!this._diagLogged && records.length > 0) {
 this._diagLogged = true;
 this.log.debug(`Diagnostics: ${records.length} attributes received. Sample: ${JSON.stringify(records[0])}`);
 }

 // Build lookup map: idDataAttribute → rawValue
 /** @type {Record<string|number, any>} */
 const vals = {};
 for (const rec of records) {
 const id = rec.idDataAttribute;
 if (id !== undefined && rec.rawValue !== undefined && rec.rawValue !== null) {
 vals[id] = rec.rawValue;
 }
 }

 // Write all sensor states (ack=true: value comes from the device)
 for (const sensor of ALL_SENSORS) {
 let val = null;
 if (sensor.calc) {
 val = sensor.calc(vals);
 } else if (sensor.vrmId !== null) {
 val = vals[sensor.vrmId] ?? null;
 }
 if (val !== null) {
 await this.setStateAsync(sensor.id, { val, ack: true });
 }
 }

 // Text states
 if (vals[40] !== undefined) {
 const txt = VEBUS_STATE_TEXT[vals[40]] || `State ${vals[40]}`;
 await this.setStateAsync('multiplus.stateText', { val: txt, ack: true });
 }
 if (vals[85] !== undefined) {
 const txt = SOLAR_CHARGE_STATE_TEXT[vals[85]] || `State ${vals[85]}`;
 await this.setStateAsync('solar.chargeStateText', { val: txt, ack: true });
 }

 // Timestamp and connection flag
 await this.setStateAsync('meta.lastUpdate', { val: new Date().toISOString(), ack: true });
 await this.setStateAsync('info.connection', { val: true, ack: true });

 this.log.debug('Diagnostics poll successful');

 // Alarms (separate call, non-critical)
 await this._pollAlarms();

 } catch (err) {
 this.log.error(`Diagnostics poll failed: ${err.message}`);
 await this.setStateAsync('info.connection', { val: false, ack: true });
 }
 }

 // ── Alarms ────────────────────────────────────────────────────────────────

 async _pollAlarms() {
 try {
 const alarms = await this.api.getAlarms(this.idSite);
 const active = alarms.filter(a => !a.cleared);
 await this.setStateAsync('meta.activeAlarmCount', { val: active.length, ack: true });
 await this.setStateAsync('meta.alarmsJson', { val: JSON.stringify(active), ack: true });
 if (active.length > 0) {
 active.forEach(a => this.log.warn(`VRM alarm [${a.idAlarm}] ${a.name}: ${a.description || ''}`));
 }
 } catch (err) {
 this.log.warn(`Alarms poll failed: ${err.message}`);
 }
 }

 // ── Overall stats ─────────────────────────────────────────────────────────

 async _pollStats() {
 try {
 // Single call returns all periods: today, week, month, year
 const data = await this.api.getOverallStats(this.idSite);
 const records = data.records || {};

 for (const period of OVERALL_PERIODS) {
 // API returns period under keys: today / week / month / year
 const periodData = records[period.apiKey] || {};
 const totals = periodData.totals || {};

 for (const stat of OVERALL_STAT_KEYS) {
 const stateId = `${stat.id}${period.suffix}`;
 const val = totals[stat.key] ?? null;
 if (val !== null) {
 await this.setStateAsync(stateId, { val: Math.round(val * 100) / 100, ack: true });
 }
 }

 // Populate string-vrmId sensors (Bc, Bg, Pc, Pb, Pg, Gc, Gb) from today
 // These have string vrmIds that don't exist in /diagnostics (numeric only)
 if (period.apiKey === 'today') {
 const strMap = {
 'Bc': 'battery.energyToConsumersToday',
 'Bg': 'battery.energyToGridToday',
 'Pc': 'pvInverter.energyToConsumersToday',
 'Pb': 'pvInverter.energyToBatteryToday',
 'Pg': 'pvInverter.energyToGridToday',
 'Gc': 'multiplus.energyGridToConsumersToday',
 'Gb': 'multiplus.energyGridToBatteryToday',
 };
 for (const [code, stateId] of Object.entries(strMap)) {
 const val = totals[code] ?? null;
 if (val !== null) {
 await this.setStateAsync(stateId, { val: Math.round(val * 100) / 100, ack: true });
 }
 }

 // Recalculate pvInverter.totalYieldToday from today's totals
 const pc = totals['Pc'] ?? 0;
 const pb = totals['Pb'] ?? 0;
 const pg = totals['Pg'] ?? 0;
 if (totals['Pc'] !== undefined || totals['Pb'] !== undefined || totals['Pg'] !== undefined) {
 await this.setStateAsync('pvInverter.totalYieldToday', {
 val: Math.round((pc + pb + pg) * 100) / 100, ack: true,
 });
 }
 }

 // Small delay between periods to stay within rate limit
 await this._sleep(500);
 }

 await this.setStateAsync('meta.lastStatsUpdate', { val: new Date().toISOString(), ack: true });
 this.log.debug('Overall stats poll successful');

 } catch (err) {
 this.log.error(`Overall stats poll failed: ${err.message}`);
 }
 }

 // ── Installation metadata ─────────────────────────────────────────────────

 async _loadInstallationMeta() {
 try {
 const inst = await this.api.getInstallation(this.idSite);
 if (inst.name) await this.setStateAsync('meta.siteName', { val: inst.name, ack: true });
 if (inst.timezone) await this.setStateAsync('meta.timezone', { val: inst.timezone, ack: true });
 if (inst.country) await this.setStateAsync('meta.country', { val: inst.country, ack: true });
 await this.setStateAsync('meta.idSite', { val: this.idSite, ack: true });
 } catch (err) {
 this.log.warn(`Could not load installation metadata: ${err.message}`);
 await this.setStateAsync('meta.idSite', { val: this.idSite, ack: true });
 }
 }

 // ── Unload (guide: clean up ALL resources) ────────────────────────────────

 onUnload(callback) {
 try {
 if (this._timerDiag) this.clearInterval(this._timerDiag);
 if (this._timerStats) {
 this.clearInterval(this._timerStats);
 this.clearTimeout(this._timerStats);
 }
 this._timerDiag = null;
 this._timerStats = null;
 this.setStateAsync('info.connection', { val: false, ack: true }).finally(callback);
 } catch {
 callback();
 }
 }

 // ── Time helpers ──────────────────────────────────────────────────────────

 _dayStart(daysAgo = 0) {
 const d = new Date();
 d.setUTCHours(0, 0, 0, 0);
 d.setUTCDate(d.getUTCDate() - daysAgo);
 return Math.floor(d.getTime() / 1000);
 }

 _weekStart() {
 const d = new Date();
 d.setUTCHours(0, 0, 0, 0);
 d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
 return Math.floor(d.getTime() / 1000);
 }

 _monthStart() {
 const d = new Date();
 d.setUTCHours(0, 0, 0, 0);
 d.setUTCDate(1);
 return Math.floor(d.getTime() / 1000);
 }

 _yearStart() {
 return Math.floor(new Date(Date.UTC(new Date().getUTCFullYear(), 0, 1)).getTime() / 1000);
 }
}

// ─── Compact mode support (guide requirement) ─────────────────────────────────
if (require.main !== module) {
 module.exports = (options) => new VictronVrmAdapter(options);
} else {
 new VictronVrmAdapter();
}
