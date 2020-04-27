// tslint:disable:no-console
import jsiiReflect = require('jsii-reflect');
import fs = require('fs-extra');
import * as path from 'path';
import { ClassPage, InterfacePage } from './render/klass';
import { EnumPage } from './render/enum';
import { Page, RenderContext, JsiiEntity } from './render/page';
import { Home } from './render/home';

/**
 * Renders markdown files into an output directory for a jsii typesystem.
 * @param jsiiFiles jsii input files
 * @param outdir output directory
 */
export async function renderFiles(jsiiFiles: string[], outdir: string) {
  const ctx: RenderContext = {
    links: {
      renderLink: type => `./${renderFileName(type)}`
    }
  };

  const ts = new jsiiReflect.TypeSystem();
  for (const filePath of jsiiFiles) {
    await ts.load(filePath);
  }

  const pages = await renderPages(ts, ctx);
  for (const page of pages) {
    const filePath = path.join(outdir, renderFileName(page.type));
    console.log(filePath);
    await fs.mkdirp(path.dirname(filePath));
    await fs.writeFile(filePath, page.markdown, { encoding: 'utf-8' });
  }
}

/**
 * Renders markdown reference documentation pages for all the types in this jsii
 * typesystem.
 * @param typesystem the jsii typesystem to reflect on.
 * @param ctx render context
 */
export async function renderPages(typesystem: jsiiReflect.TypeSystem, ctx: RenderContext): Promise<Page[]> {
  const result = new Array<Page>();

  for (const assembly of typesystem.assemblies) {
    result.push(...documentAssembly(ctx, assembly));
  }

  return result;
}

function documentAssembly(ctx: RenderContext, assembly: jsiiReflect.Assembly): Page[] {
  return [
    new Home(ctx, assembly),
    ...assembly.classes.map(c => new ClassPage(ctx, c)),
    ...assembly.interfaces.map(i => new InterfacePage(ctx, i)),
    ...assembly.enums.map(e => new EnumPage(ctx, e))
  ];
}

function renderFileName(type: JsiiEntity): string {
  return type.fqn.replace('/', '_') + '.md';
}
