#!/usr/bin/env node 

const chalk = require('chalk');
const fs = require('fs');

let defaultSettings = require('../lib/core/defaultSettings/index');
const {combineObj} = require('../lib/utils');

// 代码主程序
const searcher = require('../lib/index');

const {log} = console;

const rootPath = process.env.PWD;

if (!rootPath) {
   log((chalk.red('获取不到当前执行根目录， 请查看当前执行目录环境')));
   // 退出环境
   process.exit(1);
}

const configPath = `${rootPath}/match-file.config.js`;
try {
    // 配置文件存在 读取配置文件内容并且执行
    fs.accessSync(configPath);
    // 获取文件内容， 并且传入主程序
    combineObj(defaultSettings, require(configPath));
} catch(err) {
    log(chalk.red(`配置文件 ${chalk.green('match-file.config.js')} 不存在, 按默认配置解析`));
}

// 异常捕获
// try {
//     searcher(defaultSettings);
// } catch(err) {
//     log(`${chalk.red(err)}`);
// }

searcher();



