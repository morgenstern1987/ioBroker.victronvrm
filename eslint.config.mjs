import js from '@eslint/js';
import globals from 'globals';

export default [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'commonjs',
            globals: {
                ...globals.node,
                ...globals.mocha,
            },
        },
        rules: {
            'no-console':                 'warn',
            'no-unused-vars':             ['warn', { argsIgnorePattern: '^_' }],
            'no-trailing-spaces':         'error',
            'eol-last':                   ['error', 'always'],
            'semi':                       ['error', 'always'],
            'quotes':                     ['error', 'single', { avoidEscape: true }],
            'no-var':                     'error',
            'prefer-const':               'warn',
            'no-multi-spaces':            'error',
            'space-before-function-paren':['error', 'never'],
            'keyword-spacing':            ['error', { before: true, after: true }],
        },
        ignores: [
            'node_modules/**',
            'test/**',
            'scripts/**',
        ],
    },
];
