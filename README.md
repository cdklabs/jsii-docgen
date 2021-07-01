# jsii-docgen

Generates markdown reference documentation for jsii modules.

## Usage

You can use this as a command line tool or as a library if you need more control.

```shell
$ jsii-docgen
```

Will produce a file called `API.md` with the api reference for this module.

As a library:

```ts
import { Documentation } from 'jsii-docgen';
import * as reflect from 'jsii-reflect';

const ts = new reflect.TypeSystem();
await ts.loadFile('my/project/.jsii');

const docs = new Documentation({
  assembly: ts.findAssembly('my-project-name'),
  language: 'ts',
  readme: false,
});

const markdown = docs.render().render(); // returns a markdown string
```

Note that you can pass in either `ts` or `python` as the language, as opposed to the CLI, which only produces a TypeScript reference.

## Contributions

All contributions are welcome, just raise an issue or submit a PR. Add a test,
update readme. Do the right thing.

## License

[Apache 2.0](./LICENSE)
