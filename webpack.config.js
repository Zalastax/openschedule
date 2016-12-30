const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin')
const caseSensitivePathsWebpackPlugin = require('case-sensitive-paths-webpack-plugin')
const path = require('path')

const cssNameGenerator = require('css-class-generator')
const nameIt = cssNameGenerator('_')

/* tslint:disable: object-literal-sort-keys */

const isDevServer = process.argv[1].indexOf('webpack-dev-server') !== -1
let hash = 'chunkhash'
if (isDevServer) {
  hash = 'hash'
}

function vendorSplit(base, parts, log) {
  const partsCopy = parts.slice()
  function test(str, module) {
    return ('' + module.resource).indexOf(str) !== -1
  }

  function willRemain(module) {
    return test(base, module) && (!partsCopy.some(name => test(name, module)))
  }

  const plugins = [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      // all node modules are moved to vendor, otherwise other CommonsChunkPlugin won't see them
      minChunks: module => {
        if (log && willRemain(module)) {
          console.log('In vendor:', module.resource)
        }
        return test(base, module)
      },
    })
  ]

  const remaining = parts.slice()

  while (remaining.length > 0) {
    const copy = remaining.slice()
    remaining.shift()
    plugins.push(new webpack.optimize.CommonsChunkPlugin({
      name: copy[0].replace(/\W/g, ''),
      minChunks: module => test(base, module) && (copy.some(name => test(name, module))),
    }))
  }

  return plugins
}

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

  let vendors = []
  if (env.splitVendors) {
    vendors = ['core-js', 'typescript-collections', 'lodash',
                      'rxjs', 'redux', 'tether', 'fbjs', 'moment', 'symbol-observable', '\\react\\', '\\react-dom\\']
  }

  const plugins = [
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en-gb/),
    new webpack.optimize.OccurrenceOrderPlugin(true),
    new caseSensitivePathsWebpackPlugin(),
    new WatchMissingNodeModulesPlugin(path.resolve('node_modules')),
    new webpack.LoaderOptionsPlugin({
      options: {
        context: __dirname,
        tslint: {
          emitErrors: false,
          failOnHint: false,
        },
      },
    }),
    ...vendorSplit('node_modules', vendors),
  ]

  const styleLoader = {
    loader: 'style-loader',
    query: {
      sourceMap,
    },
  }
  let wrapCss = loaders => [styleLoader, ...loaders]

  const tsLoaders = ['awesome-typescript-loader']
  const appEntry = ['./src/index.tsx']

  if (env.hmr) {
    appEntry.unshift('react-hot-loader/patch')
    tsLoaders.unshift('react-hot-loader/webpack')
    plugins.push(new webpack.NamedModulesPlugin())
  }

  if (env.production) {
    plugins.push(
      new webpack.LoaderOptionsPlugin({
        options: {
          context: __dirname,
          cssLoader: {
            customInterpolateName: function (originalName) {
              let newName = nameCache[originalName]
              if (newName == null) {
                newName = nameIt.next().value
                nameCache[originalName] = newName
              }
              return newName
            },
            sourceMap,
          },
        },
      }),
      new webpack.optimize.UglifyJsPlugin({ sourceMap }),
      new ExtractTextPlugin({
        allChunks: true,
        filename: `styles-[${hash}].css`,
      })
    )

    wrapCss = loader => ExtractTextPlugin.extract({
      fallbackLoader: styleLoader,
      loader,
    })

    devtool = 'source-map'

    Object.assign(defines, {
      'process.env': {
        'NODE_ENV': '"production"',
      },
    })
  }

  if (!sourceMap) {
    devtool = undefined
  }

  plugins.push(new webpack.DefinePlugin(defines))

  if (!env.disableIndex) {
    plugins.push(new HtmlWebpackPlugin({
      chunksSortMode: 'dependency',
      inject: 'body',
      template: 'src/index.template.ejs',
    }))
  }

  return {
    resolve: {
      extensions: ['.ts', '.tsx', '.webpack.js', '.web.js', '.js'],
      modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    },
    devtool,
    entry: {
      app: appEntry,
      //vendor: vendorEntry,
    },
    output: {
      filename: `[name].[${hash}].js`,
      path: __dirname + '/build',
      publicPath,
    },
    module: {
      loaders: [
        { test: /\.tsx?$/, exclude: /node_modules/, loaders: tsLoaders },
        {
          test: /\.tsx?$/,
          loader: 'tslint-loader',
          enforce: 'pre',
        },
        { test: /\.scss$/, loaders: wrapCss([
          {
            loader: 'typings-for-css-modules-loader',
            query: {
              sourceMap,
              modules: true,
              importLoaders: 1,
              namedExport: true,
              localIdentName: '[name]__[local]___[hash:base64:5]',
              minimize: !!env.production,
            },
          },
          {
            loader: 'sass-loader',
            query: {
              sourceMap,
            },
          },
        ])},
        { test: /\.styl$/, loaders: wrapCss([
          {
            loader: 'typings-for-css-modules-loader',
            query: {
              sourceMap,
              modules: true,
              importLoaders: 1,
              namedExport: true,
              localIdentName: '[name]__[local]___[hash:base64:5]',
              minimize: !!env.production,
            },
          },
          {
            loader: 'stylus-loader',
            query: {
              sourceMap,
            },
          },
        ])},
        { test: /\.json$/, loader: 'json-loader' },
      ],
    },
    plugins: plugins,
  }
}
