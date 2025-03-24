import { RTF } from '../lib/rtf';
import * as fs from 'fs';
import { ImageElement } from '../lib/elements/image';

const myDoc = new RTF();

// Add an image element to the document. Adjust the image path as necessary.
myDoc.elements.push(new ImageElement('examples/dog.jpg'));

myDoc.createDocument((err, output) => {
  if (err) {
    console.error(err);
    return;
  }
  fs.writeFile('image.rtf', output || '', err => {
    if (err) console.error(err);
  });
});
