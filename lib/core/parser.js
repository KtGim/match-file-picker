const babel = require("@babel/core");
const fs = require("fs");
const chalk = require("chalk");
const path = require("path");

const importNodesParser = require('./parseNode/importNode.js');
const exportNodeParser = require('./parseNode/exportNode');
const {spinning} = require('../utils');

const constants = require('../../bin/constants');

const defaultSettings = require('../core/defaultSettings/index');

/**
 * @param {当前文件路径}    filepath 
 * @param {当前文件信息对象} curRootContainer
 * @param {全局信息保存对象} rootContainer 
 */
function parseAtsNode(filepath, curRootContainer, rootContainer, entryPoint) {
    return function() {
        const fileCode = fs.readFileSync(filepath, 'utf-8');
        const ast = babel.parseSync(fileCode,
            {
                filename: filepath, // 不设置的话，解析 ts 会抛出异常
                ...defaultSettings.getInstance().babelSetting,
            }
        );

        // entryPoint === constants.WF 时表示，只需要查找文件的导入节点 即可
        const configs = entryPoint === constants.WF ? {
            ...importNodesParser(curRootContainer, filepath, rootContainer),
        } : {
            ...importNodesParser(curRootContainer, filepath, rootContainer),
            ...exportNodeParser(curRootContainer, filepath, rootContainer),
        }

        babel.traverse(ast, configs);
    }
}

/**
 * 同步遍历目录下文件
 * @param {目录绝对路径}           filePath
 * @param {全局文件节点信息对象}    rootContainer
 * @param {配置信息}              opts
 */
function readFilesToAsts(filePath, rootContainer, entryPoint) {
    // 读目录
    const dirs = fs.readdirSync(filePath, 'utf-8');
    const {
        matchEsExt = [],
        matchStyleExt = [],
        excludeModulesName = [],
    } = defaultSettings.getInstance();
    const excludeFunc = isExcludedModule(excludeModulesName);
    const filesExt = [...matchEsExt, ...matchStyleExt];
    dirs.forEach(dir => {
        const curDirPath = path.join(filePath, dir);
        if (excludeFunc(dir)) {
            console.log(chalk.red(`忽略该目录: ${curDirPath}\n`));
            return;
        }
        const childDir = fs.statSync(curDirPath);
        const pathExtname = path.extname(curDirPath);
        if (childDir.isFile() && (filesExt.indexOf(pathExtname) > -1)) {
            if (!rootContainer[curDirPath]) {
                rootContainer[curDirPath] = {};
            }
            // console.log(`当前读取文件:`, curDirPath);
            // 不是样式文件进行解析， 目前不支持样式的解析但是可以保存样式文件的引用信息， 里面没有 estree 节点
            if (!matchStyleExt.some(ext => curDirPath.includes(ext))) {
                parseAtsNode(curDirPath, rootContainer[curDirPath], rootContainer, entryPoint)();
            } else {
                if (!rootContainer[curDirPath]['ImportSpecifier']) {
                    rootContainer[curDirPath]['ImportSpecifier'] = {};
                }
                rootContainer[curDirPath]['ImportSpecifier'][curDirPath] = [curDirPath];
            }
        } else if (childDir.isDirectory()) {
            // console.log('当前读取目录:', curDirPath);
            // dirNames.push(curDirPath)
            readFilesToAsts(curDirPath, rootContainer, entryPoint);
        }
    })
}

function init(filePath, rootContainer, entryPoint) {
    const filePathInfo = fs.statSync(filePath);
    const {
        moduleNames = [],
        excludeModulesName = [],
    } = defaultSettings.getInstance();
    const excludeFunc = isExcludedModule(excludeModulesName);
    if (filePathInfo.isFile()) {
        // 读文件
        spinning(function() {
            if (!rootContainer[filePath]) {
                rootContainer[filePath] = {};
            }
            parseAtsNode(filePath, rootContainer[filePath], rootContainer, entryPoint)();
        }, '开始扫描文件 >>>\n', 'green');
    } else if (filePathInfo.isDirectory()) {
        spinning(function() {
            if (moduleNames.length > 0) {
                moduleNames.forEach(dir => {
                    if (!excludeFunc(dir)) {
                        const pathname = path.resolve(filePath, dir)
                        console.log(chalk.green(`正在读取目录: ${pathname}\n`));
                        readFilesToAsts(pathname, rootContainer, entryPoint);
                    } else {
                        console.log(chalk.red(`忽略该目录: ${pathname}\n`));
                    }
                })
            } else {
                readFilesToAsts(filePath, rootContainer, entryPoint);
            }
        }, '正在扫描目录 >>>\n', 'green');
    }
    
}

function isExcludedModule(modules) {
    return function(moduleName) {
        return modules.indexOf(moduleName) > -1;
    }
}

module.exports = {
    parseAtsNode,
    init,
}