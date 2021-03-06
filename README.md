# Typescript Composite Project with Lerna

[TypeScript Composite Project(Project References)](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-0.html#project-references) + [Lerna](https://github.com/lerna/lerna)


## Usage

### Initialization

```
git clone https://github.com/hanpama/typescript-composite-lerna
cd typescript-composite-lerna
npm run boostrap
npm run watch
```

#### `npm run bootstrap`

* installs the project dependencies (in `/package.json`)
* links each packages
* and builds the project with `npm run build` (`tsc --build packages/tsconfig.project.json`)

#### `npm run watch`

* run tsc project build mode with `--watch` flag (`tsc --build --watch packages/tsconfig.project.json`)

You can watch the entire project with a single tsc running.

### Updating `tsconfig.package.json`

```
npm run update:tsconfig.json
```

Each package has its `tsconfig.package.json` file for individual build.
To integrate those building process into project, we need `references` field listing its build dependencies.

```json
// GENERATED by scripts/update-package-tsconfig.ts
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "composite": true
  },
  "references": [
    {
      "path": "../foo/tsconfig.package.json"
    },
    {
      "path": "../bar/tsconfig.package.json"
    }
  ],
  "include": [
    "src"
  ],
  "exclude": [
    "tests",
    "dist"
  ]
}
```

`update:tsconfig.json` is a script which resolves and updates those dependencies.

## Running Example

```sh
ts-node packages/baz/src/index.ts
```
