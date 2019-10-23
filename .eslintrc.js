module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
    node: true
  },
  extends: 'standard',
  globals: {
    __static: true
  },
  plugins: [
    'html'
  ],
  'rules': {
     'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
     'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
     'no-mixed-spaces-and-tabs': [0, false],
     'eol-last': 0,
     'space-before-function-paren': 0
  }
}
