export function ParaApiError(message: string, code?: string, status?: number, responseURL?: string) {
  Error.call(this);

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = new Error().stack;
  }

  this.message = message;
  this.name = 'ParaApiError';
  code && (this.code = code);
  status && (this.status = status);
  responseURL && (this.responseURL = responseURL);
}

const prototype = ParaApiError.prototype;

Object.defineProperty(prototype, 'isParaApiError', { value: true });
