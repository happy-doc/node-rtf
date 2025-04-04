import { Format } from "../format";
import { RGB } from "../rgb";
import { Element } from "./element";
import { getRTFSafeText } from "../rtf-utils";

export class LinkElement extends Element {
    url: string;
    displayText: string;
    isExternalURL: boolean; // Flag to indicate if the URL is external
    constructor(url: string, displayText: string, format?: Format, isExternalURL: boolean = false) {
        // If no format provided, create a default one for links
        const linkFormat = format ?? new Format();

        // Ensure typical link styling if not overridden
        if (!linkFormat.color) {
            linkFormat.color = RGB.BLUE; // Default to blue
        }
        if (!linkFormat.underline) {
            linkFormat.underline = true; // Default to underline
        }

        super(linkFormat);
        this.url = url;
        this.displayText = displayText;
        this.isExternalURL = isExternalURL; // Store the external URL flag
    }

    getRTFCode(
        colorTable: Array<RGB>, // Use the RGB type
        fontTable: string[],
        callback: (err: Error | null, result?: string) => void
    ): void {
        try {
            // Ensure format properties (color, font) are registered in tables
            this.format.updateTables(colorTable, fontTable);

            // Prepare format codes (font, size, color, underline, etc.)
            let formatCodes = "";
            if (this.format.fontPos >= 0) {
                formatCodes += `\\f${this.format.fontPos}`;
            }
            if (this.format.fontSize > 0) {
                formatCodes += `\\fs${this.format.fontSize * 2}`;
            }
             // Always add color for the link display text
            if (this.format.colorPos >= 0) {
                 // Add 1 because color table is 1-indexed in RTF (\cf1, \cf2, ...)
                formatCodes += `\\cf${this.format.colorPos + 1}`;
            }
             // Always add underline for the link display text
            if (this.format.underline) {
                formatCodes += "\\ul";
            }
            if (this.format.bold) {
                formatCodes += "\\b";
            }
            if (this.format.italic) {
                formatCodes += "\\i";
            }
            // Add other format codes as needed (strike, super, sub)

             // Escape the URL and display text for safety within RTF structure
             // Note: URLs themselves might have issues if they contain complex chars,
             // but basic escaping handles common cases like spaces or backslashes.
            const safeUrl = getRTFSafeText(this.url);
            const safeDisplayText = getRTFSafeText(this.displayText);

            // Construct the RTF string for the hyperlink field
            // Structure: {\pard \[format codes] {\field{\*\fldinst HYPERLINK "URL"}{\fldrslt [DISPLAY_TEXT]}}}[\format resets \pard]
            // The outer {} and \pard ensures the formatting is scoped to the link.
            // We apply format codes *before* the \field block.
            // \fldrslt block inherits the preceding format.
            let rtfString = `{\\pard ${formatCodes} ` // Start group, apply formatting
                    
            if (this.isExternalURL) {
                // If it's an external URL, we need to add the external link format
                rtfString += `{\\field{\\*\\fldinst HYPERLINK "${safeUrl}"}}{\\fldrslt ${safeDisplayText}}`; 
            } else {
                rtfString += `{\\field{\\*\\fldinst HYPERLINK A}{\\fldrslt ${safeUrl}}}`  // The field itself
            }

            rtfString += `\\ul0\\b0\\i0}`; // Reset specific styles and end group. \\pard might be needed depending on context.

            callback(null, rtfString);
        } catch (err) {
            callback(err instanceof Error ? err : new Error(String(err)));
        }
    }
}