//https://github.com/processing/p5.js/blob/main/src/math/p5.Vector.js

export const random2D = () => {
    return fromAngle(Math.random() * Math.PI * 2);
};

export const fromAngle = (angle: number, length = 1) => {
    return new Vector2D(length * Math.cos(angle), length * Math.sin(angle));
};

export const createVector = () => {
    return new Vector2D();
};
export class Vector2D {
    x: number;
    y: number;

    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    copy() {
        return new Vector2D(this.x, this.y);
    }

    mag() {
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
    magSq() {
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
}
