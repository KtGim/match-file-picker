// 查找 export 语句对用的文件
const nodeTypes = require('./nodeType/exportNodeTypes');
const {getPath, addSuffix} = require('../../utils');

/**
 * @param {保存导出信息}        nodeObj 
 * @param {导出文件都在当前目录} curFileName 
 * @param {全局文件保存节点信息} rootContainer
 */
module.exports = function(nodeObj = {}, curFileName, rootContainer = {}) {
    nodeTypes.forEach(type => {
        !nodeObj[type] && (nodeObj[type] = []);
    })
    return {
        ExportNamedDeclaration(path) {
            const {
                specifiers,
                declaration,
                source,
            } = path.node;
            if (!declaration) {
                /**
                 * export {
                 *  C
                 * }
                 */
                let curInfo = [];
                specifiers && specifiers.forEach((sf) => {
                    const {
                        type,
                        exported,
                    } = sf;
                    // type 为 ExportSpecifier
                    if (type) {
                        // curInfo = nodeObj[type] || [];
                        curInfo.push(exported.name)
                    }
                })
                if (source) { // ImportedToExportingFilePath
                    const exportImportedFilePath = addSuffix(getPath(curFileName, source.value));
                    if (exportImportedFilePath) {
                        rootContainer[curFileName] = rootContainer[curFileName] || {};
                        rootContainer[curFileName]['ImportedToExportingFilePath'] = rootContainer[curFileName]['ImportedToExportingFilePath'] || [];
                        rootContainer[curFileName]['ImportedToExportingFilePath'][exportImportedFilePath] = curInfo;
                    }
                }
            } else {
                /**
                 * export const AA = {
                 *  name: 'AA'
                 * }
                 */
                if (declaration.declarations) {
                    declaration.declarations.forEach(item => {
                        const {
                            id: {
                                type,
                                name
                            },
                        } = item;
                        // Identifier 无法区分  添加 Export 方便后期数据筛选
                        const curInfo = nodeObj[`Export${type}`] || [];
                        curInfo.push(name)
                    })
                } else {
                    const curInfo = nodeObj['ExportIdentifier'] || [];
                    curInfo.push(declaration.id.name)
                }
            }
        },

        ExportDefaultDeclaration(path) {
            // 自定义默认导出类型  DefaultIdentifier  ==> export default A
            // ClassDeclaration export default class A
            if (nodeObj[`Export${path.node.declaration.type}`]) {
                let nodeName = path.node.declaration.name;
                if (!nodeName) {
                    if (path.node.declaration.id) {
                        nodeName = path.node.declaration.id.name;
                    }
                }
                if (!nodeName) {
                    if (path.node.declaration.left) {
                        nodeName = path.node.declaration.left.name;
                    }
                }
                nodeObj[`Export${path.node.declaration.type}`].push(nodeName);
            }
        },
        ExportAllDeclaration(path) {
            const exportImportedFilePath = addSuffix(getPath(curFileName, path.node.source.value));
            rootContainer[curFileName] = rootContainer[curFileName] || {};
            rootContainer[curFileName]['ImportedToExportAllDeclaration'] = rootContainer[curFileName]['ImportedToExportAllDeclaration'] || [];
            rootContainer[curFileName]['ImportedToExportAllDeclaration'][exportImportedFilePath] = `defaultFrom_${curFileName}`; // 保存引入地址
        }
    }
}