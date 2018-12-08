import * as fs from 'fs';
import * as path from 'path';


const PACKAGE_TSCONFIG = 'tsconfig.package.json';
const PROJECT_TSCONFIG = 'tsconfig.project.json';
const TSCONFIG_COMMENT = `// GENERATED by update-package-tsconfig\n`;

const packagesRoot = path.join(__dirname, '..', 'packages');
const packageDirectories = fs.readdirSync(packagesRoot).filter(
  item => (fs.lstatSync(path.join(packagesRoot, item)).isDirectory())
);

type DirectoryName = string;
type PackageName = string;

const packageJSONMap: Map<PackageName, {
  name: string,
  dependencies: { [packageName: string]: string },
  devDependencies: { [packageName: string]: string },
}> = new Map();

const packageDirnameMap: Map<PackageName, DirectoryName> = new Map();

packageDirectories.forEach(packageDirname => {
  const packageJSONPath = path.join(packagesRoot, packageDirname, 'package.json');
  const packageJSONData = JSON.parse(fs.readFileSync(packageJSONPath).toString());
  const packageName = packageJSONData.name;
  packageDirnameMap.set(packageName, packageDirname);
  packageJSONMap.set(packageName, packageJSONData);
});

const internalDependencyMap: Map<string, string[]> = new Map();
packageDirnameMap.forEach((_packageDirname, packageName) => {

  const { dependencies, devDependencies } = packageJSONMap.get(packageName)!;

  const internalDependencies = [
    ...(dependencies ? Object.keys(dependencies) : []),
    ...(devDependencies ? Object.keys(devDependencies) : []),
  ].filter(dep => packageDirnameMap.has(dep));

  internalDependencyMap.set(packageName, internalDependencies);
});

function resolveInternalDependencies(dependencies: string[]): string[] {
  const childDeps = [];

  for (let idep of dependencies) {
    const deps = internalDependencyMap.get(idep)!;
    const res = resolveInternalDependencies(deps);
    for (let jdep of res) {
      childDeps.push(jdep);
    }
  }
  const resolved = childDeps.concat(dependencies);
  // remove all duplicated after the first appearance
  return resolved.filter((item, idx) => resolved.indexOf(item) === idx);
}

packageDirnameMap.forEach((packageDirname, packageName) => {

  const tsconfigPath = path.join(packagesRoot, packageDirname, PACKAGE_TSCONFIG);

  const internalDependencies = resolveInternalDependencies(
    internalDependencyMap.get(packageName)!
  );

  const tsconfigData = {
    extends: '../../tsconfig.base.json',
    compilerOptions: {
      outDir: './lib',
      rootDir: './src',
      composite: true,
    },
    references: internalDependencies.map(dep => {
      return { path: `../${packageDirnameMap.get(dep)}/${PACKAGE_TSCONFIG}` };
    }),
    include: ['src'],
    exclude: ['tests', 'lib'],
  };
  fs.writeFileSync(tsconfigPath, TSCONFIG_COMMENT + JSON.stringify(tsconfigData, null, '  '));
});

const projectLevelTsconfigPath = path.join(packagesRoot, PROJECT_TSCONFIG);

const projectLevelTsconfigData = {
  files: [],
  references: resolveInternalDependencies(Array.from(packageDirnameMap.keys())).map(
    packageName => ({ path: `./${packageDirnameMap.get(packageName)}/${PACKAGE_TSCONFIG}` })
  ),
};

fs.writeFileSync(projectLevelTsconfigPath, TSCONFIG_COMMENT + JSON.stringify(projectLevelTsconfigData, null, '  '));