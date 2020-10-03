const path = require('path');
const fs = require('fs');
const defaultSettings = require('./core/defaultSettings/index');

/**
 * 根据当前文件生成目标位置文件绝对位置
 * @param {当前文件绝对位置} curFileName 
 * @param {目标文件相对当前文件位置} desFileName 
 */
function getPath(curFileName, desFileName) {
    if (!curFileName || !desFileName) {
        return
    }
    let filename = desFileName;
    if (filename.startsWith('./') || filename.startsWith('../')) {
        // 相对路径，获取当前文件所属目录位置
        const parser = path.parse(curFileName);
        filename = path.resolve(parser.dir, filename);
    } else {
        // 绝对路径设置文件前缀
        filename = setPathPrefix(desFileName, curFileName);
    }
    return filename;
    // return addSuffix(filename, defaultSettings);  // 是否需要添加后缀
}
/**
 * 设置路径前缀
 * @param {当前读取到的文件路径} desFileName
 * @param {全局设置} defaultSettings
 */
function setPathPrefix(desFileName) {
    const aliasMappings = defaultSettings.getInstance().aliasMappings;
    const aliasMappingsKeys = Object.keys(aliasMappings);
    const aliasNameKey = isAliasNameEffective(desFileName, aliasMappingsKeys);
    if (aliasNameKey) {
        // 如果别名已经设置过，将传入路径修的别名修改成 完整别名
        // 别名都是相对于根目录
        // 配置: {'@/a': './a/1111'}
        // 转换: @/a/555 -> './a/1111/555'
        // 需要再将 ./a/1111/555 -> /usr/a/111/555
        desFileName = desFileName.replace(aliasNameKey, aliasMappings[aliasNameKey]);
    }
    return desFileName;
}

// 补全文件后缀并且查看文件是否存在
function addSuffix(desFileName) {
    const extName = path.extname(desFileName);
    const filesExt = defaultSettings.getInstance().matchFileExt;
    let pathname = desFileName;
    if (!extName) {
        // console.log(pathname, '-=-=-=-=')
        pathname = addFileSuffix(desFileName, filesExt);
    }
    return pathname;
}

/**
 * 补全 /admin.js 或者 /admin/index.js
 * 如果不存在后缀名称，则补全后缀 /admin/index.js
 * 如果省略 index 则补全路径    /admin/index.js
 * 如果都不存在 返回 undefined
 * @param {当前文件绝对路径} desFileName 
 * @param {可以查找的文件后缀} filesExt 
 */
function addFileSuffix(desFileName, filesExt) {
    desFileName = path.resolve(desFileName); // 去除路径最后一个 /
    let pathname = fileExists2(desFileName, filesExt);
    // console.log(desFileName, pathname, '*******************');
    // 当前文件路径不是文件，查找下一级 index 文件
    if(!pathname) {
        // 查找父目录下的 index
        // console.log(path.parse(desFileName).dir);
        pathname = fileExists2(`${desFileName}/index`, filesExt);
    }
    // 下级 index 没有相关文件， 查找上级 index 文件
    if(!pathname) {
        // 查找父目录下的 index
        // console.log(path.parse(desFileName).dir);
        pathname = fileExists2(`${path.parse(desFileName).dir}/index`, filesExt);
    }
    // console.log(pathname, '-=-=-=-=-=-=-=-=-=');
    return pathname;
}

/**
 * 
 * @param {匹配文件完整路径} desFileName 
 * @param {后缀数组} filesExt 
 */
function fileExists2(desFileName, filesExt) {
    let pathname;
    const fLen = filesExt.length;
    // 路径后直接添加 后缀
    for(let i = 0; i < fLen; i++) {
        pathname = `${desFileName}${filesExt[i]}`;
        try {
            // 不报异常表明文件存在, 跳出循环
            fs.statSync(pathname);
            break
        } catch(err) {    
            // console.log(chalk.yellow(`文件不存在! --> ${pathname}  ${filesExt[i % len]}`));
            pathname = undefined;
        }
    }
    return pathname;
}

