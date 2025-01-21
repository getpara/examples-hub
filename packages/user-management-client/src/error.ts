export function CapsuleApiError(message: string, code?: string, status?: number, responseURL?: string) {
  Error.call(this);

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = new Error().stack;
  }

  this.message = message;
  this.name = 'CapsuleApiError';
  code && (this.code = code);
  status && (this.status = status);
  responseURL && (this.responseURL = responseURL);
}

const prototype = CapsuleApiError.prototype;

Object.defineProperty(prototype, 'isCapsuleApiError', { value: true });
