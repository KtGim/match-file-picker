// 查找 export 语句对用的文件
const nodeTypes = require('./nodeType/exportNodeTypes');
const {getPath} = require('../../utils');

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
                specifiers && specifiers.forEach((sf) => {
                    const {
                        type,
                        local,
                    } = sf;
                    // type 为 ExportSpecifier
                    if (type) {
                        const curInfo = nodeObj[type] || [];
                        curInfo.push(local.name)
                    }
                })
                if (source) { // ImportedToExportingFilePath
                    // console.log(curFileName, '++++++++++++++', source.value)
                    const exportImportedFilePath = getPath(curFileName, source.value);
                    // const exportImportedFilePath = setFullNames([getPath(curFileName, source.value, defaultSettings)], defaultSettings)[0];
                    if (exportImportedFilePath) {
                        // console.log(exportImportedFilePath, '---------------------');
                        rootContainer[curFileName] = rootContainer[curFileName] || {};
                        rootContainer[curFileName]['ImportedToExportingFilePath'] = rootContainer[curFileName]['ImportedToExportingFilePath'] || [];
                        rootContainer[curFileName]['ImportedToExportingFilePath'][exportImportedFilePath] = curFileName; // 保存引入文件的地址
                    }
                }
            } else {
                /**
                 * export const AA = {
                 *  name: 'AA'
                 * }
                 */
                declaration.declarations && declaration.declarations.forEach(item => {
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
            }
        },

        // AssignmentExpression(path) {
        //     console.log(nodeObj['ExportAssignmentExpression'], path.node.left.name, '-=-=');
        //     nodeObj['ExportAssignmentExpression'].push(path.node.left.name);
        // },
        // ClassDeclaration(path) {
        //     nodeObj['ExportClassDeclaration'] && nodeObj['ExportClassDeclaration'].push(path.node.id.name);
        // },
        // ExportDefaultDeclaration(path) {
        //     nodeObj['ExportDefaultDeclaration'].push(path.node.declaration.name);
        // }
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
            const exportImportedFilePath = getPath(curFileName, path.node.source.value);
            rootContainer[curFileName] = rootContainer[curFileName] || {};
            rootContainer[curFileName]['ImportedToExportAllDeclaration'] = rootContainer[curFileName]['ImportedToExportAllDeclaration'] || [];
            rootContainer[curFileName]['ImportedToExportAllDeclaration'][exportImportedFilePath] = curFileName; // 保存引入地址
        }
    }
}