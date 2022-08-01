const path = require('path');

module.exports = {
  resolve: {
    modules: [
      'node_modules',
      path.join(__dirname, '../src'),
      path.join(__dirname, '../node_modules')
    ]
  }
};
