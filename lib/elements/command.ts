import { Element } from "./element";
import * as Utils from "../rtf-utils";

// CommandElement is an Element that contains an rtf command and won't be escaped
export class CommandElement extends Element {
    text: string;
    safe: boolean;

    constructor(text: string, safe: boolean, format?: any) {
        super(format);
        this.text = text;
        this.safe = safe;
    }

    getRTFCode(
        colorTable: any,
        fontTable: any,
        callback: (err: Error | null, result?: string) => void
    ): void {
        callback(null, Utils.getRTFSafeText(this));
    }
}
