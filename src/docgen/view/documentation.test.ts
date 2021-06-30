import * as reflect from 'jsii-reflect';
import { Documentation } from './documentation';

const assembly: reflect.Assembly = (global as any).assembly;
const assemblyWithSubmodules: reflect.Assembly = (global as any)
  .assemblyWithSubmodules;

describe('python', () => {
  test('snapshot - root module', () => {
    const docs = new Documentation({
      language: 'python',
      assembly: assembly,
      readme: true,
    });
    expect(docs.render().render()).toMatchSnapshot();
  });

  test('snapshot - submodules', () => {
    const docs = new Documentation({
      language: 'python',
      assembly: assemblyWithSubmodules,
      submoduleName: 'aws_eks',
      readme: true,
    });
    expect(docs.render().render()).toMatchSnapshot();
  });
});

describe('typescript', () => {
  test('snapshot - single module', () => {
    const docs = new Documentation({
      language: 'ts',
      assembly: assembly,
      readme: true,
    });
    expect(docs.render().render()).toMatchSnapshot();
  });

  test('snapshot - submodules', () => {
    const docs = new Documentation({
      language: 'ts',
      assembly: assemblyWithSubmodules,
      submoduleName: 'aws_eks',
      readme: true,
    });
    expect(docs.render().render()).toMatchSnapshot();
  });
});
