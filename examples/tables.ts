import { RTF } from '../lib/rtf';
import { TableElement } from '../lib/elements/table';
import * as fs from 'fs';

const myDoc = new RTF();
const table = new TableElement();
const table2 = new TableElement();

// Add rows to the first table.
table.addRow(["I'm a table row", "with two columns"]);
table.addRow(["This is the second row", "and the second column"]);
myDoc.addTable(table);

// For the second table, manually set the data (this overwrites any previous data).
table2.setData([
  ["Name", "Price", "Sold"],
  ["Rubber Ducky", "$10.00", "22"],
  ["Widget", "$99.99", "42"],
  ["Sproket", "$5.24", "11"]
]);
// Adding an extra row.
table2.addRow(["Banana", "$0.12", "1"]);

myDoc.createDocument((err, output) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(output);
  fs.writeFile('table-sample.rtf', output || '', err => {
    if (err) console.error(err);
  });
});
