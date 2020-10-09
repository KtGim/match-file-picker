const babel = require("@babel/core");
const fs = require("fs");
const chalk = require("chalk");
const path = require("path");
const ora = require('ora');
const spinner = ora();

const importNodesParser = require('./parseNode/importNode.js');
const exportNodeParser = require('./parseNode/exportNode');
const {stylesExt} = require('../utils');

const defaultSettings = require('../core/defaultSettings/index');

/**
 * @param {当前文件路径}    filepath 
 * @param {当前文件信息对象} curRootContainer
 * @param {全局信息保存对象} rootContainer 
 */
function parseAtsNode(filepath, curRootContainer, rootContainer) {
    return function() {
        const fileCode = fs.readFileSync(filepath, 'utf-8');
        const ast = babel.parseSync(fileCode,
            {
                filename: filepath, // 不设置的话，解析 ts 会抛出异常
                ...defaultSettings.getInstance().babelSetting,
            }
        );
        babel.traverse(ast, {
            ...importNodesParser(curRootContainer, filepath, rootContainer),
            ...exportNodeParser(curRootContainer, filepath, rootContainer),
        })
    }
}

/**
 * 同步遍历目录下文件
 * @param {目录绝对路径}           filePath
 * @param {全局文件节点信息对象}    rootContainer
 * @param {配置信息}              opts
 */
function readFilesToAsts(filePath, rootContainer) {
    // 读目录
    const dirs = fs.readdirSync(filePath, 'utf-8');
    dirs.forEach(dir => {
        const curDirPath = path.join(filePath, dir);
        const childDir = fs.statSync(curDirPath);
        const pathExtname = path.extname(curDirPath);
        if (childDir.isFile() && (defaultSettings.getInstance().matchFileExt.indexOf(pathExtname) > -1)) {
            if (!rootContainer[curDirPath]) {
                rootContainer[curDirPath] = {};
            }
            // console.log(`当前读取文件:`, curDirPath);
            // 不是样式文件进行结息， 目前不支持样式的解析但是可以保存样式文件的引用信息， 里面没有 estree 节点
            if (!stylesExt.some(ext => curDirPath.includes(ext))) {
                parseAtsNode(curDirPath, rootContainer[curDirPath], rootContainer)();
            }
            // fileNames.push(curDirPath)
        } else if (childDir.isDirectory()) {
            // console.log('当前读取目录:', curDirPath);
            // dirNames.push(curDirPath)
            readFilesToAsts(curDirPath, rootContainer);
        }
    })
}

function init(filePath, rootContainer) {
    const filePathInfo = fs.statSync(filePath);
    const {
        moduleNames = []
    } = defaultSettings.getInstance();
    if (filePathInfo.isFile()) {
        // 读文件
        spinner.start(`正在扫描文件 >>>`);
        // console.log(filePath);
        if (!rootContainer[filePath]) {
            rootContainer[filePath] = {};
        }
        parseAtsNode(filePath, rootContainer[filePath], rootContainer)();
    } else if (filePathInfo.isDirectory()) {
        spinner.start(`正在扫描目录 >>>`);
        if (moduleNames.length > 0) {
            moduleNames.forEach(dir => {
                console.log(chalk.green(`\n${path.resolve(filePath, dir)}`));
                readFilesToAsts(path.resolve(filePath, dir), rootContainer);
            })
        } else {
            readFilesToAsts(filePath, rootContainer);
        }
    }
    spinner.stop();
}

module.exports = {
    parseAtsNode,
    init,
}