import Foobar from '@namespace/bar/Foobar';

function main() {
  console.log(Foobar() + 'baz');
}

if (process.mainModule === module) {
  main();
}
