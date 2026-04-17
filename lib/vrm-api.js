'use strict';

const BASE = 'https://vrmapi.victronenergy.com/v2';

/**
 * Victron VRM API v2 Client
 * Auth: Personal Access Token → X-Authorization: Token <token>
 * Rate Limit: ~3 req/s (200 im Rolling-Window, Retry-After Header bei 429)
 */
class VrmApiClient {
    constructor(accessToken, log) {
        this.accessToken = accessToken;
        this.log = log;
    }

    _headers() {
        return {
            'Content-Type': 'application/json',
            'X-Authorization': `Token ${this.accessToken}`,
        };
    }

    async _get(path, params = {}) {
        let url = `${BASE}${path}`;
        const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null);
        if (entries.length) {
            url += '?' + new URLSearchParams(entries.map(([k, v]) => [k, String(v)]));
        }
        this.log.debug(`VRM GET ${url}`);

        const res = await fetch(url, { headers: this._headers() });

        if (res.status === 429) {
            const retry = res.headers.get('Retry-After') || '5';
            throw new Error(`VRM Rate-Limit – bitte ${retry}s warten`);
        }
        if (!res.ok) {
            const txt = await res.text().catch(() => '');
            throw new Error(`VRM API [${res.status}] ${path}: ${txt.slice(0, 200)}`);
        }
        return res.json();
    }

    // ── Nutzer ────────────────────────────────────────────────────────────────
    /** GET /users/me → { record: { id, name, email, ... } } */
    async getMe() {
        const d = await this._get('/users/me');
        return d.record || d;
    }

    // ── Installationen ────────────────────────────────────────────────────────
    /** GET /users/{uid}/installations → records[] */
    async getInstallations(idUser) {
        const d = await this._get(`/users/${idUser}/installations`);
        return d.records || [];
    }

    /**
     * Anlage anhand idSite suchen.
     * /installations/{id} liefert 400 → stattdessen User-Installations-Liste durchsuchen.
     */
    async getInstallation(idSite) {
        const me = await this.getMe();
        const uid = me.id || me.idUser;
        if (!uid) return {};
        const list = await this.getInstallations(uid);
        const site = list.find(i => String(i.idSite) === String(idSite));
        return site || {};
    }

    // ── Diagnostics ───────────────────────────────────────────────────────────
    /**
     * GET /installations/{idSite}/diagnostics
     * Liefert Array: [{ idDataAttribute, rawValue, formattedValue, unit, description, Device, ... }]
     * → Das ist die Hauptquelle für alle 111 Sensoren!
     */
    async getDiagnostics(idSite) {
        const d = await this._get(`/installations/${idSite}/diagnostics`);
        return d.records || [];
    }

    // ── System Overview ───────────────────────────────────────────────────────
    /**
     * GET /installations/{idSite}/system-overview
     * Liefert { records: { batterySoc, pvPower, ... }, devices: [...] }
     */
    async getSystemOverview(idSite) {
        return this._get(`/installations/${idSite}/system-overview`);
    }

    // ── Overall Stats (für Today / Week / Month / Year) ───────────────────────
    /**
     * GET /installations/{idSite}/stats
     * type=kwh, interval=day → liefert Gesamtwerte + totals{}
     * Gültige interval-Werte: 15mins, hours, day, week, month
     *
     * @param {number} start  Unix-Timestamp (Sekunden)
     * @param {number} end    Unix-Timestamp (Sekunden)
     */
    async getOverallStats(idSite, start, end) {
        return this._get(`/installations/${idSite}/stats`, {
            start, end,
            type: 'kwh',
            interval: 'day',
        });
    }

    // ── Alarme ────────────────────────────────────────────────────────────────
    async getAlarms(idSite) {
        const d = await this._get(`/installations/${idSite}/alarms`);
        return d.records || [];
    }
}

module.exports = VrmApiClient;
