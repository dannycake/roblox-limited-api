import * as roblox from './roblox.js';
import * as db from './db.js';
import * as rolimons from "./rolimons.js";
import {sleep} from "./globals.js";

const updateKnownCollectibles = async () => {
    const collectibles = await roblox.getCollectibles();

    await db.Item.bulkCreate([...collectibles], {
        updateOnDuplicate: ['name', 'rap'],
    })
};
const updateCollectibleGeneralDetails = async () => {
    const collectibles = (await db.getItems())
        .sort(a => a.details ? 1 : -1);
    const chunks = [];

    while (collectibles.length > 0)
        chunks.push(collectibles.splice(0, 120));

    for (const chunk of chunks) {
        const details = await roblox.getCatalogInfo(chunk);

        for (const itemDetails of details) {
            const item = chunk
                .filter(item => item.id === itemDetails.id)[0];

            if (JSON.stringify(item.details) !== JSON.stringify(itemDetails))
                await item.update({
                    details: itemDetails
                })
        }
    }

    console.log('Finished updating collectible details');
};
const updateCollectibleThumbnails = async () => {
    const collectibles = (await db.getItems())
        .sort(a => a.thumbnail ? 1 : -1);
    const chunks = [];

    while (collectibles.length > 0)
        chunks.push(collectibles.splice(0, 50));

    for (const chunk of chunks) {
        const thumbnails = await roblox.getThumbnails(chunk.map(item => item.id));

        for (const itemDetails of thumbnails) {
            await chunk
                .filter(item => item.id === itemDetails.targetId)[0]
                .update({
                    thumbnail: itemDetails.imageUrl
                })
        }
    }

    console.log('Finished updating collectible thumbnails');
};
const updateResaleData = async () => {
    const collectibles = (await db.getItems() || [])
        .sort(a => a.resaleData ? 1 : -1);

    const promises = [];

    for (const collectible of collectibles) {
        promises.push((async () => {
            const resaleData = await roblox.getResaleData(collectible.id);
            if (!resaleData) return;

            let calcDemandScore = 0;
            for (const volumeHistory of resaleData.volumeDataPoints) {
                const sales = volumeHistory.value;
                const date = new Date(volumeHistory.date);

                // calculate demand score based off previous 30 days
                if (date.getTime() + (1000 * 60 * 60 * 24 * 30) > Date.now())
                    calcDemandScore += sales;
            }

            resaleData.demandScore = Math.round((calcDemandScore / 30) * 100) / 100;

            if (JSON.stringify(collectible.resaleData) !== JSON.stringify(resaleData))
                await collectible.update({
                    resaleData
                })
        })())
        await sleep(100);
    }

    await Promise.all(promises);
    console.log('Finished updating resale data')
};

const updateItemValues = async () => {
    const items = await rolimons.refreshRolimonsDetails();
    if (!items) return;

    const entries = Object.entries(items)
        .map(itemData => {
            const [key, value] = itemData;

            return {
                id: Number(key),
                value: value[3] === -1 ? null : value[3]
            }
        })

    await db.Item.bulkCreate(entries, {
        updateOnDuplicate: ['value'],
    })

    await sleep(60 * 1000);
}

const infiniteFunc = async func => {
    for (; ;) {
        await func();
        await sleep(5 * 1000);
    }
}

const startScanner = async () => {
    console.log('Starting collectible scanner');

    [
        updateItemValues,
        updateKnownCollectibles,
        updateCollectibleGeneralDetails,
        updateCollectibleThumbnails,
        updateResaleData
    ].map(infiniteFunc);
};

startScanner();