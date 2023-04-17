// Transient errors can occur when executing some tests in parallel i.e. ENOENT: no such file or directory.
jest.retryTimes(2);

jest.setTimeout(300 * 1000);