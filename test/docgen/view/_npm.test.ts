import { ChildProcess, spawn } from 'child_process';
import { EventEmitter } from 'events';
import { constants, tmpdir } from 'os';
import { Readable, Writable } from 'stream';
import { NoSpaceLeftOnDevice, NpmError } from '../../../src';
import { Npm } from '../../../src/docgen/view/_npm';

const TMPDIR = tmpdir();

jest.mock('child_process');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mockSpawn = require('child_process').spawn as jest.MockedFunction<
  typeof spawn
>;

test('NoSpaceLeftOnDevice error', () => {
  // GIVEN
  const npm = new Npm(TMPDIR, () => void 0);

  // WHEN
  const mockChildProcess = new MockChildProcess(228);
  mockSpawn.mockReturnValue(mockChildProcess);

  // THEN
  return expect(npm.install('foo')).rejects.toThrowError(NoSpaceLeftOnDevice);
});

test('NpmError error (from STDERR)', async () => {
  // GIVEN
  const npm = new Npm(TMPDIR, () => void 0);

  // WHEN
  const mockChildProcess = new MockChildProcess(1, {
    stderr: [
      Buffer.from('Simulating that something has gone bad\n'),
      Buffer.from('\n'),
      Buffer.from('npm ERR! code EPROTO\n'),
      Buffer.from('npm ERR!\n'),
      Buffer.from('\n'),
      Buffer.from('npm ERR! A complete log of this run can be found in:\n'),
    ],
  });
  mockSpawn.mockReturnValue(mockChildProcess);

  // THEN
  const err = await npm.install('foo').then(
    () => Promise.reject(fail('Expected an NpmError!')),
    (e) => Promise.resolve(e),
  );
  expect(err).toBeInstanceOf(NpmError);
  expect((err as NpmError).npmErrorCode).toBe('EPROTO');
});

test('NpmError error (from STDOUT)', async () => {
  // GIVEN
  const npm = new Npm(TMPDIR, () => void 0);

  // WHEN
  const mockChildProcess = new MockChildProcess(1, {
    stdout: [
      Buffer.from('Simulating that something has gone bad\n'),
      Buffer.from('\n'),
      Buffer.from('npm ERR! code E429\n'),
      Buffer.from('npm ERR!\n'),
      Buffer.from('\n'),
      Buffer.from('npm ERR! A complete log of this run can be found in:\n'),
    ],
  });
  mockSpawn.mockReturnValue(mockChildProcess);

  // THEN
  const err = await npm.install('foo').then(
    () => Promise.reject(fail('Expected an NpmError!')),
    (e) => Promise.resolve(e),
  );
  expect(err).toBeInstanceOf(NpmError);
  expect((err as NpmError).npmErrorCode).toBe('E429');
});

// Most platforms have a bunch of ERRNO synonyms (the same value corresponds to
// several symbolic codes). For example, `EAGAIN` is typically the same value as
// `EWOULDBLOCK` (each symnbolic name is relevant in different contexts). What
// synonyms exist may differ on each platform, and we will always match the
// first encountered constant in `constants.errno`. This map is here so we skip
// the redundant entries properly.
const checkedErrnos = new Set<number>();
for (const [errname, errno] of Object.entries(constants.errno)) {
  if (errname === 'ENOSPC') {
    // This is NoSpaceLeftOnDevice
    continue;
  } else if (checkedErrnos.has(errno)) {
    // This is a synonym of a previous code, so skipping it
    continue;
  } else {
    checkedErrnos.add(errno);
  }

  test(`NpmError error (possibly ${errname})`, async () => {
    // GIVEN
    const npm = new Npm(TMPDIR, () => void 0);

    // WHEN
    const mockChildProcess = new MockChildProcess(256 - errno);
    mockSpawn.mockReturnValue(mockChildProcess);

    // THEN
    const err = await npm.install('foo').then(
      () => Promise.reject(fail('Expected an NpmError!')),
      (e) => Promise.resolve(e),
    );
    expect(err).toBeInstanceOf(NpmError);
    expect((err as NpmError).message).toContain(`possibly ${errname}`);
  });
}

class MockChildProcess extends EventEmitter implements ChildProcess {
  // We are not using this, so we make it null here.
  public readonly stdin: Writable = null as any;
  // Using an EventEmitter, as we only use `.on` with this.
  public readonly stderr: Readable = new EventEmitter() as any;
  // Using an EventEmitter, as we only use `.on` with this.
  public readonly stdout: Readable = new EventEmitter() as any;

  public readonly stdio = [
    this.stdin,
    this.stdout,
    this.stderr,
    null as any,
    null as any,
  ] as ChildProcess['stdio'];

  public constructor(
    public readonly exitCode: number | null,
    {
      stderr = [],
      stdout = [],
    }: { stderr?: readonly Buffer[]; stdout?: readonly Buffer[] } = {},
  ) {
    super();

    setImmediate(() => {
      for (let i = 0; i < Math.max(stderr.length, stdout.length); i++) {
        if (i < stderr.length) {
          this.stderr.emit('data', stderr[i]);
        }
        if (i < stdout.length) {
          this.stdout.emit('data', stdout[i]);
        }
      }
      this.emit('close', this.exitCode);
    });
  }

  public addListener(): never {
    throw new UnsupportedCallError();
  }

  public get connected(): never {
    throw new UnsupportedCallError();
  }

  public disconnect(): never {
    throw new UnsupportedCallError();
  }

  public kill(): never {
    throw new UnsupportedCallError();
  }

  public get killed(): never {
    throw new UnsupportedCallError();
  }

  public get pid(): never {
    throw new UnsupportedCallError();
  }

  public ref(): never {
    throw new UnsupportedCallError();
  }

  public send(): never {
    throw new UnsupportedCallError();
  }

  public get signalCode(): never {
    throw new UnsupportedCallError();
  }

  public get spawnargs(): never {
    throw new UnsupportedCallError();
  }

  public get spawnfile(): never {
    throw new UnsupportedCallError();
  }

  public unref(): never {
    throw new UnsupportedCallError();
  }
}

export class UnsupportedCallError extends Error {
  public readonly name = 'UnsupportedCallError';

  public constructor(message: string = 'Unsupported call!') {
    super(message);
  }
}
