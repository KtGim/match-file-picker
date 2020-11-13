#!/usr/bin/env node 

const chalk = require('chalk');
const fs = require('fs');
const inquirer = require('inquirer');

const constants = require('./constants');

let defaultSettings = require('../lib/core/defaultSettings/index');
const {combineObj} = require('../lib/utils');

// 代码主程序
const searcher = require('../lib/index');

const {log} = console;

inquirer
  .prompt([
    {
      type: 'confirm',
      name: 'hasTs',
      message: '项目中是否已经包含 ts(typescript) 文件 解析环境',
      default: false
    }
  ])
  .then(answers => {
    defaultSettings.getInstance().inquirerOptions = {
      ...defaultSettings.inquirerOptions, 
    };
    const configPath = `${rootPath}/match-file.config.js`;
    const settings = defaultSettings.getInstance();
    // 如果项目中包含 ts 文件，那么需要添加 ts 解析包， 否则会报错
    if (!answers.hasTs) {
      settings.babelSetting.presets.push(['@babel/preset-typescript', {isTSX: true, allExtensions: true}]);
    }
    // 配置文件存在 读取配置文件内容并且执行
    if (fs.existsSync(configPath)) {
      // 获取文件内容， 并且传入主程序
      combineObj(settings, require(configPath));
    } else {
      log(chalk.red(`配置文件 ${chalk.green('match-file.config.js')} 不存在, 按默认配置解析`));
    }
    searcher(constants.WF);
  })
  .catch(err => {
    log(err);
    log(`${chalk.red(err)}`);
    process.exit(0);
  });
