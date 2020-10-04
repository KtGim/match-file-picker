module.exports = [
    "ImportNamespaceSpecifier",     // import * as types from 'xxx';
    "ImportDefaultSpecifier",       // import A from ...
    "ImportSpecifier",              // import { A } from ...
    "ImportCallExpression",         // require(..)
    "ImportedToExportingFilePath",   // 导入 默认 属性  export { S } from './xxx' 的 xxx 名称", 自定义导出
    "ImportedToExportAllDeclaration", // 导入 默认 属性  export * from './bill'
    "ImportListSource" // components: () => Import('../XXX.js)
]