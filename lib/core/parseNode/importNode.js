const path = require('path');
const {getPath, addSuffix} = require('../../utils');
const defaultSettings = require('../defaultSettings');
// 查找 import 语句对用的文件
const nodeTypes = require('./nodeType/importNodeTypes');
// 忽略的名称

/**
 * @param {当前文件保存节点信息} nodeObj 
 * @param {当前文件解析路径} curFileName 
 * @param {全局文件节点保存新} rootContainer 
 */
module.exports = function(nodeObj = {}, curFileName, rootContainer = {}) {
    /**
     * map 保存 导入文件地址 => 导入名称的印射
     * 根据 节点类型
     */
    nodeTypes.forEach(type => {
        !nodeObj[type] && (nodeObj[type] = {});
    })

    function isExcludeSource(sourceName) {
        const {
            excludesProName,
            ignoresExt,
        } = defaultSettings.getInstance();
        // 按需引入 或者 包含形式的路径   antd/*  antd/lib/*
        // 忽略 固定后缀 导入文件 ignoresExt
        return (
            (
                excludesProName.indexOf(sourceName) > -1 ||
                    (excludesProName.some((name) => sourceName.startsWith(`${name}/`)))
            ) || (ignoresExt.indexOf(path.extname(sourceName)) > -1)
        );
    }

    return {
        // eslint 直接 拿到的是 node, babel 是 path.node
        ImportDeclaration(path) {
            const {
                specifiers,
                source,
            } = path.node;
            !isExcludeSource(source.value) && specifiers && specifiers.forEach((sf) => {
                const {
                    type, // ImportSpecifier | ImportDefaultSpecifier
                    local, // local.name 引入的 名称
                } = sf;
                const desFilePath = addSuffix(getPath(curFileName, source.value))
                // addSuffix(setPathPrefix(getPath(curFileName, source.value)))
                // const desFilePath = setFullNames([getPath(curFileName, source.value, defaultSettings)], defaultSettings)[0];
                // source.value 被引入的文件名 字符串, 去重
                if (desFilePath && nodeObj[type]) {
                    const lastFiles = (nodeObj[type][desFilePath]) || [];
                    lastFiles.push(local.name);
                    !(nodeObj[type][desFilePath]) && (nodeObj[type][desFilePath] = lastFiles);
                }
            })
        },
        CallExpression(path) {
            if (path.node.callee.name === 'require') {
                const sourceName = path.node.arguments[0].value; // 可能存在隐患
                const desFilePath = addSuffix(getPath(curFileName, sourceName));
                // addSuffix(setPathPrefix(getPath(curFileName, sourceName)));
                const importTypeMark = `Import${path.node.type}`;
                const lastFiles = nodeObj[importTypeMark][desFilePath] || [];
                if (desFilePath) {
                    path.traverse({
                        Literal(path) {
                            if (!isExcludeSource(path.node.value)) {
                                lastFiles.push(path.node.value);
                                !nodeObj[importTypeMark][desFilePath] && (nodeObj[importTypeMark][desFilePath] = lastFiles);
                            }
                        }
                    })
                }
            }
        },
        Import(path) { // component: () => Import('.../AAA.jsx');
            const sources = path.container.arguments;
            let desFilePath, lastFiles;
            sources.forEach(sr => {
                desFilePath = addSuffix(getPath(curFileName, sr.value));
                lastFiles = nodeObj['ImportListSource'][desFilePath] || [];
                lastFiles.push(desFilePath); // 引入组件，没有引入里面的方法或者变量
                !nodeObj['ImportListSource'][desFilePath] && (nodeObj['ImportListSource'][desFilePath] = lastFiles);
            })
        }
    }
}