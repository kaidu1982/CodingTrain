import { Vector2D } from '@/class/Vector';

export const random = (n1: number, n2?: number | undefined) => {
    const [minValue, range] =
        n2 !== undefined ? [Math.min(n1, n2), Math.abs(n2 - n1)] : [0, n1];

    return minValue + Math.random() * range;
};

export const dist = (a: Vector2D, b: Vector2D) =>
    Math.pow(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2), 1 / 2);
