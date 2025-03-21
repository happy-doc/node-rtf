import { RTF } from '../lib/rtf';
import { Format } from '../lib/format';
import { Colors } from '../lib/colors';
import { RGB } from '../lib/rgb';
import * as fs from 'fs';

const myDoc = new RTF();

const red_underline = new Format();
const blue_strike = new Format();
const green_bold = new Format();
const maroon_super = new Format();
const gray_sub = new Format();
const lime_indent = new Format();
const custom_blue = new Format();

red_underline.color = Colors.RED;
red_underline.underline = true;
red_underline.fontSize = 20;
myDoc.writeText("Red underlined", red_underline);
myDoc.addLine();

blue_strike.color = Colors.RED;
blue_strike.strike = true;
myDoc.writeText("Strikeout Blue", blue_strike);
myDoc.addLine();

green_bold.color = Colors.GREEN;
green_bold.bold = true;
myDoc.writeText("Bold Green", green_bold);
myDoc.addLine();

maroon_super.color = Colors.MAROON;
maroon_super.superScript = true;
myDoc.writeText("Superscripted Maroon", maroon_super);
myDoc.addLine();

gray_sub.color = Colors.GRAY;
gray_sub.subScript = true;
myDoc.writeText("Subscripted Gray", gray_sub);
myDoc.addLine();

lime_indent.color = Colors.LIME;
lime_indent.backgroundColor = Colors.GRAY; // Note: using Colors.GRAY as defined in your colors module
lime_indent.leftIndent = 50;
myDoc.writeText("Left indented Lime", lime_indent);
myDoc.addLine();

custom_blue.color = new RGB(3, 80, 150);
myDoc.writeText("Custom blue color", custom_blue);

myDoc.createDocument((err, output) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log(output);
    fs.writeFile('formatting.rtf', output || '', err => {
        if (err) console.error(err);
    });
});
