/**
 * Rewritten for typescript consumption.
 * Original authors:
 * http://bl.ocks.org/jdarling/06019d16cb5fd6795edf
 * http://martin.ankerl.com/2009/12/09/how-to-create-random-colors-programmatically/
 */
export class ColorHelper {
  static goldenRatioConjugate = 0.618033988749895;
  static hash = Math.random();

  static randomColor(): string {
    this.hash += this.goldenRatioConjugate;
    this.hash %= 1;
    return this.hslToRgb(this.hash, 0.5, 0.6);
  }

  static hslToRgb(h: number, s: number, l: number): string{
    let r: number;
    let g: number;
    let b: number;

    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = this.hueToRgb(p, q, h + 1 / 3);
        g = this.hueToRgb(p, q, h);
        b = this.hueToRgb(p, q, h - 1 / 3);
    }
    return `#${this.rgbHexStr(r)}${this.rgbHexStr(g)}${this.rgbHexStr(b)}`
  }

  static hueToRgb(p: number, q: number, t: number): number {
    if (t < 0) {
      t += 1;
    }
    if (t > 1) {
      t -= 1;
    }
    if (t < 1 / 6) {
      return p + (q - p) * 6 * t;
    }
    if (t < 1 / 2) {
      return q;
    }
    if (t < 2 / 3) {
      return p + (q - p) * (2 / 3 - t) * 6;
    }
    return p;
  }

  static rgbHexStr(n: number): string {
    return Math.round(n * 255).toString(16);
  }
}
