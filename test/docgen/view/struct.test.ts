import * as reflect from 'jsii-reflect';
import { Language } from '../../../src';
import { MarkdownRenderer } from '../../../src/docgen/render/markdown-render';
import { getTranspilerForLanguage } from '../../../src/docgen/view/documentation';
import { Struct } from '../../../src/docgen/view/struct';
import { Assemblies } from '../assemblies';

const assembly: reflect.Assembly = Assemblies.instance.withoutSubmodules;

const metadata = {
  packageName: assembly.name,
  packageVersion: assembly.version,
};

const findStruct = (): reflect.InterfaceType => {
  for (const iface of assembly.interfaces) {
    if (iface.datatype) {
      return iface;
    }
  }
  throw new Error('Assembly does not contain a struct');
};

test.each(Language.values())('%s snapshot', (language) => {
  const transpile = getTranspilerForLanguage(language);
  const markdown = new MarkdownRenderer({ language, ...metadata });
  const struct = new Struct(transpile, findStruct()).toJson();
  expect(struct).toMatchSnapshot();
  expect(markdown.visitStruct(struct).render()).toMatchSnapshot();
});
