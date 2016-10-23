const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin')
const caseSensitivePathsWebpackPlugin = require('case-sensitive-paths-webpack-plugin')
const path = require('path')

const cssNameGenerator = require('css-class-generator')
const nameIt = cssNameGenerator('_')

module.exports = function (maybeEnv) {
  const env = maybeEnv || {}
  const nameCache = {}

  let devtool = 'cheap-module-eval-source-map'


  const publicPath = env.production ? undefined : '/'
  const sourceMap = !env.disableSourceMap
  const serverUrl = env.firebase ? 'https://quiet-headland-30358.herokuapp.com' : 'http://localhost:3000'
  const defines = {
    SERVER_URL: JSON.stringify(serverUrl),
  }

  const plugins = [
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en/),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new caseSensitivePathsWebpackPlugin(),
    new WatchMissingNodeModulesPlugin(path.resolve('node_modules'))
  ]

  const styleLoader = {
    loader: 'style',
    query: {
      sourceMap,
    }
  }
  let wrapCss = loaders => [styleLoader, ...loaders]

  const tsLoaders = ['awesome-typescript-loader']
  const entry = ['./src/index.tsx']

  if (env.hmr) {
    tsLoaders.unshift('react-hot')
    plugins.push(new webpack.NamedModulesPlugin())
  }

  if (env.production) {
    plugins.push(
      new webpack.LoaderOptionsPlugin({
        options: {
          cssLoader: {
            customInterpolateName: function (originalName) {
              let newName = nameCache[originalName]
              if (newName == undefined) {
                newName = nameIt.next().value
                nameCache[originalName] = newName
              }
              return newName
            },
            sourceMap,
          }
        }
      }),
      new webpack.optimize.UglifyJsPlugin({ sourceMap }),
      new ExtractTextPlugin({
        filename: 'styles-[hash].css',
        allChunks: true,
      })
    )

    wrapCss = loader => ExtractTextPlugin.extract({
      fallbackLoader: styleLoader,
      loader
    })

    devtool = 'source-map'

    Object.assign(defines, {
      'process.env': {
        'NODE_ENV': '"production"'
      }
    })
  }

  if (!sourceMap) {
    devtool = undefined
  }

  plugins.push(new webpack.DefinePlugin(defines))

  if (!env.disableIndex) {
    plugins.push(new HtmlWebpackPlugin({
      template: 'src/index.template.ejs',
      inject: 'body',
    }))
  }

  return {
    resolve: {
      extensions: ['.ts', '.tsx', '.webpack.js', '.web.js', '.js'],
      modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    },
    devtool,
    entry,
    output: {
      path: __dirname + '/build',
      filename: './bundle.js',
      publicPath,
    },
    module: {
      loaders: [
        { test: /\.tsx?$/, exclude: /node_modules/, loaders: tsLoaders },
        { test: /\.scss$/, loaders: wrapCss([
          {
            loader: 'typings-for-css-modules',
            query: {
              sourceMap,
              modules: true,
              importLoaders: 1,
              namedExport: true,
              localIdentName: '[name]__[local]___[hash:base64:5]',
              minimize: !!env.production,
            }
          },
          {
            loader: 'sass',
            query: {
              sourceMap,
            }
          },
        ])},
        { test: /\.styl$/, loaders: wrapCss([
          {
            loader: 'typings-for-css-modules',
            query: {
              sourceMap,
              modules: true,
              importLoaders: 1,
              namedExport: true,
              localIdentName: '[name]__[local]___[hash:base64:5]',
              minimize: !!env.production,
            }
          },
          {
            loader: 'stylus',
            query: {
              sourceMap,
            }
          },
        ])},
        { test: /\.json$/, loader: 'json' },
      ]
    },
    plugins: plugins,
  }
}
