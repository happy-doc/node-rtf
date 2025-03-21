import { RTF } from '../lib/rtf';
import { Format } from '../lib/format';
import { Colors } from '../lib/colors';
import * as fs from 'fs';

const myDoc = new RTF();
const format = new Format();

format.color = Colors.ORANGE;
myDoc.writeText("Happy Halloween", format);
myDoc.addPage();
myDoc.addLine();
myDoc.addTab();
myDoc.writeText("Trick or treat!");

myDoc.createDocument((err, output) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(output);
  fs.writeFile('halloween.rtf', output || '', err => {
    if (err) console.error(err);
  });
});
