export class RGB {
  red: number;
  green: number;
  blue: number;

  constructor(red: number, green: number, blue: number) {
    this.red = red;
    this.green = green;
    this.blue = blue;
  }

  // Add a static constant for convenience
  static readonly BLUE = new RGB(0, 0, 255);
}
