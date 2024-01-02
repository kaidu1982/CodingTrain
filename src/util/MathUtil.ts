import { Vector2D } from '@/class/Vector';

export const random = (n1: number, n2?: number | undefined) => {
    const [minValue, range] =
        n2 !== undefined ? [Math.min(n1, n2), Math.abs(n2 - n1)] : [0, n1];

    return minValue + Math.random() * range;
};

export const dist = (x1: number, x2: number, y1: number, y2: number) =>
    Math.pow(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2), 1 / 2);

export const make2DArray = (cols: number, rows: number) => {
    let arr = new Array(cols);
    for (let i = 0; i < arr.length; i++) {
        arr[i] = new Array(rows);
    }
    return arr;
};
