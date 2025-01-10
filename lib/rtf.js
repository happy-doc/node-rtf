/**
 * RTF Library, for making rich text documents from scratch!
 * by Jonathan Rowny
 *
 */

var RGB = require("./rgb"),
    Element = require("./elements/element"),
    Format = require("./format"),
    Utils = require("./rtf-utils"),
    Language = require("./language"),
    Orientation = require("./orientation"),
    TextElement = require("./elements/text"),
    GroupElement = require("./elements/group"),
    async = require('async');

module.exports = RTF = function () {
  //Options
    this.pageNumbering = false;
    this.marginLeft = 1800;
    this.marginRight = 1800;
    this.marginBottom = 1440;
    this.marginTop = 1440;
    
    this.language = Language.ENG_US;
    
    this.columns = 0;//columns?
    this.columnLines = false;//lines between columns
    this.orientation = Orientation.PORTRAIT;
    
    //stores the elemnts
    this.elements = [];
    //stores the colors
    this.colorTable = [];
    //stores the fonts
    this.fontTable = [];
};

RTF.prototype.writeText = function (text, format, groupName) {
    element = new TextElement(text, format);

    console.debug("rtf - adding text ("+ text + ") to group: " + groupName);

    if (groupName !== undefined) {
      var groupIndex = this._groupIndex(groupName);
      console.debug("groupindex: " + groupIndex);

      if (groupIndex >= 0) {
        this.elements[this._groupIndex(groupName)].addElement(element);
        console.debug("groupName: " + groupName);
      } else {        
        console.debug("group ("+groupName+") not found");
      }
    } else {
      this.elements.push(element);
      console.debug("adding element without group");
    }
};

//TODO: not sure why this function exists... probably to validate incoming tables later on
RTF.prototype.addTable = function (table) {
  this.elements.push(table);
};

RTF.prototype.addTextGroup = function (name, format) {
  console.debug("rtf - adding group element " + name);

  if(this._groupIndex(name)<0) {//make sure we don't have duplicate groups!
    formatGroup = new GroupElement(name, format);
    this.elements.push(formatGroup);

    console.debug("rtf - added format group element " + name);
  }
};

//adds a single command to a given group or as an element
//TODO this should not be in prototype.
RTF.prototype.addCommand = function (command, groupName) {
  if(groupName !== undefined && this._groupIndex(groupName)>=0) {
    this.elements[this._groupIndex(groupName)].addElement({text:command, safe:false});
  } else {
    this.elements.push({text:command, safe:false});
  }
};

//page break shortcut
RTF.prototype.addPage = function (groupName) {
  this.addCommand("\\page", groupName);
};

//line break shortcut
RTF.prototype.addLine = function (groupName) {
  this.addCommand("\\line", groupName);
};

//tab shortcut
RTF.prototype.addTab = function (groupName) {
  this.addCommand("\\tab", groupName);
};

//par shortcut
/* Ends the current paragraph and starts a new one. This includes resetting paragraph-level formatting like alignment, indentation, and other paragraph-specific settings. */
RTF.prototype.addPar = function (groupName) {
  this.addCommand("\\par", groupName);
};


//gets the index of a group
//TODO: make this more private by removing it from prototype and passing elements
RTF.prototype._groupIndex = function (name) {
var index = -1;

  this.elements.forEach(function(el, i) {
    if(el instanceof GroupElement && el.name===name) {
      console.debug("found group " + name + " at index " + i);
      index = i;
    }
    else {
      //console.debug(`el ${typeof el} ${el.name} !== ${name} ${i}`);
    }
  });
  
  return index;
};

 RTF.prototype.createDocument = function (callback) {
    var output = "{\\rtf1\\ansi\\deff0";
    if(this.orientation == Orientation.LANDSCAPE) output+="\\landscape";
    //margins
    if(this.marginLeft > 0) output+="\\margl" + this.marginLeft;
    if(this.marginRight > 0) output+="\\margr" + this.marginRight;
    if(this.marginTop > 0) output+="\\margt" + this.marginTop;
    if(this.marginBottom > 0) output+="\\margb" + this.marginBottom;
    output+="\\deflang" + this.language;
    
    var tasks = [];
    var ct = this.colorTable;
    var ft = this.fontTable;
    this.elements.forEach(function(el, i) {
      if (el instanceof Element){
          tasks.push(function(cb) { el.getRTFCode(ct, ft, cb); });
      } else {
          tasks.push(function(cb) { cb(null, Utils.getRTFSafeText(el)); });
      }
    });

    return async.parallel(tasks, function(err, results) {
      var elementOutput = "";
      results.forEach(function(result) {
           elementOutput+=result;
      });

      //now that the tasks are done running: create tables, data populated during element output
      output+=Utils.createColorTable(ct);
      output+=Utils.createFontTable(ft);

      //other options
      if(this.pageNumbering) output+="{\\header\\pard\\qr\\plain\\f0\\chpgn\\par}";
      if(this.columns > 0) output+="\\cols" + this.columns;
      if(this.columnLines) output+="\\linebetcol";

      //final output
      output+=elementOutput+"}";

      return callback(null, output);
    });
 };
