// Type definitions for sha1 1.1
// Project: https://github.com/pvorb/node-sha1
// Definitions by: Bill Sourour <https://github.com/arcdev1>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

/**
 * js function for hashing messages with SHA1
 *
 * @param message - a string or buffer to hash
 * @param options - an options object
 * @returns the resultant SHA1 hash of the given message
 */
export declare function sha1(
  message: string | Buffer,
  options?: Sha1AsStringOptions
): string;
export declare function sha1(
  message: string | Buffer,
  options?: Sha1AsBytesOptions
): Uint8Array;
export declare function sha1(
  message: string | Buffer,
  options?: Sha1Options
): string | Uint8Array;

interface Sha1AsStringOptions {
  asBytes?: false | undefined;
  asString?: boolean | undefined;
}

interface Sha1AsBytesOptions {
  asBytes: true;
  asString?: false | undefined;
}

type Sha1Options = Sha1AsStringOptions | Sha1AsBytesOptions;
