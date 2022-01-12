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
import { Documentation, Language } from 'jsii-docgen';

const docs = await Documentation.forProject('.');
const markdown = await docs.toMarkdown({ language: Language.TYPESCRIPT }).render(); // returns a markdown string

const json = await docs.toJson({ language: Language.TYPESCRIPT }).render(); // returns a JSON object
```

Curreently jsii-docgen supports generating documentation in the following languages:

- TypeScript (`typescript`)
- Python (`python`)
- Java (`java`)
- C# (`csharp` or `dotnet`)

## Contributions

All contributions are welcome, just raise an issue or submit a PR. Add a test,
update readme. Do the right thing.

## License

[Apache 2.0](./LICENSE)
