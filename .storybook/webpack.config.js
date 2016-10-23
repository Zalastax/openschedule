const webpack = require('webpack')
const path = require('path')
const baseConfig = require('../webpack.config')
const utils = require('@kadira/storybook/dist/server/config/utils')

module.exports = function(storybookBase, env) {
  console.log(env)
  const config = baseConfig({
    // storybook adds its own index file
    disableIndex: true
  })

  const hmr = require.resolve('webpack-hot-middleware/client') + '?reload=true';

  config.entry = {
    manager: [
      require.resolve('@kadira/storybook/dist/server/config/polyfills'),
      require.resolve('@kadira/storybook/dist/client/manager'),
      hmr,
    ],
    preview: [
      require.resolve('@kadira/storybook/dist/server/config/polyfills'),
      require.resolve('@kadira/storybook/dist/server/config/error_enhancements'),
      hmr,
      require.resolve('./config.js')
    ]
  }

  config.plugins.push(
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin(utils.loadEnv())
  )

  config.plugins.shift()

  config.resolve.modules.push('@kadira/storybook-addons')

  config.output =  {
      path: path.join(__dirname, 'dist'),
      filename: 'static/[name].bundle.js',
      publicPath: '/',
    }

  return config
}
