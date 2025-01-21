import { describe, expect, it } from 'vitest';

import { CapsuleApiError } from '../src/error';

const TEST_MSG = 'Test Error';
const TEST_CODE = 'TEST_CODE';
const TEST_STATUS = 400;
const TEST_RESP_URL = 'https://api.test.com/test';

describe('error', () => {
  it('constructor', () => {
    const error = new CapsuleApiError(TEST_MSG, TEST_CODE, TEST_STATUS, TEST_RESP_URL);

    expect(error).toBeInstanceOf(CapsuleApiError);
    expect(error.isCapsuleApiError).toBeTruthy();
    expect(error.name).toBe('CapsuleApiError');
    expect(error.message).toBe(TEST_MSG);
    expect(error.code).toBe(TEST_CODE);
    expect(error.status).toBe(TEST_STATUS);
    expect(error.responseURL).toBe(TEST_RESP_URL);
    expect(error.stack).toBeDefined();
  });
  it('no Error.captureStackTrace', () => {
    Error.captureStackTrace = undefined;

    const error = new CapsuleApiError(TEST_MSG, TEST_CODE, TEST_STATUS, TEST_RESP_URL);

    expect(error).toBeInstanceOf(CapsuleApiError);
    expect(error.isCapsuleApiError).toBeTruthy();
    expect(error.name).toBe('CapsuleApiError');
    expect(error.message).toBe(TEST_MSG);
    expect(error.code).toBe(TEST_CODE);
    expect(error.status).toBe(TEST_STATUS);
    expect(error.responseURL).toBe(TEST_RESP_URL);
    expect(error.stack).toBeDefined();
  });
});
