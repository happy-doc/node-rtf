import { Element } from "./element";
import * as fs from "fs";

export class ImageElement extends Element {
  path: string;
  dpi: number;

  constructor(path: string) {
    super();
    this.path = path;
    this.dpi = 300;
  }

  getRTFCode(
    colorTable: any,
    fontTable: any,
    callback: (err: Error | null, result?: string) => void
  ): void {
    var imageinfo = require('imageinfo')

    fs.readFile(this.path, (err, buffer) => {
      if (err) {
        return callback(err);
      }

      const info = imageinfo(buffer);

      if (!info) {
        return callback(new Error("Invalid image file."));
      }

      const twipRatio = ((72 / this.dpi) * 20);
      const twipWidth = Math.round(info.width * twipRatio);
      const twipHeight = Math.round(info.height * twipRatio);

      let output = `{\\pict\\pngblip\\picw${info.width}\\pich${info.height}` +
        `\\picwgoal${twipWidth}\\pichgoal${twipHeight} `;

      // Convert the buffer to hexadecimal representation.
      for (let i = 0; i < buffer.length; i++) {
        let hex = buffer[i].toString(16);
        output += (hex.length === 2) ? hex : "0" + hex;
      }
      output += "}";
      callback(null, output);
    });
  }
}
