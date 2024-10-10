module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    createDefaultProgram: true
  },
  plugins: ['@typescript-eslint', 'import'],
  extends: ['airbnb-typescript'],
  env: {
    browser: true,
    es6: true
  },
  rules: {
    '@typescript-eslint/no-redeclare': 'off',
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/indent': 'off',
    '@typescript-eslint/brace-style': 'off',
    "import/no-extraneous-dependencies": ["error", { "devDependencies": true }],
    'brace-style': 'off',
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    'no-param-reassign': ['error', { props: false }],
    'react/react-in-jsx-scope': 'off',
    'react/jsx-uses-react': 'off',
    'quote-props': 'off',
    '@typescript-eslint/quotes': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'memberLike',
        modifiers: ['private'],
        format: ['camelCase'],
        leadingUnderscore: 'require'
      }
    ],
    'comma-dangle': ['off', 'never'],
    '@typescript-eslint/comma-dangle': [
      'off',
      {
        arrays: 'never',
        objects: 'never',
        imports: 'never',
        exports: 'never',
        functions: 'never'
      }
    ],
    'react/jsx-props-no-spreading': [
      0,
      {
        html: 'ignore' || 'enforce',
        custom: 'ignore' || 'enforce',
        explicitSpread: 'ignore' || 'enforce'
      }
    ],
    'react/jsx-filename-extension': [0],
    'react/no-unescaped-entities': [0],
    'no-console': 0,
    'react/require-default-props': [
      0,
      { forbidDefaultForRequired: 0, ignoreFunctionalComponents: 0 }
    ],
    'jsx-a11y/label-has-associated-control': [0]
  },
  settings: {
    'import/resolver': {
      alias: {
        map: [
          // And all your import aliases
          ['@utils', './src/utils'],
          ['@icons', ['./src/views/components/icons']]
        ],
        extensions: ['.ts', '.js', '.jsx', '.json']
      }
    }
  }
};
