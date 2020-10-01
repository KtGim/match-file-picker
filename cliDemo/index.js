const chalk = require('chalk');
const { program } = require('commander');

program.version('1.0.0');

// 命令行 node index,js -d aaa -s kkk -p qqq
program
 .option('-d, --debug', 'output extra debugging')
 .option('-s, --small', 'small pizza size')
 .option('-p, --pizza-type <type>', 'flavour of pizza')
 .option('-k, --default-name <type>', 'sss', 'mmm') // defaultName
 .option('--pick <aa>', '选', '选你妹') // <> 表示必填参数，参数不填直接报错, node index 不会报错（退出程序）
 .option('--no-pick', '不选')  // node index --no-pick -> false
 .option('--pick1 [aa]', '选', '选你妹') // [] 表示可选参数， 参数不填选择默认值
 .requiredOption('-r, --require <r>', '必填', 'rrr') // node index 不设置默认值的话，会报错（退出程序）
 // 解析 program 的参数值
 program.parse(process.argv);


 if (program.debug) console.log(program.opts());
 if (program.small) console.log('- small pizza size');
 if (program.pizzaType) console.log(`- ${program.pizzaType}`);
// 输出结果
console.log(program.opts());
// {
//     version: '1.0.0',
//     debug: true,
//     small: undefined,
//     pizzaType: undefined
//   }

console.log(`K: ${program.defaultName}`);
console.log(`pick: ${program.pick}`)