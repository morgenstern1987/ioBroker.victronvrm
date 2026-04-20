'use strict';

const path = require('path');
const { tests } = require('@iobroker/testing');

// Integration tests start a real js-controller instance.
// Run with: npm run test:integration
// These are optional and may require additional setup.
tests.integration(path.join(__dirname, '..', '..'), {
    allowedExitCodes: [11],
    defineAdditionalTests() {
        // Add custom integration tests here if needed
    },
});
