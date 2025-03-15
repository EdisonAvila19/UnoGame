import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import unusedImports from 'eslint-plugin-unused-imports'
import airbnbBase from 'eslint-config-airbnb-base'
import airbnbTypescript from 'eslint-config-airbnb-typescript'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "@typescript-eslint": tseslint,
      "unused-imports": unusedImports,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...airbnbBase.rules,
      ...airbnbTypescript.rules,
      ...reactHooks.configs.recommended.rules,
      "react/jsx-filesname-extension": "off",
      "react/react-in-jsx-scope": "off",
      "no-unused-vars": "off",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        }
      ],
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'quotes': ['error', 'single', { avoidEscape: true }],
      'semi': ['error', 'never'],
    },
  },
)
