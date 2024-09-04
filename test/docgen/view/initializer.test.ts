import * as reflect from 'jsii-reflect';
import { Language } from '../../../src';
import { MarkdownRenderer } from '../../../src/docgen/render/markdown-render';
import { LANGUAGE_SPECIFIC } from '../../../src/docgen/view/documentation';
import { Initializer } from '../../../src/docgen/view/initializer';
import { Assemblies } from '../assemblies';

const assembly: reflect.Assembly = Assemblies.instance.withoutSubmodules;

const metadata = {
  packageName: assembly.name,
  packageVersion: assembly.version,
};

const findInitializer = (): reflect.Initializer => {
  for (const klass of assembly.system.classes) {
    if (klass.initializer) {
      return klass.initializer;
    }
  }
  throw new Error('Assembly does not contain an initializer');
};

test.each(Language.values())('%s snapshot', (language) => {
  const { transpile } = LANGUAGE_SPECIFIC[language.toString()];
  const markdown = new MarkdownRenderer({ language, ...metadata });
  const init = new Initializer(transpile, findInitializer()).toJson();
  expect(init).toMatchSnapshot();
  expect(markdown.visitInitializer(init).render()).toMatchSnapshot();
});

const variadicTestAssembly: reflect.Assembly = Assemblies.instance.withVariadicParameter;
const findVariadicInitializer = (): reflect.Initializer => {
  for (const klass of variadicTestAssembly.classes) {
    if (klass.initializer && klass.initializer.parameters.some(param => param.variadic)) {
      return klass.initializer;
    }
  }
  throw new Error('Assembly does not contain an initializer with a variadic parameter');
};

const findVariadicParameter = (): reflect.Parameter => {
  for (const klass of variadicTestAssembly.classes) {
    if (klass.initializer) {
      for (const param of klass.initializer.parameters) {
        if (param.variadic) {
          return param;
        }
      }
    }
  }
  throw new Error('Assembly does not contain a variadic parameter');
};

// Tests variadic initializers:
test.each(Language.values())('%s snapshot', (language) => {
  const { transpile } = LANGUAGE_SPECIFIC[language.toString()];
  const renderer = new MarkdownRenderer({ language, ...metadata });
  const init = new Initializer(transpile, findVariadicInitializer()).toJson();
  const markdown = renderer.visitInitializer(init).render();
  expect(markdown).toMatchSnapshot();
});