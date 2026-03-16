const config = {
  extends: [require.resolve('./base.cjs')],
  rules: {
    '@typescript-eslint/explicit-function-return-type': [
      'warn',
      { allowExpressions: true, allowTypedFunctionExpressions: true },
    ],
    '@typescript-eslint/explicit-module-boundary-types': 'warn',
  },
};

module.exports = config;
