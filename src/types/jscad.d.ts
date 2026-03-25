
declare module '@jscad/3mf-serializer' {
  /**
   * 序列化选项
   */
  interface SerializeOptions {
    /** 单位：millimeter, inch, feet, meter, micrometer 等，默认 'millimeter' */
    unit?: string;
    /** 是否添加元数据（如创建日期），默认 true */
    metadata?: boolean;
    /** 默认颜色 [r, g, b, a]，取值范围 0-1，默认 [0,0,0,1] */
    defaultcolor?: [number, number, number, number];
    /** 是否压缩为 ZIP 包，默认 true；false 则返回 XML 字符串 */
    compress?: boolean;
  }

  /**
   * 将 JSCAD 几何体（geom3 或数组）序列化为 3MF 格式
   * @param options - 序列化选项，可选
   * @param objects - 一个或多个 JSCAD 几何体对象（geom3 或包含多个 geom3 的数组）
   * @returns 如果 compress = true 则返回 Uint8Array（ZIP 包），否则返回 string（XML）
   */
  export function serialize(
    options: SerializeOptions | undefined,
    ...objects: any[]
  ): (ArrayBuffer | string)[];

    /** 3MF 文件的 MIME 类型 */
  export const mimeType: string;
  /** 3MF 文件的扩展名（不带点） */
  export const fileExtension: string;
}