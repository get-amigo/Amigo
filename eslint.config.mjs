import { fixupConfigRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import babelParser from '@babel/eslint-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

export default [
    {
        ignores: ['**/.*', 'node_modules/', 'assets'],
    },
    ...fixupConfigRules(...compat.extends('universe/native')),
    ...fixupConfigRules(...compat.extends('expo')),
    ...fixupConfigRules(...compat.extends('eslint:recommended')),
    ...fixupConfigRules(...compat.extends('plugin:react/recommended')),
    {
        files: ['**/*.js', '**/*.mjs', '**/*.tsx', '**/*.jsx', '**/*.ts'],
        languageOptions: {
            parser: babelParser,
            globals: {
                console: 'readonly',
                window: 'readonly',
                document: 'readonly',
                navigator: 'readonly',
                fetch: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
                module: 'readonly',
                require: 'readonly',
                process: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
            },
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
        rules: {
            'react/jsx-uses-react': 'error',
            'react/jsx-uses-vars': 'error',
            'react/prop-types': 'off',
            'react/react-in-jsx-scope': 'off',
        },
    },
];
