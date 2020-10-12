#!/usr/bin/env node 

const chalk = require('chalk');
const fs = require('fs');
const inquirer = require('inquirer');

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

inquirer
  .prompt([
    {
        type: 'list',
        choices: [
            '打印结果到控制台',
            '输出结果到文件'
        ],
        name: 'outputType',
        message: '请选择将解析结果进行输出的方式',
    },
    {
      type: 'confirm',
      name: 'autoDelete',
      message: '是否自动删除筛选结果（请慎重考虑）',
      default: false
    }
  ])
  .then(answers => {
    defaultSettings.getInstance().inquirerOptions = {
      ...defaultSettings.inquirerOptions, 
      ...{outputType: answers.outputType === '输出结果到文件'},
      ...{autoDelete: answers.autoDelete},
    };
    const configPath = `${rootPath}/match-file.config.js`;
    // 配置文件存在 读取配置文件内容并且执行
    if (fs.existsSync(configPath)) {
      // 获取文件内容， 并且传入主程序
      combineObj(defaultSettings.getInstance(), require(configPath));
    } else {
      log(chalk.red(`配置文件 ${chalk.green('match-file.config.js')} 不存在, 按默认配置解析`));
    }
    searcher();
  })
  .catch(err => {
    log(`${chalk.red(err)}`);
});



