import { Element } from "./element";

export class TextElement extends Element {
  text: string;

  constructor(text: string, format?: any) {
    super(format);
    this.text = text;
  }

  getRTFCode(
    colorTable: any,
    fontTable: any,
    callback: (err: Error | null, result?: string) => void
  ): void {
    callback(null, this.format.formatText(this.text, colorTable, fontTable));
  }
}
