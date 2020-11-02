module.exports = [
    "ExportSpecifier",          // 导出匿名对象属性 export {...}
    "ExportIdentifier",         // 导出具名对象属性 export const A = {}  export function allowProp() {}
    "ExportClassDeclaration",   // 导出 默认 class 名  export default class A ...
    "ExportDefaultIdentifier",  // 导出 默认 属性  export default A
    "ExportAssignmentExpression" // 导出 默认 属性  export default AddPaymentModal = Form.create()(AddPaymentModal);
]