const babel = require("@babel/core");
const fs = require("fs");
const chalk = require("chalk");
const path = require("path");
const ora = require('ora');
const spinner = ora();

const importNodesParser = require('./parseNode/importNode.js');
const exportNodeParser = require('./parseNode/exportNode');

/**
 * @param {当前文件路径}    filepath 
 * @param {当前文件信息对象} curRootContainer
 * @param {全局信息保存对象} rootContainer 
 */
function parseAtsNode(filepath, curRootContainer, rootContainer, defaultSettings) {
    return function() {
        const fileCode = fs.readFileSync(filepath, 'utf-8');
        const ast = babel.parseSync(fileCode,
            {
                filename: filepath, // 不设置的话，解析 ts 会抛出异常
                ...defaultSettings.babelSetting,
            }
        );

        babel.traverse(ast, {
            ...importNodesParser(curRootContainer, filepath, rootContainer, defaultSettings),
            ...exportNodeParser(curRootContainer, filepath, rootContainer, defaultSettings),
        })
    }
}

/**
 * 同步遍历目录下文件
 * @param {目录绝对路径}           filePath
 * @param {全局文件节点信息对象}    rootContainer
 * @param {配置信息}              opts
 */
function readFilesToAsts(filePath, rootContainer, defaultSettings) {
    // 读目录
    const dirs = fs.readdirSync(filePath, 'utf-8');
    dirs.forEach(dir => {
        const curDirPath = path.join(filePath, dir);
        const childDir = fs.statSync(curDirPath);
        const pathExtname = path.extname(curDirPath);
        if (childDir.isFile() && (defaultSettings.matchFileExt.indexOf(pathExtname) > -1)) {
            if (!rootContainer[curDirPath]) {
                rootContainer[curDirPath] = {};
            }
            // console.log(`当前读取文件:`, curDirPath);
            parseAtsNode(curDirPath, rootContainer[curDirPath], rootContainer, defaultSettings)();
            // fileNames.push(curDirPath)
        } else if (childDir.isDirectory()) {
            // console.log('当前读取目录:', curDirPath);
            // dirNames.push(curDirPath)
            readFilesToAsts(curDirPath, rootContainer, defaultSettings);
        }
    })
}

function init(filePath, rootContainer, defaultSettings) {
    const {
        moduleNames,
    } = defaultSettings;
    if (moduleNames.length > 0) {
        moduleNames.forEach(dir => {
            spinner.start(`正在扫描目录 >>>`);
            console.log(chalk.green(`\n${path.resolve(filePath, dir)}`));
            parseFiles(path.resolve(filePath, dir), rootContainer, defaultSettings);
            spinner.stop();
        })
    } else {
        spinner.start(`正在扫描文件 >>>`);
        parseFiles(filePath, rootContainer, defaultSettings)
        spinner.stop();
    }
}

function parseFiles(filePath, rootContainer, defaultSettings) {
    const filePathInfo = fs.statSync(filePath);
    if (filePathInfo.isFile()) {
        // 读文件
        parseAtsNode(filePath, rootContainer[filePath], rootContainer, defaultSettings)();
    } else if (filePathInfo.isDirectory()) {
        readFilesToAsts(filePath, rootContainer, defaultSettings);
    }
}

module.exports = {
    parseAtsNode,
    init,
}