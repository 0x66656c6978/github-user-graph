export class Point {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

export function pointOnLineAtDistance(
  a: Point,
  b: Point,
  d: number,
  directionToTarget: boolean = false
): Point {
  let t = (d / Math.sqrt((b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y)));
  if (directionToTarget) {
    t = -t;
  }
  return new Point(
    (t * a.x + (1 - t) * b.x),
    (t * a.y + (1 - t) * b.y)
  );
}
