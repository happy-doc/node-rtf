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
  _data: any[][];
  _rowFormats: any[];
  _rows: number;
  _cols: number;

  constructor(format?: any) {
    super(format);
    this._data = [];
    this._rowFormats = [];
    this._rows = 0;
    this._cols = 0;
  }

  addRow(row: any[], formats?: any[]): void {
    // Store row-specific formats (if any) and then add the row.
    this._rowFormats[this._data.length] = formats ?? [];
    this._data.push(row);
  }

  setData(data: any[][]): void {
    this._data = data;
  }

  getRTFCode(
    colorTable: any,
    fontTable: any,
    callback: (err: Error | null, result?: string) => void
  ): void {
    this._rows = this._data.length;
    this._cols = columnCount(this._data);

    let pre = "\\trowd\\trautofit1\\intbl";
    let post = "{\\trowd\\trautofit1\\intbl";
    for (let j = 0; j < this._cols; j++) {
      pre += "\\clbrdrt\\brdrs\\brdrw10\\clbrdrl\\brdrs\\brdrw10" +
        "\\clbrdrb\\brdrs\\brdrw10\\clbrdrr\\brdrs\\brdrw10";
      pre += "\\cellx" + (j + 1).toString();
      post += "\\cellx" + (j + 1).toString();
    }
    post += "\\row }";

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
              out += result + "\\cell ";
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
          rows += pre + "{" + result + " }" + post;
        });
      }

      const rtf = "\\par" + rows + "\\pard";
      callback(null, rtf);
    });
  }
}
