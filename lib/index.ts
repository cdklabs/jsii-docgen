// tslint:disable:no-console
import jsiiReflect = require('jsii-reflect');
import fs = require('fs-extra');
import * as path from 'path';
import { ClassPage, InterfacePage } from './render/klass';
import { EnumPage } from './render/enum';
import { Page, RenderContext, MarkdownLinkRenderer, ILinkRenderer } from './render/page';
import { Home } from './render/home';

export interface RenderOptions {
  readonly links?: ILinkRenderer;
}

export async function renderDocs(jsiiFiles: string[], outdir: string, options: RenderOptions = { }) {

  const ctx: RenderContext = {
    links: options.links ?? new MarkdownLinkRenderer()
  };

  const pages = await renderAssemblies(jsiiFiles, ctx);
  for (const page of pages) {
    const content = page.render().join('\n');
    const filePath = path.join(outdir, page.fileName);
    console.error(filePath);
    await fs.mkdirp(path.dirname(filePath));
    await fs.writeFile(filePath, content, { encoding: 'utf-8' });
  }
}

export async function renderAssemblies(jsiiFiles: string[], ctx: RenderContext): Promise<Page[]> {
  const ts = new jsiiReflect.TypeSystem();
  const result = new Array<Page>();

  for (const filePath of jsiiFiles) {
    await ts.load(filePath);
  }

  for (const assembly of ts.assemblies) {
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
