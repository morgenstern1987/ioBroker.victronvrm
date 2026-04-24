'use strict';

const BASE = 'https://vrmapi.victronenergy.com/v2';

/**
 * Victron VRM API v2 client
 * Docs: https://vrm-api-docs.victronenergy.com/
 * Auth: Personal Access Token → X-Authorization: Token <token>
 * Rate limit: ~3 req/s (200 rolling window, Retry-After header on 429)
 */
class VrmApiClient {
    /**
     * @param {string} accessToken
     * @param {object} log ioBroker logger
     * @param {function(number): Promise<void>} [sleepFn] optional sleep function (ms → Promise).
     *   Pass adapter.setTimeout-based sleep to avoid using Node.js global setTimeout.
     *   Defaults to a Promise-wrapped global setTimeout (only used if not injected).
     */
    constructor(accessToken, log, sleepFn) {
        this.accessToken = accessToken;
        this.log = log;
        this._sleep = sleepFn || ((ms) => new Promise(resolve => setTimeout(resolve, ms)));
    }

    _headers() {
        return {
            'Content-Type': 'application/json',
            'X-Authorization': `Token ${this.accessToken}`,
        };
    }

    async _get(path, params = {}, retries = 2) {
        let url = `${BASE}${path}`;
        const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null);
        if (entries.length) {
            url += '?' + new URLSearchParams(entries.map(([k, v]) => [k, String(v)]));
        }
        this.log.debug(`VRM GET ${url}`);

        const res = await fetch(url, { headers: this._headers() });

        if (res.status === 429) {
            const retry = parseInt(res.headers.get('Retry-After') || '5', 10);
            if (retries > 0) {
                this.log.warn(`VRM rate limit hit, retrying after ${retry}s...`);
                await this._sleep(retry * 1000);
                return this._get(path, params, retries - 1);
            }
            throw new Error(`VRM rate limit – retry after ${retry}s`);
        }
        if (!res.ok) {
            const txt = await res.text().catch(() => '');
            throw new Error(`VRM API [${res.status}] ${path}: ${txt.slice(0, 200)}`);
        }
        return res.json();
    }

    /** GET /users/me */
    async getMe() {
        const d = await this._get('/users/me');
        return d.record || d.user || d;
    }

    /** GET /users/{id}/installations */
    async getInstallations(idUser) {
        const d = await this._get(`/users/${idUser}/installations`);
        return d.records || [];
    }

    /**
     * Resolve installation metadata.
     * The single-resource endpoint /installations/{id} returns 400,
     * so we fetch the user's installation list and search by idSite.
     */
    async getInstallation(idSite) {
        const me = await this.getMe();
        const uid = me.id || me.idUser;
        if (!uid) return {};
        const list = await this.getInstallations(uid);
        return list.find(i => String(i.idSite) === String(idSite)) || {};
    }

    /**
     * GET /installations/{id}/diagnostics
     * Returns all current device attribute values with their idDataAttribute.
     * This is the primary data source for all 111 sensors.
     */
    async getDiagnostics(idSite) {
        const d = await this._get(`/installations/${idSite}/diagnostics`);
        return d.records || [];
    }

    /**
     * GET /installations/{id}/alarms
     */
    async getAlarms(idSite) {
        const d = await this._get(`/installations/${idSite}/alarms`);
        return d.records || [];
    }

    /**
     * GET /installations/{id}/overallstats
     * Returns aggregated energy totals per period (today, week, month, year).
     *
     * NOTE: /stats?type=kwh always returns empty arrays – wrong endpoint!
     * Correct endpoint is /overallstats with type=custom and attributeCodes[].
     * Response: { records: { today: { totals: {Pc, Pb, Pg, Gc, Gb, Bc, Bg} }, week: {...}, month: {...}, year: {...} } }
     */
    async getOverallStats(idSite) {
        const codes = ['Pc', 'Pb', 'Pg', 'Gc', 'Gb', 'Bc', 'Bg'];
        const params = { type: 'custom' };
        codes.forEach((c, i) => { params[`attributeCodes[${i}]`] = c; });
        return this._get(`/installations/${idSite}/overallstats`, params);
    }
}

module.exports = VrmApiClient;
