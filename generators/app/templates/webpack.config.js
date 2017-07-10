
const pwd = process.cwd();

import path from 'path';
import fs from 'fs';
import webpack from 'webpack';
// import { TsConfigPathsPlugin } from 'awesome-typescript-loader';

export default function(webpackConfig, env){
  // 将 src 下子目录做别名映射
  const srcPath = path.join(pwd, 'src');
  const srcSubDirs = fs.readdirSync(srcPath);
  let srcSubDirAliasMap = {};
  srcSubDirs.forEach(subDir => {
    srcSubDirAliasMap['@' + subDir] = path.join(srcPath, subDir);
  });

  console.log(webpackConfig.resolve);
  webpackConfig.resolve.alias = srcSubDirAliasMap;
  // let TsConfigPathsPlugin = require('awesome-typescript-loader').TsConfigPathsPlugin;

  // eslint 加入webpackConfig
  // if('production' !== env){
  //   webpackConfig.module.preLoaders = webpackConfig.module.preLoaders || [];
  //   webpackConfig.module.preLoaders.push({
  //     test: /\.(js|jsx)$/,
  //     exclude: /node_modules/,
  //     loader: 'eslint'
  //   });
  // }

  // 剔除不必要的moment语言包
  webpackConfig.plugins.push(new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /zh\-cn/));
  // webpackConfig.resolve.plugins = [(new TsConfigPathsPlugin({
  //   configFileName: "tsconfig.json",
  //   compiler: "typescript",
  // }))];
  return webpackConfig;
}
