declare module "pdfkit" {
  import { EventEmitter } from "node:events";

  type DocumentOptions = Readonly<{ autoFirstPage?: boolean; info?: Readonly<{ Title?: string; Author?: string }> }>;
  type PageOptions = Readonly<{ size?: string; margin?: number }>;
  type ImageOptions = Readonly<{ width?: number; height?: number }>;

  export default class PDFDocument extends EventEmitter {
    constructor(options?: DocumentOptions);
    addPage(options?: PageOptions): this;
    image(source: Buffer, x: number, y: number, options?: ImageOptions): this;
    end(): void;
  }
}
