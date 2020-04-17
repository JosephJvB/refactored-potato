// https://www.gorillastack.com/news/optimizing-your-lambda-cold-starts-with-serverless-webpack/
const slsw = require('serverless-webpack')
const path = require('path')
module.exports = {
  target: 'node',
  entry: slsw.lib.entries,
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  node: false,
  devtool: 'inline-cheap-module-source-map',
  optimization: {
    minimize: false, // minimize has little performance improvement, and makes stack traces harder to read
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [
          /node_modules/,
          path.join(__dirname, 'tests')
        ],
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/preset-env',
                  { targets: { node: '12' }, useBuiltIns: 'usage', corejs: 3 }
                ]
              ],
              plugins: [
                '@babel/plugin-proposal-class-properties'
              ]
            }
          }
        ]
      }
    ]
  },
}
