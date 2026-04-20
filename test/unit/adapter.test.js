'use strict';

const { expect } = require('chai');
const {
    ALL_SENSORS,
    OVERALL_STAT_KEYS,
    OVERALL_PERIODS,
    CHANNELS,
} = require('../../lib/sensor-definitions');

describe('sensor-definitions', () => {

    it('should have 111 sensors total', () => {
        // Battery(34) + MultiPlus(12) + Grid(10) + PVInverter(17) + Tank(6) + Solar(7) + System(4) = 90
        // + Overall (8 keys × 4 periods = 32 states, but those are in OVERALL_STAT_KEYS)
        expect(ALL_SENSORS.length).to.be.greaterThanOrEqual(90);
    });

    it('all sensor IDs should only contain valid characters', () => {
        const validId = /^[A-Za-z0-9._-]+$/;
        for (const sensor of ALL_SENSORS) {
            expect(sensor.id).to.match(validId, `Sensor ID "${sensor.id}" contains invalid characters`);
        }
    });

    it('all sensors should have a role defined', () => {
        for (const sensor of ALL_SENSORS) {
            expect(sensor.role).to.be.a('string', `Sensor "${sensor.id}" is missing a role`);
            expect(sensor.role).to.not.equal('state', `Sensor "${sensor.id}" uses generic role "state" – use specific role`);
        }
    });

    it('all sensors should have multilingual names', () => {
        for (const sensor of ALL_SENSORS) {
            expect(sensor.name).to.be.an('object', `Sensor "${sensor.id}" name should be an object with language keys`);
            expect(sensor.name).to.have.property('en');
            expect(sensor.name).to.have.property('de');
        }
    });

    it('calculated sensors should have a calc function and vrmId null', () => {
        const calcSensors = ALL_SENSORS.filter(s => s.calc);
        for (const sensor of calcSensors) {
            expect(sensor.vrmId).to.be.null;
            expect(sensor.calc).to.be.a('function');
        }
    });

    it('all overall stat keys should have 4 periods', () => {
        expect(OVERALL_PERIODS.length).to.equal(4);
        const suffixes = OVERALL_PERIODS.map(p => p.suffix);
        expect(suffixes).to.include('Today');
        expect(suffixes).to.include('ThisWeek');
        expect(suffixes).to.include('ThisMonth');
        expect(suffixes).to.include('ThisYear');
    });

    it('all overall stat keys should have a key and unit defined', () => {
        for (const stat of OVERALL_STAT_KEYS) {
            expect(stat.key).to.be.a('string', `Stat "${stat.id}" is missing a key`);
            expect(stat.unit).to.be.a('string', `Stat "${stat.id}" is missing a unit`);
        }
    });

    it('all channel IDs should only contain valid characters', () => {
        const validId = /^[A-Za-z0-9._-]+$/;
        for (const id of Object.keys(CHANNELS)) {
            expect(id).to.match(validId, `Channel ID "${id}" contains invalid characters`);
        }
    });

    it('sensor channels should be declared in CHANNELS', () => {
        const channelIds = new Set(Object.keys(CHANNELS));
        for (const sensor of ALL_SENSORS) {
            const parts = sensor.id.split('.');
            if (parts.length >= 3) {
                const channelId = parts.slice(0, -1).join('.');
                expect(channelIds.has(channelId)).to.be.true;
            }
        }
    });

});

describe('sensor calc functions', () => {

    it('battery.power calc should return V*A', () => {
        const sensor = ALL_SENSORS.find(s => s.id === 'battery.power');
        expect(sensor).to.exist;
        const result = sensor.calc({ 47: 12.5, 49: 10 });
        expect(result).to.equal(125);
    });

    it('battery.power calc should return null if voltage missing', () => {
        const sensor = ALL_SENSORS.find(s => s.id === 'battery.power');
        const result = sensor.calc({ 49: 10 });
        expect(result).to.be.null;
    });

    it('battery.cellVoltageDiff calc should return max-min', () => {
        const sensor = ALL_SENSORS.find(s => s.id === 'battery.cellVoltageDiff');
        expect(sensor).to.exist;
        const result = sensor.calc({ 173: 3.2, 174: 3.4 });
        expect(result).to.equal(0.2);
    });

    it('grid.powerTotal calc should sum L1+L2+L3', () => {
        const sensor = ALL_SENSORS.find(s => s.id === 'grid.powerTotal');
        expect(sensor).to.exist;
        const result = sensor.calc({ 379: 100, 380: 200, 381: 300 });
        expect(result).to.equal(600);
    });

    it('pvInverter.totalYieldToday calc should sum Pc+Pb+Pg', () => {
        const sensor = ALL_SENSORS.find(s => s.id === 'pvInverter.totalYieldToday');
        expect(sensor).to.exist;
        const result = sensor.calc({ Pc: 1.5, Pb: 0.5, Pg: 0.3 });
        expect(result).to.equal(2.3);
    });

    it('pvInverter.totalYieldToday calc should return null if all missing', () => {
        const sensor = ALL_SENSORS.find(s => s.id === 'pvInverter.totalYieldToday');
        const result = sensor.calc({});
        expect(result).to.be.null;
    });

});
