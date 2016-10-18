const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const cssNameGenerator = require('css-class-generator')
const nameIt = cssNameGenerator('_')

module.exports = function (maybeEnv) {
  const env = maybeEnv || {}
  const nameCache = {}

  let devtool = 'cheap-module-eval-source-map'
                    
  
  const publicPath = env.production ? undefined : '/'
  const sourceMap = !env.disableSourceMap

  const plugins = [
    new HtmlWebpackPlugin({
      template: 'src/index.template.ejs',
      inject: 'body',
    }),
  ]

  const styleLoader = {
    loader: 'style',
    query: {
      sourceMap,
    }
  }

  let wrapCss = loaders => [styleLoader, ...loaders]

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
      new webpack.DefinePlugin({
        'process.env': {
          'NODE_ENV': '"production"'
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
  }

  if (!sourceMap) {
    devtool = undefined
  }

  return {
    resolve: {
      extensions: ['.ts', '.tsx', '.webpack.js', '.web.js', '.js']
    },
    devtool,
    entry: './src/index.tsx',
    output: {
      path: __dirname + '/build',
      filename: './bundle.js',
      publicPath,
    },
    module: {
      loaders: [
        { test: /\.tsx?$/, exclude: /node_modules/, loader: 'awesome-typescript-loader' },
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
