import * as fs from 'fs';
import * as path from 'path';
import * as spec from '@jsii/spec';
import * as reflect from 'jsii-reflect';

/**
 * Singelton class to expose various assemblies for test purposes.
 *
 * Use `Assemblies.instance` to obtain it.
 */
export class Assemblies {

  private static _instance: Assemblies;

  private readonly ts: reflect.TypeSystem;

  public static get instance() {
    if (this._instance) {
      return this._instance;
    }
    this._instance = new Assemblies();
    return this._instance;
  }

  private constructor() {
    this.ts = new reflect.TypeSystem();
    this.addAssemblies(`${__dirname}/../__fixtures__/assemblies`);
  }

  public get withoutSubmodules(): reflect.Assembly {
    return this.ts.findAssembly('@aws-cdk/aws-ecr');
  }

  public get withSubmodules(): reflect.Assembly {
    return this.ts.findAssembly('aws-cdk-lib');
  }

  private addAssemblies(p: string) {
    const stat = fs.statSync(p);
    if (stat.isDirectory()) {
      fs.readdirSync(p).forEach((f) => this.addAssemblies(path.join(p, f)));
    } else {
      if (p.endsWith('jsii.json')) {
        const assembly = JSON.parse(fs.readFileSync(p, { encoding: 'utf8' })) as spec.Assembly;
        this.ts.addAssembly(new reflect.Assembly(this.ts, assembly));
      }
    }
  }
}
