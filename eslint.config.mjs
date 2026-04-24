import config from '@iobroker/eslint-config';

export default [
    // 1. Global ignores
    {
        ignores: [
            'node_modules/**',
            'test/**',
            'scripts/**',
        ],
    },

    // 2. Use official ioBroker ESLint config
    ...config,
];
