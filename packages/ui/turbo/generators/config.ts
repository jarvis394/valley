import type { PlopTypes } from '@turbo/gen'

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator('react-component', {
    description: 'Adds a new react component',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'What is the name of the component?',
        validate(input) {
          return input.trim() !== ''
        },
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'src/{{properCase name}}/{{properCase name}}.tsx',
        templateFile: 'templates/component.hbs',
      },
      {
        type: 'add',
        path: 'src/{{properCase name}}/{{properCase name}}.module.css',
        templateFile: 'templates/styles.hbs',
      },
      {
        type: 'append',
        path: 'package.json',
        pattern: /"exports": {(?<insertion>)/g,
        template:
          '    "./{{properCase name}}": "./src/{{properCase name}}/{{properCase name}}.tsx",',
      },
    ],
  })
}
