import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';
import { AssemblyRedirect, isAssemblyRedirect, SPEC_FILE_NAME, validateAssemblyRedirect } from '@jsii/spec';
import * as fg from 'fast-glob';
import { Assembly } from 'jsii-reflect';
import * as semver from 'semver';

export interface AssemblyInfo {
  readonly name: string;
  readonly version: string;
  readonly path: string;
};

export type AssemblyLookup = Record<string, AssemblyInfo>;

/**
 * Given an AssemblyLookup map and an assembly name + version constraint,
 * returns the best possible match.
 *
 * This is not a strict semver implementation, instead the following algorithm is used:
 *   1. the highest (latest) version matching the semver constraint
 *   2. a matching major version, even if constraint doesn't match (this will use the lowest major version of the constraint)
 *   3. the highest available version of the dependency regardless of constraint
 *
 * @param assemblies a map of assembly identifier to name, version and path
 * @param constraint the assembly name and version to match
 *
 * @returns the best matching assembly info or undefined if no match was found
 */
export function bestAssemblyMatch(assemblies: AssemblyLookup, constraint: string): AssemblyInfo | undefined {
  const lastAtIndex = constraint.lastIndexOf('@');
  const name = lastAtIndex === -1 ? constraint : constraint.substring(0, lastAtIndex);
  const versionConstraint = lastAtIndex === -1 ? undefined : constraint.substring(lastAtIndex + 1);
  const candidates = Object.values(assemblies).filter(a => a.name === name);

  if (candidates.length === 0) {
    return undefined;
  }

  candidates.sort((a, b) => semver.rcompare(a.version, b.version) || 0);

  if (!versionConstraint) {
    return candidates[0];
  }

  // 1. Try semver constraint match
  const semverMatch = candidates.find(a => {
    try {
      return semver.satisfies(a.version, versionConstraint);
    } catch {
      return false;
    }
  });
  if (semverMatch) {
    return semverMatch;
  }

  // 2. Try major version match
  const targetVersion = semver.valid(versionConstraint) || semver.minVersion(versionConstraint);
  if (targetVersion) {
    const constraintMajor = semver.major(targetVersion);
    const majorMatch = candidates.find(a => {
      try {
        return semver.major(a.version) === constraintMajor;
      } catch {
        return false;
      }
    });
    if (majorMatch) {
      return majorMatch;
    }
  }

  // 3. Return highest version regardless of constraint
  return candidates[0];
}

/**
 * Search a directory for jsii assemblies and return a map of assembly identifier to name, version and path.
 */
export function discoverAssemblies(searchDir: string): AssemblyLookup {
  // searchDir might include backslashes on Windows.
  // The glob pattern must only used forward slashes, so we pass the assembliesDir as CWD which does not have this restriction
  const discovered = fg.sync(`**/${SPEC_FILE_NAME}`, {
    cwd: path.normalize(searchDir),
    absolute: true,
  });

  const assemblies: AssemblyLookup = {};
  for (let dotJsii of discovered) {
    const info = getAssemblyInfoFromFile(dotJsii);
    assemblies[`${info.name}@${info.version}`] = { ...info };
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
function getAssemblyInfoFromFile(pathToFile: string): AssemblyInfo {
  const data = fs.readFileSync(pathToFile);
  try {
    const readFile = (filename: string) => fs.readFileSync(path.resolve(pathToFile, '..', filename));
    let contents = JSON.parse(data.toString('utf-8'));

    // check if the file holds instructions to the actual assembly file
    while (isAssemblyRedirect(contents)) {
      contents = followRedirect(contents, readFile);
    }

    return {
      name: (contents as Assembly).name,
      version: (contents as Assembly).version,
      path: pathToFile,
    };
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
