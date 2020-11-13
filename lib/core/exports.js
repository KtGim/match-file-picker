const {getObjectKeys, excludedFiles, setFullNames, setRelativeNames} = require('../utils')
const defaultSettings = require('../core/defaultSettings/index');
const exportNodeTypes = require('./parseNode/nodeType/exportNodeTypes');
const importNodeTypes = require('./parseNode/nodeType/importNodeTypes');

/**
 * 导出最后的结果
 * 在结果中筛选出没有被引用的文件名
 * @param {已经返回结果} rootContainer 
 */
function parseResult(rootContainer) {
    // 导入文件名称
    let importFiles = [];
    // 导出文件名称
    let exportsFiles = [];
    // 直接导出的文件
    let excludeFilesList = [];

    let excludeImportFilesList = [];
    // 全文件名称
    let totalFiles = getObjectKeys(rootContainer);
    // 排除不是文件的路径
    totalFiles =  [...new Set(totalFiles)];
    const ignorePaths = defaultSettings.getInstance().ignorePaths;

    totalFiles.forEach((filePath) => {
        const fileNodeInfoKeys = getObjectKeys(rootContainer[filePath]);
        let nodeName = '';
        for(let i = 0; i< fileNodeInfoKeys.length; i++) {
            nodeName = fileNodeInfoKeys[i];
            const hasImport = importNodeTypes.indexOf(nodeName) > -1;
            const hasExport = exportNodeTypes.indexOf(nodeName) > -1;
            if (hasImport) {
                // 导入语句节点
                const fileReferencesKeys = getObjectKeys(rootContainer[filePath][nodeName]);
                // console.log(fileReferencesKeys, 'fileReferencesKeys');
                importFiles.push(...fileReferencesKeys);
            } else if (hasExport) {
                // 当前文件导出存在 则保存信息
                rootContainer[filePath][nodeName].length > 0 && exportsFiles.push(filePath);
            }
        }

    })
    // console.log(importFiles, '[[]]');
    // console.log(exportsFiles);
    // importFiles = [...new Set(setFullNames(setRelativeNames(importFiles), defaultSettings))];
    importFiles = [...new Set(importFiles)];
    // exportsFiles 理论和实际上 不需要做处理，需要去重
    exportsFiles = [...new Set(exportsFiles)];
    // 不存在于 import 和 export 中的文件
    excludeImportFilesList = excludedFiles(exportsFiles, importFiles);
    excludeFilesList = excludedFiles(totalFiles, [...importFiles, ...exportsFiles]);
    // console.log(totalFiles);
    // console.log(importFiles, '-=-=-');
    // console.log(exportsFiles);
    // console.log(rootContainer, 'rootContainer');
    // console.log(excludeImportFilesList);
    // console.log(excludeFilesList);
    // console.log([...new Set([...excludeImportFilesList, ...excludeFilesList])]);
    // 排除只存在 导出的 文件, 将需要忽略的文件直接排除
    return [
        [ ...new Set([...excludeImportFilesList, ...excludeFilesList])].filter(pathname => !ignorePaths.some(ip => pathname.indexOf(ip) > -1)),
        totalFiles,
        importFiles,
        exportsFiles
    ]
}

function getEffectiveFiles(rootContainer, wf) {

    const totalFiles = [...new Set(getObjectKeys(rootContainer))];
    const files = [];

    totalFiles.forEach((filePath) => {
        const fileNodeInfoKeys = getObjectKeys(rootContainer[filePath]);
        let nodeName = '';
        for(let i = 0; i< fileNodeInfoKeys.length; i++) {
            nodeName = fileNodeInfoKeys[i];
            const hasImport = importNodeTypes.indexOf(nodeName) > -1;
            if (hasImport) {
                const fileReferencesKeys = getObjectKeys(rootContainer[filePath][nodeName]);
                fileReferencesKeys && fileReferencesKeys.length && fileReferencesKeys.forEach(f => {
                    if (f === wf) {
                        files.push(f);
                    }
                })
            }
        }
    })

    return [...new Set(...files)]
}
module.exports = {
    parseResult,
    getEffectiveFiles,
}
