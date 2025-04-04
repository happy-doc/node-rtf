import { Fonts } from "./fonts";

declare global {
  interface String {
    replaceAll(token: string, newToken: string, ignoreCase?: boolean): string;
  }
}

export function getRTFSafeText(text: any): string {
  if (typeof text === "object" && text.hasOwnProperty("safe") && !text.safe) {
    return text.text;
  }

  if (typeof text !== 'string') {
    return '';
  }

  return text.replaceAll('\\', '\\\\')
    .replaceAll('{', '\\{')
    .replaceAll('}', '\\}')
    .replaceAll('~', '\\~')
    .replaceAll('\n\r', ' \\line ')
    .replaceAll('\n', ' \\line ')
    .replaceAll('\r', ' \\line ');
}

export function createColorTable(colorTable: Array<{ red: number; green: number; blue: number }>): string {
  let table = "{\\colortbl;";
  for (let c = 0; c < colorTable.length; c++) {
    const rgb = colorTable[c];
    table += `\\red${rgb.red}\\green${rgb.green}\\blue${rgb.blue};`;
  }
  table += "}";
  return table;
}

export function createFontTable(fontTable: string[]): string {
  let table = "{\\fonttbl;";
  if (fontTable.length === 0) {
    table += `{\\f0 ${Fonts.ARIAL}}`;
  } else {
    for (let f = 0; f < fontTable.length; f++) {
      table += `{\\f${f} ${fontTable[f]}}`;
    }
  }
  table += "}";
  return table;
}
