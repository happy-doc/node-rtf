import { Element } from "./elements/element"; // adjust the types as needed
import { Format } from "./format";
import * as Utils from "./rtf-utils";
import { Language } from "./language";
import { Orientation } from "./orientation";
import { TextElement } from "./elements/text";
import { GroupElement } from "./elements/group";
import async from "async";
import { CommandElement } from "./elements/command";
import { LinkElement } from "./elements/link";

export class RTF {
  pageNumbering: boolean;
  marginLeft: number;
  marginRight: number;
  marginBottom: number;
  marginTop: number;
  language: string;
  columns: number;
  columnLines: boolean;
  orientation: boolean;
  elements: (Element | GroupElement)[];
  colorTable: any[];
  fontTable: string[];

  constructor() {
    // Options
    this.pageNumbering = false;
    this.marginLeft = 1800;
    this.marginRight = 1800;
    this.marginBottom = 1440;
    this.marginTop = 1440;

    this.language = Language.ENG_US;

    this.columns = 0;
    this.columnLines = false;
    this.orientation = Orientation.PORTRAIT;

    this.elements = [];
    this.colorTable = [];
    this.fontTable = [];
  }

  writeText(text: string, format?: Format, groupName?: string) {
    const element = new TextElement(text, format);
    const groupIndex = this._groupIndex(groupName);
    if (groupName !== undefined && groupIndex >= 0) {
      (this.elements[groupIndex] as GroupElement).addElement(element);
    } else {
      this.elements.push(element);
    }
  }

  writeLink(url: string, displayText: string, format?: Format, groupName?: string) {
    const element = new LinkElement(url, displayText, format);
    const groupIndex = this._groupIndex(groupName);
    if (groupName !== undefined && groupIndex >= 0) {
      (this.elements[groupIndex] as GroupElement).addElement(element);
    } else {
      this.elements.push(element);
    }
  }

  addTable(table: any) {
    this.elements.push(table);
  }

  addTextGroup(name: string, format: Format) {
    if (this._groupIndex(name) < 0) {
      const formatGroup = new GroupElement(name, format);
      this.elements.push(formatGroup);
    }
  }

  addCommand(command: string, groupName?: string) {
    if (groupName !== undefined && this._groupIndex(groupName) >= 0) {
      (this.elements[this._groupIndex(groupName)] as GroupElement).addElement({ text: command, safe: false });
    } else {
      this.elements.push(new CommandElement(command, false));
    }
  }

  addPage(groupName?: string) {
    this.addCommand("\\page", groupName);
  }

  addLine(groupName?: string) {
    this.addCommand("\\line", groupName);
  }

  addTab(groupName?: string) {
    this.addCommand("\\tab", groupName);
  }

  addPar(groupName?: string) {
    this.addCommand("\\par", groupName);
  }

  private _groupIndex(name?: string): number {
    if (!name) return -1;
    let index = -1;
    this.elements.forEach((el, i) => {
      if (el instanceof GroupElement && el.name === name) {
        index = i;
      }
    });
    return index;
  }

  createDocument(callback: (err: Error | null, result?: string) => void): void {
    let output = "{\\rtf1\\ansi\\deff0";
    if (this.orientation === Orientation.LANDSCAPE) output += "\\landscape";
    if (this.marginLeft > 0) output += "\\margl" + this.marginLeft;
    if (this.marginRight > 0) output += "\\margr" + this.marginRight;
    if (this.marginTop > 0) output += "\\margt" + this.marginTop;
    if (this.marginBottom > 0) output += "\\margb" + this.marginBottom;
    output += "\\deflang" + this.language;

    const tasks: Array<(cb: (err: Error | null, result?: string) => void) => void> = [];
    const ct = this.colorTable;
    const ft = this.fontTable;

    this.elements.forEach(el => {
      if (el instanceof Element) {
        tasks.push(cb => {
          el.getRTFCode(ct, ft, cb);
        });
      } else {
        tasks.push(cb => {
          cb(null, Utils.getRTFSafeText(el));
        });
      }
    });

    // Capture reference to "this" for use inside async callback.
    const self = this;
    async.parallel(tasks, function (err, results) {
      if (err) return callback(err);
      let elementOutput = "";

      if (results) {
        results.forEach(result => {
          elementOutput += result;
        });
      }

      output += Utils.createColorTable(ct);
      output += Utils.createFontTable(ft);

      if (self.pageNumbering) output += "{\\header\\pard\\qr\\plain\\f0\\chpgn\\par}";
      if (self.columns > 0) output += "\\cols" + self.columns;
      if (self.columnLines) output += "\\linebetcol";

      output += elementOutput + "}";
      callback(null, output);
    });
  }
}
