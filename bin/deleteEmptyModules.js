#!/usr/bin/env node 

const chalk = require('chalk');
const inquirer = require('inquirer');
const { program } = require('commander');
const path = require('path');
const fs = require('fs');

const {combineObj, getEmptyDirs} = require('../lib/utils');
let defaultSettings = require('../lib/core/defaultSettings/index');

const {log} = console;

program
    .option('-d, --pathname <pathname>', '目录的相对或者绝对路径必填');

const dirname = program.parse(process.argv).pathname;

if (!dirname) {
    console.log(chalk.red('请使用命令输入文件路径'));
    process.exit(1);
}


const rootPath = path.isAbsolute(dirname) ? dirname: path.resolve(dirname);
const configPath = `${rootPath}/match-file.config.js`;
// 配置文件存在 读取配置文件内容并且执行
if (fs.existsSync(configPath)) {
    // 获取文件内容， 并且传入主程序
    combineObj(defaultSettings.getInstance(), require(configPath));
} else {
    console.log(chalk.red(`配置文件 ${chalk.green('match-file.config.js')} 不存在, 按默认配置解析`));
}

inquirer
  .prompt([
    {
      type: 'confirm',
      name: 'autoDelete',
      message: `${chalk.red(`确认自动删除该目录下的空文件夹？（${rootPath}）`)}`,
      default: false
    }
  ])
  .then(answers => {
    const {
        autoDelete
    } = answers;
    if (autoDelete) {
        console.log(chalk.red(`删除以下目录`));
    } else {
        console.log(chalk.red(`以下目录内容为空`));
    }
    getEmptyDirs(rootPath, autoDelete);
  })
  .catch(err => {
    log(`${chalk.red(err)}`);
});



