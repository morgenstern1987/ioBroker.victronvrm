import config from '@iobroker/eslint-config';

export default [
    ...config,
    {
        // Adapter-specific overrides
        ignores: [
            'node_modules/**',
            'test/**',
            'scripts/**',
        ],
    },
];
