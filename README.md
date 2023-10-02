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
- C# (`csharp`)
- Go (`go`)


## CLI Options

| Option                 | Required | Description                                                                                                                              |
| :--------------------- | :------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| `--output`, `-o`       | optional | Output filename (defaults to API.md if format is markdown, and API.json if format is JSON). <br /><br/>`jsii-docgen -o ./docs/API.md`    |
| `--format`, `-f`       | optional | Output format. Can be `markdown` or `json`. <br /><br />`jsii-docgen -f json`                                                            |
| `--language`, `-l`     | optional | Language to generate documentation for. Can be `typescript`, `python`, `java`, `csharp` or `go`. <br /><br />`jsii-docgen -l typescript` |
| `--package`, `-p`      | optional | The name@version of an NPM package to document. <br /><br />`jsii-docgen -p my-package`                                                  |
| `--readme`, `-r`       | optional | Generate docs for user specified README.md. <br /><br />`jsii-docgen -r`                                                                 |
| `--submodule`, `-s`    | optional | Generate docs for a specific submodule or "root". <br /><br />`jsii-docgen -s my-submodule`                                              |
| `--split-by-submodule` | optional | Generate a separate file for each submodule. <br /><br />`jsii-docgen --split-by-submodule`                                              |

## Contributions

All contributions are welcome, just raise an issue or submit a PR. Add a test,
update readme. Do the right thing.

## License

[Apache 2.0](./LICENSE)
