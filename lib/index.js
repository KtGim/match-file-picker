const path = require('path');
const fs = require('fs');
const { program } = require('commander');
const {init} = require('./core/parser');
const {parseResult, getEffectiveFiles} = require('./core/exports');
const defaultSettings = require('./core/defaultSettings');
const chalk = require('chalk');
const {deleteFiles, spinning} = require('./utils');
const {promisify} = require('util')

const constants = require('../bin/constants');

const {log} = console;
/**
 * 
 * @param {配置信息} opts 
 */
module.exports = function(entryPoint) {
    program
    .option('-d, --pathname <pathname>', '路径必填');

    const dirname = program.parse(process.argv).pathname;
    if (!dirname) {
        log(chalk.red('文件路径必传'));
        process.exit(-1);
    }
    const rootPath = path.isAbsolute(dirname) ? dirname: path.resolve(dirname);
    const rootContainer = {};
    
    init(rootPath, rootContainer, entryPoint);

    if (entryPoint === constants.WF) {
        console.log(getEffectiveFiles(rootContainer, rootPath));
    } else {
        const [excludeList, totalList, importFiles, exportsFiles] = parseResult(rootContainer);
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
                const writeFileSync = promisify(fs.writeFileSync);
                Promise.all([
                    writeFileSync(`${resultDirName}/result.txt`, excludeList.join(',\n'), 'utf-8'),
                    writeFileSync(`${resultDirName}/total.txt`, totalList.join(',\n'), 'utf-8'),
                    writeFileSync(`${resultDirName}/imports.txt`, importFiles.join(',\n'), 'utf-8'),
                    writeFileSync(`${resultDirName}/exports.txt`, exportsFiles.join(',\n'), 'utf-8'),
                ]).then(() => {
                    log(chalk.green('写入完成'));
                }).catch(err => {
                    log(chalk.red('写入失败'));
                    process.exit(-1);
                })
                // fs.writeFileSync(`${resultDirName}/result.txt`, excludeList.join(',\n'), 'utf-8');
                // fs.writeFileSync(`${resultDirName}/total.txt`, totalList.join(',\n'), 'utf-8');
                // fs.writeFileSync(`${resultDirName}/imports.txt`, importFiles.join(',\n'), 'utf-8');
                // fs.writeFileSync(`${resultDirName}/exports.txt`, exportsFiles.join(',\n'), 'utf-8');
            }, "正在写入文件，请稍后 >>>\n", 'green');
        } else {
            log(excludeList);
        }
    }
}