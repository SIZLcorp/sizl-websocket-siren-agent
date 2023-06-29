module.exports = {
  root: true,
  extends: [
    'eslint:recommended'
  ],
  overrides: [
    {
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
        project: ['./tsconfig.eslint.json', './layers/*/tsconfig.json']
      },
      files: ['**/*.ts', '**/*.tsx'],
      env: {
        es6: true,
        node: true
      },
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended'
      ],
      plugins: ['@typescript-eslint'],
      rules: {
        indent: ['error', 2, { SwitchCase: 1 }],
        'linebreak-style': ['error', 'unix'],
        quotes: ['error', 'single'],
        'comma-dangle': ['error', 'always-multiline'],
        'no-trailing-spaces': [
          'error',
          {
            ignoreComments: true
          }
        ],
        'object-curly-spacing': [
          'warn',
          'always'
        ],
        '@typescript-eslint/no-explicit-any': 0,
        semi: ['error', 'never'],
        'no-extra-semi': 'error'
      }
    }, {
      parser: '@babel/eslint-parser',
      parserOptions: {
        requireConfigFile: false,
        ecmaVersion: 11,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      },
      files: ['**/*.js'],
      env: {
        node: true,
        commonjs: true,
        es6: true,
        jest: true
      },
      extends: [
        'standard',
        'plugin:security/recommended'
      ],
      plugins: [
        'security'
      ],
      rules: {
        strict: [
          2,
          'global'
        ],
        quotes: [
          'warn',
          'single'
        ],
        'no-var': [
          'error'
        ],
        'no-console': [
          'warn'
        ],
        'no-unused-vars': [
          'warn'
        ],
        'no-trailing-spaces': [
          'error',
          {
            ignoreComments: true
          }
        ],
        'no-alert': 0,
        'no-shadow': 0,
        'security/detect-object-injection': [
          'off'
        ],
        'security/detect-non-literal-require': [
          'off'
        ],
        'security/detect-non-literal-fs-filename': [
          'off'
        ],
        'no-process-exit': [
          'off'
        ],
        'node/no-unpublished-require': 0,
        'object-curly-spacing': [
          'warn',
          'always'
        ],
        'no-label': 0
      }
    }
  ]
}
