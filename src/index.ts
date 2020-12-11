// tslint:disable:no-console
import * as path from 'path';
import * as fs from 'fs-extra';
import * as jsiiReflect from 'jsii-reflect';
import { EnumPage } from './render/enum';
import { Home } from './render/home';
import { ClassPage, InterfacePage } from './render/klass';
import { elementAnchorLink } from './render/links';
import { Page, RenderContext, JsiiEntity } from './render/page';

/**
 * Renders markdown files into an output directory for a jsii typesystem.
 * @param jsiiFiles jsii input files
 * @param outdir output directory
 */
export async function renderFiles(jsiiFiles: string[], outdir: string) {
  const renderFileName = (type: JsiiEntity) => type.fqn.replace('/', '_') + '.md';

  const ctx: RenderContext = {
    links: {
      renderLink: type => `./${renderFileName(type)}`,
    },
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

export async function renderSinglePageModule(moduleDir: string, outFile: string) {
  const ts = new jsiiReflect.TypeSystem();
  const asm = await ts.loadModule(moduleDir);

  const ctx: RenderContext = {
    readme: false,
    heading: 2,
    links: {
      renderLink: type => {
        if (type instanceof jsiiReflect.Assembly) {
          return '';
        } else {
          return elementAnchorLink(type);
        }
      },
    },
  };

  const file = fs.createWriteStream(outFile);

  const pages = await renderPages(ts, ctx);
  for (const page of pages) {
    if (page.type.fqn.split('.')[0] !== asm.fqn) {
      continue; // skip other modules
    }

    file.write(page.markdown);
    file.write('\n\n\n');
  }

  file.close();
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

function documentAssembly(ctx: RenderContext, asm: jsiiReflect.Assembly): Page[] {
  const classes = [...asm.classes, ...asm.submodules.flatMap(submod => submod.classes)];
  const interfaces = [...asm.interfaces, ...asm.submodules.flatMap(submod => submod.interfaces)];
  const enums = [...asm.enums, ...asm.submodules.flatMap(submod => submod.enums)];

  return [
    new Home(ctx, asm),
    ...classes.map(c => new ClassPage(ctx, c)),
    ...interfaces.map(i => new InterfacePage(ctx, i)),
    ...enums.map(e => new EnumPage(ctx, e)),
  ];
}

