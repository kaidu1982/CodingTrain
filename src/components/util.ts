import { Tile } from './tile';

export const preload = (type = 'circuit') => {
    const path = `./tiles/${type}`;

    return new Array(13).fill(0).map((value: any, index: number) => {
        const img = new Image();
        if (type === 'circuit') {
            img.src = `${path}/${index}.png`;
        } else {
            let sub;

            if (index === 0) sub = 'blank';
            else if (index === 1) sub = 'up';
            else if (index === 2) sub = 'right';
            else if (index === 3) sub = 'down';
            else if (index === 4) sub = 'left';

            img.src = `${path}/${sub}.png`;
        }

        return img;
    });
};

type keyNTile = {
    [index: string]: Tile;
};

export const removeDuplicatedTiles = (tiles: Tile[]) => {
    const uniqueTilesMap: keyNTile = {};
    for (const tile of tiles) {
        const key = tile.edges.join(','); // ex: "ABB,BCB,BBA,AAA"
        uniqueTilesMap[key] = tile;
    }
    return Object.values(uniqueTilesMap);
};
