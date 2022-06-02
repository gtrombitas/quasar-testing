/**
 * Quasar App Extension index/runner script
 * (runs on each dev/build)
 *
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/IndexAPI.js
 */

module.exports = async function (api) {
  api.compatibleWith('quasar', '^2.0.0');

  if (api.hasVite) {
    api.compatibleWith('@quasar/app-vite', '^1.0.0');
  } else if (api.hasWebpack) {
    // TODO: should be "@quasar/app-webpack" but that is not backward compatible
    // Remove when Qv3 comes out
    api.compatibleWith('@quasar/app', '^3.0.0');
  }

  // We cannot use process.env.CYPRESS here as this code is executed outside Cypress process
  // TODO: since v4.1 we use NODE_ENV, but we keep supporting old E2E_TEST variable until next major version
  if (process.env.NODE_ENV !== 'test' && !process.env.E2E_TEST) {
    return;
  }

  // Prevent Quasar from opening the project into a new browser tab as Cypress opens its own window
  api.extendQuasarConf(async (conf) => {
    conf.devServer.open = false;
  });

  if (api.prompts.options.includes('code-coverage')) {
    if (api.hasVite) {
      // TODO: known problem with Vue3 + Vite source maps: https://github.com/iFaxity/vite-plugin-istanbul/issues/14
      const { default: istanbul } = await import('vite-plugin-istanbul');

      api.extendViteConf((viteConf) => {
        viteConf.plugins.push(
          istanbul({
            exclude: ['.quasar/*'],
          }),
        );
      });
    } else {
      // TODO: add webpack code coverage support
      // See https://www.npmjs.com/package/istanbul-instrumenter-loader
      // https://github.com/vuejs/vue-cli/issues/1363#issuecomment-405352542
      // https://github.com/akoidan/vue-webpack-typescript

      api.extendWebpack((cfg, { isClient, isServer }, api) => {
        cfg.module.rules.push({
          test: /\.ts$/,
          use: [{
            loader: 'babel-loader',
            options: {
              presets: [['babel-preset-typescript-vue', { onlyRemoveTypeImports: true}]],
              plugins: [
                "@babel/plugin-proposal-optional-chaining",
                "@babel/plugin-proposal-numeric-separator",
                "@babel/plugin-proposal-nullish-coalescing-operator",
                ["@babel/plugin-proposal-decorators", {"legacy": true}],
                ["@babel/plugin-proposal-class-properties", {"loose": true}],
                ['istanbul'],
              ],
              babelrc: false,
            },
          }],
        });
        cfg.module.rules.push({
          exclude: /node_modules/,
          test: /\.vue$/,
          loader: 'vue-loader',
        });
        cfg.module.rules.push({
          test: /\.js$|\.vue$|\.ts$/,
          use: {
            loader: 'istanbul-instrumenter-loader',
            options: {
              esModules: true,
              produceSourceMap: true,
              fixWebpackSourcePaths: true
            }
          },
          enforce: 'post',
          exclude: /node_modules|\.spec\.js$/,
        });
      });

        /*api.chainWebpack(config => {
            config.module
                .rule('ts')
                .test(/\.js$|\.ts$|\.vue$|\.jsx$/)
                .exclude
                    .add(/quasar|node_modules|\.spec\.js$/)
                    .end()
                .use('istanbul')
                    .loader('istanbul-instrumenter-loader')
                    .options({esModules: true})
                    .before("ts-loader");
        });*/

      /*api.extendWebpack((cfg) => {
        cfg.module.rules.push({
          test: /\.js$|\.ts$|\.vue$|\.jsx$/,
          use: {
            loader: 'istanbul-instrumenter-loader',
            options: { esModules: true },
          },
          enforce: 'post',
          exclude: /quasar|node_modules|\.spec\.js$/,
        })
      })*/
    }
  }
};
