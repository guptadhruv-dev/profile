import js from '@eslint/js'
import react from 'eslint-plugin-react'
import globals from 'globals'
import prettier from 'eslint-config-prettier'

const directivesPlugin = {
  rules: {
    'no-comments': {
      create(context) {
        return {
          Program() {
            for (const sourceComment of context.sourceCode.getAllComments()) {
              context.report({ node: sourceComment, message: 'Code comments are not permitted' })
            }
          },
        }
      },
    },
  },
}

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    plugins: { react, directives: directivesPlugin },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'no-unused-vars': ['error', { vars: 'all', args: 'after-used', ignoreRestSiblings: true }],
      'no-empty': 'error',
      'directives/no-comments': 'error',
      camelcase: ['error', { properties: 'never' }],
      'id-length': ['error', { min: 2, exceptions: ['id'], properties: 'never' }],
      'id-denylist': ['error', 'err', 'res', 'idx', 'evt', 'val', 'cols', 'btn', 'nav'],
    },
  },
  {
    files: ['vite.config.js', 'eslint.config.js', 'api/**/*.js', 'scripts/**/*.js', 'test/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    ignores: ['dist/', 'node_modules/', 'local/', '.vercel/', 'coverage/'],
  },
  prettier,
]
