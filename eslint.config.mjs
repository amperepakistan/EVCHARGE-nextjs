import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['lib/server/modules/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'next',
              message:
                'Nest portability: no next imports under lib/server/modules. Use route adapters instead.',
            },
            {
              name: 'next/server',
              message:
                'Nest portability: no next/server under lib/server/modules. Use route adapters instead.',
            },
            {
              name: 'next/headers',
              message:
                'Nest portability: no next/headers under lib/server/modules. Pass context from the adapter.',
            },
            {
              name: 'next/navigation',
              message:
                'Nest portability: no next/navigation under lib/server/modules.',
            },
          ],
          patterns: [
            {
              group: ['next/*'],
              message:
                'Nest portability: no next/* imports under lib/server/modules.',
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
