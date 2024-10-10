const path = require('path');
const enableImportsFromExternalPaths = require('./utils/craco/enableImports');

// Paths to the code you want to use
const sharedLibOne = path.resolve(__dirname, '../shared');

module.exports = {
  plugins: [
    {
      plugin: {
        overrideWebpackConfig: ({ webpackConfig }) => {
          enableImportsFromExternalPaths(webpackConfig, [sharedLibOne]);
          return webpackConfig;
        }
      }
    }
  ]
};