/**
 * 文件是否存在
 * @param {解析的文件名} desFileName 
 * @param {允许解析的文件后缀} filesExt 
 * @param {是否是解析当前文件} isChildDir true 查找 /admin.x  false 查找 /admin/index.X
 */
function fileExists(desFileName, filesExt, isChildDir) {
    let pathname;
    const fLen = filesExt.length;
    const tLen = isChildDir ? fLen: (fLen * 2);

    for(let i = 0; 1 < tLen - 1; i++) {
        // console.log(filesExt[i % filesExt.length]);
        // 默认查找 文件下的 index
        pathname = (i < tLen && isChildDir) ? `${desFileName}/index${filesExt[i]}` : `${desFileName}${filesExt[i % fLen]}`;
        // console.log(pathname, 'iiiiiiiiiiiiiiiiii');
        try {
            // 不报异常表明文件存在, 跳出循环
            fs.statSync(pathname);
            break
        } catch(err) {    
            // console.log(chalk.yellow(`文件不存在! --> ${pathname}  ${filesExt[i % len]}`));
            pathname = undefined;
        }
    }
    
    return pathname;
}

// 查看别名是否在当前文件生效
function isAliasNameEffective(aliasName, aliasMappingsKeys) {
    let effectiveKey;
    for(let i = 0; i < aliasMappingsKeys.length; i++ ) {
        if(aliasName.startsWith(aliasMappingsKeys[i])){
            effectiveKey = aliasMappingsKeys[i]
            break;
        }
    }
    return effectiveKey;
}

// 获取对象得 keys
function getObjectKeys(obj) {
    if (isObject(obj)) {
        return Object.keys(obj);
    }
    if (isArrObj(obj)) {
        return obj;
    }
    return [];
}

/**
 * 排除 targetArr 中， sourceArr 中不存在的数据
 * @param {*} targetArr 
 * @param {*} sourceArr 
 */
function excludedFiles (targetArr, sourceArr) {
    targetArr = targetArr || [];
    sourceArr = sourceArr || [];
    /**
     * sourceArr 没有数据 表示 需要全部排除 targetArr
     * 否则 排除 targetArr 中 不存在于 sourceArr 中的数据
     */
    return sourceArr.length > 0 ? targetArr.filter(key => sourceArr.indexOf(key) === -1) : targetArr;
}

// 合并同类型对象
function combineObj(target, source) {
    
    Object.keys(target).forEach(prop => {
        if (isArrObj(target[prop]) && isArrObj(source[prop])) {
            target[prop] = [...new Set([...target[prop], ...source[prop]])];
        }
        if (isObject(target[prop]) && isObject(source[prop])) {
            target[prop] = {...target[prop], ...source[prop]};
        }
    })
    return target;
}

// 设置绝对路径
function setFullNames(sourceArr) {
    let targetArr = [];
    sourceArr.forEach(name => {
        if (path.isAbsolute(name)) {
            targetArr.push(addSuffix(name));
        } else {
            targetArr.push(name);
        }
    })
    return targetArr;
}

/**
 * 已经获取到了路径数组，但是还是有部分通过别名配置的相对 根路径 {process.env.PWD}的 路径需要处理成绝对路径
 * @param {路经数组} sourceArr 
 */
function setRelativeNames(sourceArr) {
    let targetArr = [];
    let pathname;
    sourceArr.forEach(name => {
        pathname = name;
        if (name.startsWith('./') || name.startsWith('../')) {
            // 相对路径，获取当前文件所属目录位置
            pathname = path.resolve(process.env.PWD, name);
        }
        targetArr.push(pathname)
    })
    return targetArr;
}

// 判断是数组
function isArrObj(obj) {
    return obj && typeof obj === 'object' && obj.__proto__ === Array.prototype && obj.__proto__.constructor === Array;
}

// 判断是对象
function isObject(obj) {
    return obj && obj.__proto__ === Object.prototype && obj.__proto__.constructor === Object;
}

module.exports = {
    getPath,
    getObjectKeys,
    excludedFiles,
    combineObj,
    setFullNames,
    setRelativeNames,
}