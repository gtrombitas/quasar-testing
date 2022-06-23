/* eslint-env node */
// ***********************************************************
// This example plugins/index.ts can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

import { injectDevServer } from '@quasar/quasar-app-extension-testing-e2e-cypress/cct-dev-server';
const wp = require('@cypress/webpack-preprocessor');

const webpackOptions = {
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: [/node_modules/],
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      }
    ]
  }
};

const pluginConfig: Cypress.PluginConfig = async (on, config) => {
  on('file:preprocessor', wp({
    webpackOptions
  }));

  require('@cypress/code-coverage/task')(on, config)

  // Enable component testing, you can safely remove this
  // if you don't plan to use Cypress for component tests
  if (config.testingType === 'component') {
    await injectDevServer(on, config);
  }

  return config;
};

export default pluginConfig;
