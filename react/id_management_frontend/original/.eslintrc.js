module.exports = {
  extends: ['./config/eslint.react.js', 'eslint:recommended', 'prettier', 'prettier/react'],
  plugins: ['babel', 'react-hooks', 'prettier'],
  'react/require-default-props': 0,
  rules: {
    'no-console': 'warn',
    'no-debugger': 'warn',
    'no-unused-vars': 'warn'
  },
  settings: {
    'import/resolver': {
      node: {
        paths: ['src']
      }
    }
  }
};
