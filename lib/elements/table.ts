import { Element } from "./element";
import * as Utils from "../rtf-utils";
import async from "async";

// Helper to count the maximum number of columns among all rows.
function columnCount(target: any[][]): number {
  let max = 0;
  target.forEach(row => {
    if (row.length > max) {
      max = row.length;
    }
  });
  return max;
}

export class TableElement extends Element {
  _data: (Element | string)[][];
  _rows: number;
  _cols: number;

  //public
  //array of column widths in inches
  columnWidths: number[];

  //order is the same as CSS, top, right, bottom, left (defined as Points)
  cellBorders: number[];

  constructor(format?: any) {
    super(format);
    this._data = [];
    this._rows = 0;
    this._cols = 0;
    this.columnWidths = [];

    this.cellBorders = [0, 0, 0, 0];
  }

  addRow(row: (Element | string)[]): void {
    this._data.push(row);
  }

  setData(data: (Element | string)[][]): void {
    this._data = data;
  }

  getRTFCode(
    colorTable: any,
    fontTable: any,
    callback: (err: Error | null, result?: string) => void
  ): void {
    this._rows = this._data.length;
    this._cols = columnCount(this._data);

    //trowd: table row defaults
    //trgaph150: row gap 150 twips
    let pre = "{ \\trowd\\trgaph150";
    let post = "";

    let defaultCellWidth = 10000 / this._cols;
    let actualColumnWidths = Array(this._cols).fill(defaultCellWidth);

    for (let w = 0; w < this.columnWidths.length; w++) {
      if (this.columnWidths[w] > 0) {
        //convert inches to twips if it's set
        actualColumnWidths[w] = this.columnWidths[w] * 1440;
      }
    }

    for (let j = 0; j < this._cols; j++) {

      pre += `\\clbrdrt${this.getBorderString(this.cellBorders[0])}\n`;// Top border: single line, pts -> twips
      pre += `\\clbrdrr${this.getBorderString(this.cellBorders[1])}\n`;// Right border: single line, pts -> twips
      pre += `\\clbrdrb${this.getBorderString(this.cellBorders[2])}\n`;// Bottom border: single line, pts -> twips
      pre += `\\clbrdrl${this.getBorderString(this.cellBorders[3])}\n`;// Left border: single line, pts -> twips

      //set the width of the cell
      pre += "\\cellx" + (actualColumnWidths[j]).toString();

      post += "";
    }
    pre += "\n";

    post += " \\row }\n";

    const tasks: Array<(rowcb: (err: Error | null, result?: string) => void) => void> = [];

    // Helper function to generate a task for a single row.
    const rowTask = (row: any[]): ((rowcb: (err: Error | null, result?: string) => void) => void) => {
      return (rowcb) => {
        const rowTasks: Array<(cb: (err: Error | null, result?: string) => void) => void> = [];
        row.forEach(el => {
          if (el instanceof Element) {
            rowTasks.push(cb => el.getRTFCode(colorTable, fontTable, cb));
          } else {
            rowTasks.push(cb => cb(null, Utils.getRTFSafeText(el)));
          }
        });

        async.parallel(rowTasks, (err, results?: (string | undefined)[]) => {
          if (err) return rowcb(err);
          let out = "";
          if (results) {
            results.forEach(result => {
              //replace the opening and closing curlies so that we style 
              //the cell and not the just the text within the cell
              result = result?.replace(/^{/, "").replace(/}\n?$/, "") ?? "";

              out += result + " \\cell ";
            });
          }
          rowcb(null, out);
        });
      };
    };

    // Create a task for each row.
    for (let i = 0; i < this._rows; i++) {
      if (this._data[i]) {
        tasks.push(rowTask(this._data[i]));
      }
    }

    async.parallel(tasks, (err, results?: (string | undefined)[]) => {
      if (err) return callback(err);
      let rows = "";

      if (results) {
        results.forEach(result => {
          rows += pre + "\\pard\\intbl " + result + " " + post;
        });
      }

      const rtf = rows;
      callback(null, rtf);
    });
  }

  getBorderString(width: number) {
    return (width > 0
      ? "\\brdrs\\brdrw" + width * 20 + "\n"// pts -> twips
      : "\\brdrnone");
  }
}
