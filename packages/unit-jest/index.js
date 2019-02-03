/**
 * Quasar App Extension index/runner script
 * (runs on each dev/build)
 *
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/IndexAPI.js
 */

module.exports = function (api, ctx) {
  // api.extendQuasarConf(conf => {
    // console.log('extendQuasarConf')
    // console.log('  conf', conf !== void 0)
    // console.log('conf.css', conf.css)
  // })

  // console.log('api.quasarAppVersion', api)

  api.prompts.options.forEach((val) => {
    if (val === 'SFC') {
      api.chainWebpack((chain, invoke) => {
        chain.module.rule('jest')
        .test(/\.jest$/)
        .use('jest')
        .loader(require.resolve(`${api.appDir}/test/loaders/jest-loader.js`))
      })
    }
  })
}