import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';
import { AssemblyRedirect, isAssemblyRedirect, SPEC_FILE_NAME, validateAssemblyRedirect } from '@jsii/spec';
import * as fg from 'fast-glob';
import { Assembly } from 'jsii-reflect';

/**
 * Search a directory for jsii assemblies and return a map of assembly name to path.
 */
export function discoverAssemblies(searchDir: string): Record<string, string> {
  // searchDir might include backslashes on Windows.
  // The glob pattern must only used forward slashes, so we pass the assembliesDir as CWD which does not have this restriction
  const discovered = fg.sync(`**/${SPEC_FILE_NAME}`, {
    cwd: path.normalize(searchDir),
    absolute: true,
  });

  const assemblies: Record<string, string> = {};
  for (let dotJsii of discovered) {
    const name = getAssemblyNameFromFile(dotJsii);
    assemblies[name] = dotJsii;
  }

  return assemblies;
}

/**
 * Opens the assembly file to get the assemblies name and,
 * if present, follows instructions found in the file to unzip compressed assemblies.
 *
 * @param pathToFile the path to the SPEC_FILE_NAME file
 * @returns the assembly name
 */
function getAssemblyNameFromFile(pathToFile: string): string {
  const data = fs.readFileSync(pathToFile);
  try {
    const readFile = (filename: string) => fs.readFileSync(path.resolve(pathToFile, '..', filename));
    let contents = JSON.parse(data.toString('utf-8'));

    // check if the file holds instructions to the actual assembly file
    while (isAssemblyRedirect(contents)) {
      contents = followRedirect(contents, readFile);
    }

    return (contents as Assembly).name;
  } catch (e: any) {
    throw new Error(`Error loading assembly from file ${pathToFile}:\n${e}`);
  }
}

function followRedirect(
  assemblyRedirect: AssemblyRedirect,
  readFile: (filename: string) => Buffer,
) {
  // Validating the schema, this is cheap (the schema is small).
  validateAssemblyRedirect(assemblyRedirect);

  let data = readFile(assemblyRedirect.filename);
  switch (assemblyRedirect.compression) {
    case 'gzip':
      data = zlib.gunzipSync(data);
      break;
    case undefined:
      break;
    default:
      throw new Error(
        `Unsupported compression algorithm: ${JSON.stringify(
          assemblyRedirect.compression,
        )}`,
      );
  }
  const json = data.toString('utf-8');
  return JSON.parse(json);
}
