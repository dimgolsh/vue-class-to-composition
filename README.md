# vue-class-to-composition
![GitHub License](https://img.shields.io/github/license/dimgolsh/vue-class-to-composition)
![NPM Version](https://img.shields.io/npm/v/vue-class-to-composition)

[Demo](https://dimgolsh.github.io/vue-class-to-composition/)

vue-class-to-composition can convert Vue Class components to Composition API syntax. It also supports custom plugins.


## Features

- [x] Convert Vue Class component files to Composition API syntax
- [x] Handles both single files and entire directories
- [x] Supports custom plugins


### Supported features
- [x] `@Component`
    - [x] Extract component name
    - [x] Extract custom attributes (`...i18n,  inheritAttrs, ...customOptions`)
- [x] `@Props`
    - [x] Extract types and add PropType
- [x] `this`
    - [x] Parse `$refs` and create refs
    - [x] Replace `this` to props, emits and refs
  
- [x] `computed`
- [x] `methods`
- [x] `hooks`




## Requirements

- [Node.js > 18](https://nodejs.org/en/)
- Valid Vue file  written in Typescript (`.vue` extension)

## Usage
The vue-class-to-composition project has CLI and API

Install locally or global
```bash
# npm
npm i vue-class-to-composition
```

### CLI

#### Convert a Single File

To convert a single .vue file, run:
```bash
# npm
# convert single vue file
npx vue-class-to-composition single [cliOptions] <vue file path>
```

#### Options
```
  -v, --view                  Preview changes in the editor
  -p --pluginsDir <DIR_PATH>  Path to directory with plugins
  -h, --help                  display help for command
```
Example:
```bash
# npm
# convert single vue file
npx vue-class-to-composition single "src/components/HelloWorld.vue"
```

Example output
```bash
✔ Successfully converted file: src/components/HelloWorld.vue
```

### Convert All Files in a Directory

To convert all .vue files in a specified directory, run:

```bash
# npm
# convert folder
npx vue-class-to-composition folder <folder dir path>
```

#### Options
```
  -v, --view                  Preview changes in the editor
  -p --pluginsDir <DIR_PATH>  Path to directory with plugins
  -h, --help                  display help for command
```
## API

```ts
import {convertSingleFile, type TransformPlugin, convert, convertFolder} from 'vue-class-to-composition'

// See plugins section for example plugin
const serverClientPlugin: TransformPlugin = ({ast, t, store, traverse}) => {};


const code = `
<template><div></div></template>
<script lang="ts">
@Component({ i18n, components: { NotificationTemplate, MdButton } })
export default class LanguageSelector extends Popup<IJobModelForCustomer> {}
</script>

`
const convertAll = async () => {

    // Convert content code and get result
    const result = await convert(code, {
        plugins: [serverClientPlugin],
        // Prettier config
        prettierConfig: {}
    })
    console.log(result)

    // Convert file
    await convertSingleFile('./vcc.vue', {
        // Don't write file, just preview
        view: true,
        convertOptions: {
            plugins: [serverClientPlugin],
            // Prettier config
            prettierConfig: {}
        }
    })

    // Convert folder
    await convertFolder('./dir', {
        view: true,
        convertOptions: {
            plugins: [serverClientPlugin]
        }
    })
}

convertAll();
```

## Plugins

You can create custom plugin
```ts
export interface PluginParams {
    // AST tree from @babel/parser
  ast: ParseResult<t.File>;
  // @babel/types for creating AST
  t: typeof t;
  // @babel/traverse for traversing AST
  traverse: typeof traverse;
  // Conversion store
  store: typeof ConversionStore;
}

declare const ConversionStore: {
  addPropName: (propName: string) => void;
  hasPropName: (propName: string) => boolean;
  setFlag: (flagName: string, value: boolean) => void;
  getFlag: (flagName: string) => boolean | undefined;
  clear: () => void;
  printStore: () => void;
  addImport: (source: string, key: string, isDefault?: boolean) => void;
  getImports: () => Map<string, Map<string, {
    value: string;
    isDefault: boolean;
  }>>;
  addBeforeSetupStatement: (name: string, node: t.Statement) => void;
  getBeforeSetupStatements: () => Map<string, t.Statement>;
  addSetupContextKey: (name: string) => void;
  getSetupContextKeys: () => Set<string>;
  addAfterSetupStatement: (name: string, node: t.Statement) => void;
  getAfterSetupStatements: () => Map<string, t.Statement>;
  addReturnStatement: (name: string, node: t.ObjectMethod | t.ObjectProperty | t.SpreadElement) => void;
  getReturnStatement: () => Map<string, t.ObjectMethod | t.ObjectProperty | t.SpreadElement>;
  addRef: (name: string) => void;
  hasRefName: (name: string) => boolean;
  addShortReturnStatementByName: (name: string) => void;
  addExcludeRef: (name: string) => void;
  hasExcludeRefsName: (name: string) => boolean;
  registerPlugin: (name: string, plugin: TransformPlugin) => void;
  getPlugins: () => TransformPlugin[];
  addProp: (propName: string, node: t.ObjectProperty) => void;
  getProps: () => Map<string, t.ObjectProperty>;
  addExcludesNamesImportSpecifier: (name: string) => void;
  getExcludesNamesImportSpecifier: () => Set<string>;
};
export default ConversionStore;
```


### CLI

Create folder for plugins

```angular2html
src/
├── plugins/                 # Directory to hold all plugin files
│   ├── serverClientPlugin.js # Example plugin file
│   ├── otherPlugin.js       # Additional plugin file
```

Write plugin. Example plugin
```js
const serverClientPlugin = ({ ast, t, store, traverse }) => {
    traverse(ast, {
        CallExpression: (path) => {
            if (!path.node.arguments) {
                return;
            }

            const arg = path.node?.arguments[0];
            if (!arg) {
                return;
            }

            if (!t.isIdentifier(arg)) {
                return;
            }

            const name = arg.name;

            if (!name.endsWith('Client')) {
                return;
            }

            const newExpression = t.callExpression(t.identifier('useServerClient'), [arg]);
            store.addImport('composables/use-server-client', 'useServerClient', true);
            path.replaceWith(newExpression);
            path.skip();
            if (!Array.isArray(path.container) && t.isClassProperty(path.container)) {
                if (t.isIdentifier(path.container.key)) {
                    store.addExcludeRef(path.container.key.name);
                }
            }
        },
    });
};
module.exports = serverClientPlugin

```
```bash
# npm
# convert single file with plugins dir
npx vue-class-to-composition single  "<full_path>/vcc.vue" -v --pluginsDir "<full_path>/plugins"
```

### API

```ts
import {convertSingleFile, type TransformPlugin, convert, convertFolder} from 'vue-class-to-composition'

const serverClientPlugin: TransformPlugin = ({ast, t, store, traverse}) => {
    traverse(ast, {
        CallExpression: (path) => {
            if (!path.node.arguments) {
                return;
            }

            const arg = path.node?.arguments[0];
            if (!arg) {
                return;
            }

            if (!t.isIdentifier(arg)) {
                return;
            }

            const name = arg.name;

            if (!name.endsWith('Client')) {
                return;
            }

            const newExpression = t.callExpression(t.identifier('useSServerClient'), [arg]);
            store.addImport('composables/use-server-client', 'useServerClient', true);
            path.replaceWith(newExpression);
            path.skip();
            if (!Array.isArray(path.container) && t.isClassProperty(path.container)) {
                if (t.isIdentifier(path.container.key)) {
                    store.addExcludeRef(path.container.key.name);
                }
            }
        },
    });
};

// Convert content code and get result
const result = await convert(code, {plugins: [serverClientPlugin],}) 

// Get file and write file
await convertSingleFile('./vcc.vue', {convertOptions: {plugins: [serverClientPlugin],}})

// Convert folder
await convertFolder('./dir', {convertOptions: {plugins: [serverClientPlugin]}})


```


### Useful Links
- https://lihautan.com/babel-ast-explorer/

### License

This project is licensed under the MIT License. See the LICENSE file for details.

This README provides a comprehensive overview of your project, explaining how to install, use, and understand its functionality. You can customize the repository link and other specifics as needed.
