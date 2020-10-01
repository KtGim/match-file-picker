const inquirer = require('inquirer');
inquirer
  .prompt([
    {
        type: 'list',
        choices: ['1', '2', '3'],
        name: 'selectOption',
        message: 'choose an option',
        default: 2,
    },
    {
        type: 'confirm',
        choices: ['1', '2', '3'],
        name: 'selectOption1',
        message: 'are you sure',
    },
  ])
  .then(answers => {
    console.log(answers);
  })
  .catch(error => {
    if(error.isTtyError) {
      // Prompt couldn't be rendered in the current environment
    } else {
      // Something else when wrong
    }
  });

