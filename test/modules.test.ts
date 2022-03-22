import * as path from 'path';
import * as os from 'os';
import {execSync} from 'child_process';
import { mkdtemp } from 'fs-extra';
import { Documentation, Language, MarkdownDocument } from '../src';

describe('local modules', () => {
  test('can resolve hoisted dependencies correctly', async () => {
    jest.setTimeout(10000);
    // create project with hoisted constructs dependency
    const target = await mkdtemp(path.join(os.tmpdir(), 'docgentest'));
    execSync('npm install aws-cdk-lib constructs', { cwd: target });

    const projDir = path.resolve(target, 'node_modules', 'aws-cdk-lib');
    const docs = await Documentation.forProject(projDir);
    const md = await docs.toMarkdown({ language: Language.TYPESCRIPT })
    expect(md).toBeInstanceOf(MarkdownDocument);
  });
});
