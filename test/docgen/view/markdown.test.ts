import { Documentation, Language } from '../../../src';
import { JsiiEntity } from '../../../src/docgen/schema';

jest.setTimeout(60 * 1000);

test('custom link formatter', async () => {
  const docs = await Documentation.forPackage('@aws-cdk/aws-ecr@1.106.0');
  try {
    const markdown = await docs.toMarkdown({
      language: Language.PYTHON,
      linkFormatter: (type: JsiiEntity) => `<a href="#custom-${type.id}">${type.fqn.split('.').pop()}</a>`,
    });
    expect(markdown.render()).toMatchSnapshot();
  } finally {
    await docs.cleanup();
  }
});

test('custom anchor formatter', async () => {
  const docs = await Documentation.forPackage('@aws-cdk/aws-ecr@1.106.0');
  try {
    const markdown = await docs.toMarkdown({
      language: Language.PYTHON,
      anchorFormatter: (type: JsiiEntity) => getAssemblyRelativeName(type),
      linkFormatter: (type: JsiiEntity) => {
        const name = getAssemblyRelativeName(type); // BucketProps.parameter.accessControl
        const friendlyName = type.fqn.split('.').pop(); // access_control
        const submoduleParam = type.submodule ? `&submodule=${type.submodule}` : '';
        return `<a href="/packages/${type.packageName}/v/${type.packageVersion}/api/${name}?lang=python${submoduleParam}">${friendlyName}</a>`;
      },
    });
    expect(markdown.render()).toMatchSnapshot();
  } finally {
    await docs.cleanup();
  }
});

/**
 * Converts a type's id to an assembly-relative version, e.g.:
 * `aws-cdk-lib.aws_s3.Bucket.parameter.accessControl` => `Bucket.parameter.accessControl`
 */
function getAssemblyRelativeName(type: JsiiEntity): string {
  const parts = type.id.split('.');
  if (type.packageName) {
    if (parts[0] !== type.packageName) {
      throw new Error(`Expected first part of "${type.id}" to be equal to ${type.packageName}.`);
    }
    parts.shift();
    if (type.submodule) {
      if (parts[0] !== type.submodule) {
        throw new Error(`Expected second part of "${type.id}" to be equal to ${type.packageName}.`);
      }
      parts.shift();
    }
  }
  return parts.join('.');
};
