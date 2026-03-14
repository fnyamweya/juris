const config = {
  extends: [require.resolve('./base')],
  rules: {
    'no-restricted-globals': [
      'error',
      {
        name: 'setTimeout',
        message: 'Avoid long timers in Workers. Use scheduled handlers or Durable Objects.',
      },
    ],
    '@typescript-eslint/explicit-function-return-type': [
      'warn',
      { allowExpressions: true },
    ],
  },
};

module.exports = config;
