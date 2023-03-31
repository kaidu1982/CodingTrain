//https://github.com/processing/p5.js/blob/main/src/math/p5.Vector.js

export const random2D = () => {
    return fromAngle(Math.random() * Math.PI * 2);
};

export const fromAngle = (angle: number, length = 1): Vector2D => {
    return new Vector2D(length * Math.cos(angle), length * Math.sin(angle));
};

export const createVector = (x = 0, y = 0) => {
    return new Vector2D(x, y);
};

export const dist = (a: Vector2D, b: Vector2D): number => {
    a.sub(b);

    return a.mag();
};

export const constrain = (n: number, low: number, high: number) => {
    return Math.max(Math.min(n, high), low);
};

export const map = (
    n: number,
    start1: number,
    stop1: number,
    start2: number,
    stop2: number,
    withinBounds?: number
) => {
    const newval =
        ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
    if (!withinBounds) {
        return newval;
    }
    if (start2 < stop2) {
        return constrain(newval, start2, stop2);
    } else {
        return constrain(newval, stop2, start2);
    }
};

export class Vector2D {
    x: number;
    y: number;

    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    set(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    copy() {
        return new Vector2D(this.x, this.y);
    }

    mag(): number {
        return Math.sqrt(this.magSq());
    }
    setMag(length: number) {
        return this.normalize().multiScale(length);
    }

    add(vec: Vector2D) {
        this.x += vec.x;
        this.y += vec.y;
    }

    sub(vec: Vector2D) {
        this.x -= vec.x;
        this.y -= vec.y;
    }

    multiScale(scale: number) {
        this.x *= scale;
        this.y *= scale;
    }
    divScale(scale: number) {
        this.x /= scale;
        this.y /= scale;
    }

    limit(max: number) {
        const mSq = this.magSq();
        if (mSq > max * max) {
            this.divScale(Math.sqrt(mSq)); //normalize it
            this.multiScale(max);
        }
    }
    magSq(): number {
        const x = this.x;
        const y = this.y;

        return x * x + y * y;
    }

    normalize() {
        const len = this.mag();
        // here we multiply by the reciprocal instead of calling 'div()'
        // since div duplicates this zero check.
        if (len !== 0) this.multiScale(1 / len);
        return this;
    }

    heading() {
        const h = Math.atan2(this.y, this.x);
        // if (this.isPInst) return this._fromRadians(h);
        return h;
    }

    dist(v: Vector2D) {
        return dist(this.copy(), v);
    }
}
