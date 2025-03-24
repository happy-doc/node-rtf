import { Format } from "../format";

export abstract class Element {
    format: Format;

    constructor(format?: Format) {
        // If no format is provided, create a new one.
        this.format = format ?? new Format();
    }

    // Declare an abstract method so that all subclasses must implement it.
    abstract getRTFCode(
        colorTable: any,
        fontTable: any,
        callback: (err: Error | null, result?: string) => void
    ): void;
}
