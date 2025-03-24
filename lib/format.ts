import * as Utils from "./rtf-utils";
import { RGB } from "./rgb";
import { Fonts } from "./fonts";

export class Format {
  underline: boolean = false;
  bold: boolean = false;
  italic: boolean = false;
  strike: boolean = false;

  superScript: boolean = false;
  subScript: boolean = false;

  makeParagraph: boolean = false;
  align: string = "";
  leftIndent: number = 0;
  rightIndent: number = 0;
  font: string = Fonts.ARIAL;
  fontSize: number = 0;
  color?: RGB;
  backgroundColor?: RGB;
  colorPos: number = -1;
  backgroundColorPos: number = -1;
  fontPos: number = -1;

  updateTables(colorTable: Array<RGB>, fontTable: string[]): void {
    this.fontPos = fontTable.indexOf(this.font);
    this.colorPos = getColorPosition(colorTable, this.color);
    this.backgroundColorPos = getColorPosition(colorTable, this.backgroundColor);

    if (this.fontPos < 0 && this.font && this.font.length > 0) {
      fontTable.push(this.font);
      this.fontPos = fontTable.length - 1;
    }
    if (this.colorPos < 0 && this.color !== undefined) {
      colorTable.push(this.color);
      this.colorPos = colorTable.length;
    }
    if (this.backgroundColorPos < 0 && this.backgroundColor !== undefined) {
      colorTable.push(this.backgroundColor);
      this.backgroundColorPos = colorTable.length;
    }
  }

  formatText(text: string, colorTable: Array<RGB>, fontTable: string[], safeText?: boolean): string {
    this.updateTables(colorTable, fontTable);
    let rtf = "{";
    if (this.makeParagraph) rtf += "\\pard";

    if (this.fontPos >= 0) rtf += "\\f" + this.fontPos;
    if (this.backgroundColorPos >= 0) rtf += "\\cb" + (this.backgroundColorPos + 1);
    if (this.colorPos >= 0) rtf += "\\cf" + this.colorPos;
    if (this.fontSize > 0) rtf += "\\fs" + (this.fontSize * 2);
    if (this.align.length > 0) rtf += this.align;
    if (this.leftIndent > 0) rtf += "\\li" + (this.leftIndent * 20);
    if (this.rightIndent > 0) rtf += "\\ri" + this.rightIndent;

    let content = " ";
    if (safeText === undefined || safeText) {
      content += Utils.getRTFSafeText(text);
    } else {
      content += text;
    }

    if (this.bold) content = wrap(content, "\\b");
    if (this.italic) content = wrap(content, "\\i");
    if (this.underline) content = wrap(content, "\\ul");
    if (this.strike) content = wrap(content, "\\strike");
    if (this.subScript) content = wrap(content, "\\sub");
    if (this.superScript) content = wrap(content, "\\super");
    rtf += content;

    if (this.makeParagraph) rtf += "\\par";
    rtf += "}\n";

    return rtf;
  }
}

function getColorPosition(table: Array<{ red: number; green: number; blue: number }>, find: any): number {
  if (find !== undefined && find instanceof RGB) {
    for (let index = 0; index < table.length; index++) {
      const color = table[index];
      if (color.red === find.red && color.green === find.green && color.blue === find.blue) {
        return index;
      }
    }
  }
  return -1;
}

function wrap(text: string, rtfwrapper: string): string {
  return rtfwrapper + text + rtfwrapper + "0";
}
