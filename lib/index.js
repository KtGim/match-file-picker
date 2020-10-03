const path = require('path');
const fs = require('fs');
const { program } = require('commander');
const ora = require('ora');
const {init} = require('./core/parser');
const parseResult = require('./core/exports');

const spinner = ora();
/**
 * 
 * @param {配置信息} opts 
 */
module.exports = function() {
    program
        .option('-d, --pathname <pathname>', '相对或者绝对路径必填');

    const dirname = program.parse(process.argv).pathname;

    const rootPath = path.isAbsolute(dirname) ? dirname: path.resolve(dirname);
    
    const rootContainer = {};
    
    init(rootPath, rootContainer);

    const [excludeList, totalList] = parseResult(rootContainer);
    const writeIntoFile = false;
    if (writeIntoFile) { 
        // console.log(parseResult(rootContainer, defaultSettings));
        spinner.start('正在写入文件，请稍后 >>>\n')
        const resultDirName = `${rootPath}/mf-results`;
        // undefined 或者目录名
        const createDirOk = fs.mkdirSync(resultDirName, {recursive: true});
        if (!createDirOk) {
            console.log(`目录已经创建`);
        }
        fs.writeFileSync(`${resultDirName}/result.js`, excludeList.join(',\n'), 'utf-8');
        fs.writeFileSync(`${resultDirName}/total.js`, totalList.join(',\n'), 'utf-8');
        spinner.stop();
    } else {
        console.log(excludeList);
    }
    
}