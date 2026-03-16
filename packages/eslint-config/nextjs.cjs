const config = {
  extends: [require.resolve('./base.cjs'), 'next/core-web-vitals'],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    'react/no-unescaped-entities': 'off',
  },
};

module.exports = config;
