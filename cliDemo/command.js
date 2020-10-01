const { program } = require('commander');

program
  .command('clone <source> [destination]')
  .description('clone a repository into a newly created directory')
  .action((source, destination) => {
    console.log('clone command called');
  })

// 不能直接写在 common 后面
program
    .option('-a, --add-file <filename>', 'add file')
    .option('-p, --pizza-type <type>', 'flavour of pizza')

program.parse(process.argv);
