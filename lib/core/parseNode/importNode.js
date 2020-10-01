const path = require('path');
const {getPath} = require('../../utils');
// 查找 import 语句对用的文件
const nodeTypes = require('./nodeType/importNodeTypes');
// 忽略的名称

/**
 * @param {当前文件保存节点信息} nodeObj 
 * @param {当前文件解析路径} curFileName 
 * @param {全局文件节点保存新} rootContainer 
 */
module.exports = function(nodeObj = {}, curFileName, rootContainer = {}, defaultSettings) {
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
        } = defaultSettings;
        // 按需引入 或者 包含形式的路径   antd/*  antd/lib/*
        // 忽略样式导入文件
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
                const desFilePath = getPath(curFileName, source.value, defaultSettings);
                // const desFilePath = setFullNames([getPath(curFileName, source.value, defaultSettings)], defaultSettings)[0];
                // source.value 被引入的文件名 字符串, 去重
                if (desFilePath && nodeObj[type]) {
                    const lastFiles = (nodeObj[type][desFilePath]) || [];
                    lastFiles.push(local.name);
                    nodeObj[type][desFilePath] = lastFiles;
                }
            })
        },
        CallExpression(path) {
            if (path.node.callee.name === 'require') {
                const sourceName = path.node.arguments[0].value;
                const desFilePath = getPath(curFileName, sourceName, defaultSettings);
                const lastFiles = nodeObj[`Import${path.node.type}`][desFilePath] || [];
                const importTypeMark = `Import${path.node.type}`;
                path.traverse({
                    Literal(path) {
                        if (!isExcludeSource(path.node.value)) {
                            lastFiles.push(path.node.value);
                            nodeObj[importTypeMark][desFilePath] = lastFiles;
                        }
                    }
                })
            }
        }
    }
}