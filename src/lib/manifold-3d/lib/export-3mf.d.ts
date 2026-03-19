/**
 * Serialize in memory glTF-transform documents to 3MF.
 * @packageDocumentation
 * @group ManifoldCAD
 * @category Input/Output
 * @groupDescription Export
 * These properties implement the {@link lib/export-model!Exporter | Exporter}
 * interface. Through this interface, manifoldCAD can determine when to use this
 * module to export a model.
 */
import * as GLTFTransform from '@gltf-transform/core';
import type { ExportOptions } from './export-model.ts';
/**
 * @group Export
 */
export declare const exportFormats: {
    extension: string;
    mimetype: string;
}[];
export interface Header {
    unit?: 'micron' | 'millimeter' | 'centimeter' | 'inch' | 'foot' | 'meter';
    title?: string;
    author?: string;
    description?: string;
    application?: string;
    creationDate?: string;
    license?: string;
    modificationDate?: string;
}
export interface Export3MFOptions extends ExportOptions {
    mimetype?: string;
    header?: Header;
}
/**
 * Convert a GLTF-Transform document to a 3MF model.
 *
 * @param doc The GLTF document to convert.
 * @returns A blob containing the converted model.
 * @group Export
 */
export declare function toArrayBuffer(doc: GLTFTransform.Document, options?: Export3MFOptions): Promise<ArrayBuffer>;
//# sourceMappingURL=export-3mf.d.ts.map