import { Element } from "./element";
import * as Utils from "../rtf-utils";
import async from "async";
import { Format } from "../format";

// GroupElement is an Element that contains other elements.
export class GroupElement extends Element {
  name: string;
  elements: any[];

  constructor(name: string, format?: Format) {
    super(format);
    this.name = name;
    this.elements = [];
    // If a format is provided and has an alignment, enable paragraph formatting.
    if (this.format && this.format.align) {
      this.format.makeParagraph = true;
    }
  }

  addElement(element: any): void {
    this.elements.push(element);
  }

  getRTFCode(
    colorTable: any,
    fontTable: any,
    callback: (err: Error | null, result?: string) => void
  ): void {
    const tasks: Array<(cb: (err: Error | null, result?: string) => void) => void> = [];
    let rtf = "";

    // For each sub-element, generate a task to get its RTF code.
    this.elements.forEach(el => {
      if (el instanceof Element) {
        tasks.push(cb => el.getRTFCode(colorTable, fontTable, cb));
      } else {
        tasks.push(cb => cb(null, Utils.getRTFSafeText(el)));
      }
    });

    async.parallel(tasks, (err, results?: (string | undefined)[]) => {
      if (err) {
        return callback(err);
      }

      if (results) {
        results.forEach(result => {
          rtf += result;
        });
      }

      // Format the complete group text using its format.
      rtf = this.format.formatText(rtf, colorTable, fontTable, false);
      callback(null, rtf);
    });
  }
}
