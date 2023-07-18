module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: 'airbnb-base',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'class-methods-use-this': 'off',
    'max-len': 'off',
    'no-restricted-syntax': 'off',
    'guard-for-in': 0,
    'no-await-in-loop': 0,
    'no-continue': 0,
    'consistent-return': 0,
    'prefer-const': 0,
  },
};
