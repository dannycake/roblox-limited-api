import superagent from 'superagent';
import superagentProxy from 'superagent-proxy';
superagentProxy(superagent);
import {sleep} from "./globals.js";

let xcsrfToken = 'aabbccdd';

export const getCollectibles = async (cursor = '', data = []) => new Promise(resolve => {
    superagent('GET', 'https://inventory.roblox.com/v1/users/1/assets/collectibles')
        .set('content-type', 'application/json')
        .query({
            sortOrder: 'Asc',
            limit: 100,
            cursor
        })
        .then(resp => {
            if (!resp.body || !resp.body.data || !Array.isArray(resp.body.data))
                return resolve(data);

            const {
                data: newData,
                nextPageCursor
            } = resp.body;

            newData.map(item => data.push({
                id: item.assetId,
                name: item.name.trim(), // Trim whitespace
                rap: item.recentAveragePrice,
            }))

            if (nextPageCursor)
                return getCollectibles(nextPageCursor, data).then(resolve);

            // remove duplicates before returning
            return resolve(
                [...new Set(data)]
            );
        })
        .catch(error => {
            if (!error.response) {
                console.error(error);
                return resolve(data);
            }

            console.error('Failed to fetch inventory', error.response.text);

            if (error.response.status === 429)
                return getCollectibles(cursor, data).then(resolve);
            if (error.response.text.includes('InternalServerError'))
                return getCollectibles(cursor, data).then(resolve);

            resolve(data);
        });
});

export const getCatalogInfo = assets => new Promise(resolve => {
    superagent('POST', 'https://catalog.roblox.com/v1/catalog/items/details')
        .set('content-type', 'application/json')
        .set('x-csrf-token', xcsrfToken)
        .send({
            items: assets.map(asset => ({
                id: asset.id,
                itemType: 'Asset'
            }))
        })
        .then(resp => {
            if (!resp.body || !resp.body.data || !Array.isArray(resp.body.data))
                return resolve({});

            return resolve(resp.body.data);
        })
        .catch(async error => {
            if (!error.response) {
                console.error(error);
                return resolve(null);
            }

            if (error.response.text.includes('Token Validation Failed')) {
                xcsrfToken = error.response.headers['x-csrf-token'];
                return getCatalogInfo(assets).then(resolve);
            }

            console.error('Failed to fetch catalog details', error.response.text);

            if (error.response.status === 429) {
                await sleep(20 * 1000);
                return getCatalogInfo(assets).then(resolve);
            } if (error.response.text.includes('InternalServerError'))
                return getCatalogInfo(assets).then(resolve);

            resolve(null);
        })
});

export const getThumbnails = assets => new Promise(resolve => {
    superagent('GET', `https://thumbnails.roblox.com/v1/assets`)
        .proxy(process.env.PROXY)
        .query({
            assetIds: assets.join(','),
            size: '420x420',
            format: 'Png',
            isCircular: false
        })
        .then(resp => {
            if (!resp.body || !resp.body.data || !Array.isArray(resp.body.data))
                return resolve([]);

            return resolve(resp.body.data);
        })
        .catch(async error => {
            if (!error.response) {
                console.error(error);
                return resolve([]);
            }

            console.error('Failed to fetch thumbnails', error.response.text);

            if (error.response.status === 429)
                return getThumbnails(assets).then(resolve);
            if (error.response.text.includes('InternalServerError'))
                return getThumbnails(assets).then(resolve);

            resolve([]);
        });
});

export const getMarketplaceInfo = assetId => new Promise(resolve => {
    superagent('GET', `https://economy.roblox.com/v2/assets/${assetId}/details`)
        .proxy(process.env.PROXY)
        .then(resp => {
            if (!resp.body || !resp.body.TargetId)
                return resolve(null);
            return resolve(resp.body);
        })
        .catch(error => {
            if (!error.response) {
                console.error(error);
                return resolve(null);
            }

            console.error('Failed to fetch marketplace info', error.response.text);

            if (error.response.status === 429)
                return getMarketplaceInfo(assetId).then(resolve);
            if (error.response.text.includes('InternalServerError'))
                return getMarketplaceInfo(assetId).then(resolve);

            resolve(null);
        })

});

export const getResaleData = assetId => new Promise(resolve => {
    superagent('GET', `https://economy.roblox.com/v1/assets/${assetId}/resale-data`)
        .proxy(process.env.PROXY)
        .then(resp => {
            if (!resp.body || !resp.body.priceDataPoints)
                return resolve(null);
            return resolve(resp.body);
        })
        .catch(error => {
            if (!error.response) {
                console.error(error);
                return resolve(null);
            }

            console.error('Failed to fetch resale data', error.response.text);

            if (error.response.status === 429)
                return getResaleData(assetId).then(resolve);
            if (error.response.text.includes('InternalServerError'))
                return getResaleData(assetId).then(resolve);

            resolve(null);
        })
});
