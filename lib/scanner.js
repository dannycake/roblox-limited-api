import * as roblox from './roblox.js';
import db from './db.js';

const getDatabaseCollectibles = async () => await db.get('items') || {};
const updateKnownCollectibles = async () => {
    const collectibles = await roblox.getCollectibles();
    const previousCollectibles = await getDatabaseCollectibles();

    for (const collectible of collectibles) {
        const id = collectible.id;

        if (!previousCollectibles[id]) {
            console.log(`Found unscanned collectible "${collectible.name}" (${id})`);
            await db.set(`items.${id}`, collectible);
        } else {
            if (previousCollectibles[id].rap !== collectible.rap)
                await db.set(`items.${collectible.id}`, collectible);
        }
    }
};
const updateCollectibleGeneralDetails = async () => {
    const collectibles = Object.values(
        await getDatabaseCollectibles()
    ).sort(a => a.details ? 1 : -1);
    const chunks = [];

    while (collectibles.length > 0)
        chunks.push(collectibles.splice(0, 120));

    for (const chunk of chunks) {
        const details = await roblox.getCatalogInfo(chunk);

        for (const item of details)
            await db.set(`items.${item.id}.details`, item);
    }

    console.log('Finished updating collectible details');
};
const updateCollectibleThumbnails = async () => {
    const collectibles = Object.values(
        await getDatabaseCollectibles()
    ).sort(a => a.thumbnail ? 1 : -1);
    const chunks = [];

    while (collectibles.length > 0)
        chunks.push(collectibles.splice(0, 50));

    for (const chunk of chunks) {
        const thumbnails = await roblox.getThumbnails(chunk.map(item => item.id));

        for (const item of thumbnails)
            await db.set(`items.${item.targetId}.thumbnail`, item.imageUrl);
    }

    console.log('Finished updating collectible thumbnails');
};

const infiniteFunc = async func => {
    for (;;)
        await func();
}

const startScanner = async () => {
    console.log('Starting collectible scanner');

    [
        updateKnownCollectibles,
        updateCollectibleGeneralDetails,
        updateCollectibleThumbnails,
    ].map(infiniteFunc);
};

startScanner();