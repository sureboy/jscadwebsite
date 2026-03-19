/**
 * Exceptions, and where to find them.
 *
 * @packageDocumentation
 * @group ManifoldCAD
 * @category Core
 */
import type { BuildFailure, Location, Message } from 'esbuild-wasm';
export declare class BundlerError extends Error {
    location?: Location;
    error: Message;
    manifoldStack?: string;
    constructor(failure: BuildFailure, options?: ErrorOptions);
    get name(): string;
    get message(): string;
}
export declare class RuntimeError extends Error {
    manifoldStack?: string;
    cause: Error;
    constructor(cause: Error, message?: string, options?: ErrorOptions);
    get name(): string;
}
export declare class UnsupportedFormatError extends Error {
    constructor(identifier: string, supported: Array<{
        mimetype: string;
        extension: string;
    }>);
}
export declare class ImportError extends Error {
}
//# sourceMappingURL=error.d.ts.map