import { TextDecoder, TextEncoder } from 'util';

Object.assign(globalThis, {
  clearImmediate: () => {
    // noop
  },
  TextEncoder,
  TextDecoder,
});
