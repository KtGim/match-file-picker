const path = require('path');
const fs = require('fs');
const { program } = require('commander');
const {init} = require('./core/parser');
const parseResult = require('./core/exports');
const defaultSettings = require('./core/defaultSettings');
const chalk = require('chalk');
const {deleteFiles, spinning} = require('./utils');

const {log} = console;
/**
 * 
 * @param {配置信息} opts 
 */
module.exports = function() {
    program
        .option('-d, --pathname <pathname>', '相对或者绝对路径必填');

    const dirname = program.parse(process.argv).pathname;

    const rootPath = path.isAbsolute(dirname) ? dirname: path.resolve(dirname);
    
    const rootContainer = {};
    
    init(rootPath, rootContainer);

    const [excludeList, totalList] = parseResult(rootContainer);
    const inquirerOptions = defaultSettings.getInstance().inquirerOptions;
    const {
        autoDelete = false, // 自动删除
        outputType = false, // 写入文件
    } = inquirerOptions;
    if (autoDelete) {
        deleteFiles(excludeList);
    } else if (outputType) { 
        spinning(function() {
            const resultDirName = `${rootPath}/.mf-results`;
            // undefined 或者目录名
            const createDirOk = fs.mkdirSync(resultDirName, {recursive: true});
            if (!createDirOk) {
                log(`目录已经创建`);
            }
            fs.writeFileSync(`${resultDirName}/result.txt`, excludeList.join(',\n'), 'utf-8');
            fs.writeFileSync(`${resultDirName}/total.txt`, totalList.join(',\n'), 'utf-8');
            log(chalk.green('写入完成'));
        }, "正在写入文件，请稍后 >>>\n", 'green')
    } else {
        log(excludeList);
    }
}