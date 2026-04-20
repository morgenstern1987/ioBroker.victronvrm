'use strict';

const path = require('path');
const { tests } = require('@iobroker/testing');

// Run the package file tests
// These check io-package.json, package.json, README.md, etc.
tests.packageFiles(path.join(__dirname, '..', '..'));
