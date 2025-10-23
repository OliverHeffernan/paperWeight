module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  parser: 'vue-eslint-parser', // Use vue-eslint-parser for .vue files
  parserOptions: {
    parser: '@typescript-eslint/parser', // Use TypeScript parser for script blocks
    sourceType: 'module',
    ecmaVersion: 2021,
    extraFileExtensions: ['.vue'], // Allow .vue files
  },
  extends: [
    'plugin:vue/vue3-essential', // or 'plugin:vue/vue3-recommended'
    'plugin:@typescript-eslint/recommended', // TypeScript rules
    'eslint:recommended',
  ],
  plugins: ['vue', '@typescript-eslint'],
  rules: {
    'no-undef': 'off', // Disable no-undef since TypeScript handles it
    '@typescript-eslint/no-unused-vars': ['error'], // Optional: Enforce no unused vars
  },
  overrides: [
    {
      files: ['*.ts', '*.vue'], // Apply to .ts and .vue files
      parser: 'vue-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
      },
    },
  ],
};
