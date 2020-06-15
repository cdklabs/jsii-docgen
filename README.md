# jsii-docgen

Generates markdown reference documentation for jsii modules.

## Usage

You can use this as a command line tool or as a library if you need more control.

Single module usage (from module root dir):

```shell
$ jsii-docgen
```

Will produce a file called `API.md` with the api reference for this module (without any dependencies). 

To generate docs for an entire typesystem:

```shell
$ jsii-docgen [-o OUTDIR] JSII_FILE ...
```

Will generate API reference for all the types in the JSII files specified in the command line. Default `OUTDIR` is `dist`.

For example, the following command will generate markdown reference documentation for all jsii modules in your project:

```shell
$ jsii-docgen node_modules/**/.jsii
```

As a library:

```ts
import { renderPages } from 'jsii-docgen';
import * as reflect from 'jsii-reflect';

const ts = new reflect.TypeSystem();
await ts.loadFile('my/project/.jsii');

// you can customize how links are rendered
const ctx = {
  links: {
    renderLink: type => `/api/v${version}/${renderFileName(type)}`
  }
};

const pages = await renderPages(ts, ctx);

for (const page of pages) {
  console.log('FQN:', page.type.fqn);
  console.log('MARKDOWN:', page.markdown);
}
```

## Contributions

All contributions are welcome, just raise an issue or submit a PR. Add a test,
update readme. Do the right thing.

## License

[Apache 2.0](./LICENSE)
