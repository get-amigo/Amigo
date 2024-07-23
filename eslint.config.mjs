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
    {
        files: ['**/*.js', '**/*.mjs', '**/*.tsx', '**/*.jsx', '**/*.ts'],
        languageOptions: {
            parser: babelParser,
        },
    },
];
