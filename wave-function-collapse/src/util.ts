import { Tile } from './tile';

export const preload = (type = 'circuit') => {
    const path = `/tiles/${type}`;

    return new Array(13).fill(0).map((value: any, index: number) => {
        const img = new Image();
        img.src = `${path}/${index}.png`;
        // img.addEventListener('load', (evt) => {
        //     console.log(`${path}/${index}.png load!!!`);
        // });
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

export const initTiles = (tileImages: HTMLImageElement[]) => {
    let tiles = [];
    tiles[0] = new Tile(tileImages[0], ['AAA', 'AAA', 'AAA', 'AAA']);
    tiles[1] = new Tile(tileImages[1], ['BBB', 'BBB', 'BBB', 'BBB']);
    tiles[2] = new Tile(tileImages[2], ['BBB', 'BCB', 'BBB', 'BBB']);
    tiles[3] = new Tile(tileImages[3], ['BBB', 'BDB', 'BBB', 'BDB']);
    tiles[4] = new Tile(tileImages[4], ['ABB', 'BCB', 'BBA', 'AAA']);
    tiles[5] = new Tile(tileImages[5], ['ABB', 'BBB', 'BBB', 'BBA']);
    tiles[6] = new Tile(tileImages[6], ['BBB', 'BCB', 'BBB', 'BCB']);
    tiles[7] = new Tile(tileImages[7], ['BDB', 'BCB', 'BDB', 'BCB']);
    tiles[8] = new Tile(tileImages[8], ['BDB', 'BBB', 'BCB', 'BBB']);
    tiles[9] = new Tile(tileImages[9], ['BCB', 'BCB', 'BBB', 'BCB']);
    tiles[10] = new Tile(tileImages[10], ['BCB', 'BCB', 'BCB', 'BCB']);
    tiles[11] = new Tile(tileImages[11], ['BCB', 'BCB', 'BBB', 'BBB']);
    tiles[12] = new Tile(tileImages[12], ['BBB', 'BCB', 'BBB', 'BCB']);

    for (let i = 0; i < 12; i++) {
        tiles[i].index = i;
    }

    const initialTileCount = tiles.length;
    for (let i = 0; i < initialTileCount; i++) {
        let tempTiles = [];
        for (let j = 0; j < 4; j++) {
            tempTiles.push(tiles[i].rotate(j));
        }
        tempTiles = removeDuplicatedTiles(tempTiles);
        tiles = tiles.concat(tempTiles);
    }
    console.log(tiles.length);

    // Generate the adjacency rules based on edges
    for (let i = 0; i < tiles.length; i++) {
        const tile = tiles[i];
        tile.analyze(tiles);
    }
};
