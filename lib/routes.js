import * as db from './db.js';
import FastifyCaching from "@fastify/caching";

/**
 * @param {FastifyInstance} fastify
 * @param {Object} _options
 * @param {Function} done
 */
export default function (fastify, _options, done) {
    fastify.register(FastifyCaching, {
        privacy: 'no-cache',
        expiresIn: 60 * 1000,
    })

    fastify.get('/', async (request, reply) => {
        return {github: 'https://github.com/mxmmxx/roblox-limited-api'}
    })

    fastify.get('/api/items/:itemId', async (request, reply) => {
        const itemId = request.params.itemId;
        if (!itemId || isNaN(Number(itemId))) return reply.code(400).send({
            statusCode: 400,
            error: 'Invalid Request',
            message: 'Invalid item id provided'
        })

        await fastify.cache.get(itemId, async (error, result) => {
            if (error) return reply.send(error);
            if (result) return reply.send(result.item);

            const item = await db.Item.findOne({
                where: { id: Number(itemId) }
            });

            if (!item) return reply.code(400).send({
                statusCode: 400,
                error: 'Invalid Request',
                message: 'Invalid item id provided'
            })

            const itemJSON = item.toJSON();

            fastify.cache.set(item.id.toString(), itemJSON, 60 * 1000, error => {
                if (error) return reply.send(error);
                return reply.send(itemJSON);
            })
        })
    })

    fastify.get('/api/itemdetails', async (request, reply) => {
        // log remote address and user agent of request
        request.log.info(`ua: ${request.headers['user-agent'] || 'none'} - ip: ${request.headers['x-real-ip'] || request.ip}`);
        
        await fastify.cache.get('items', async (error, result) => {
            if (error) return reply.send(error);
            if (result) return reply.send(result.item);

            const items = await db.getItems();
            const formattedItems = items
                .map(item => item.toJSON())
                .reduce((acc, item) => {
                    acc[item.id] = {
                        id: item.id,
                        name: item.name,
                        rap: item.rap || item.resaleData?.recentAveragePrice || 0,
                        value: item.value || null,
                        lowestPrice: item.details?.lowestPrice || null,
                        productId: item.details?.productId || null,
                        demandScore: item.resaleData?.demandScore,
                        thumbnailUrl: item.thumbnail || null,
                        originalPrice: item.resaleData?.originalPrice || null,
                        updateDate: item.marketplace?.Updated
                            ? new Date(item.marketplace.Updated).getTime()
                            : Date.now(),
                    };
                    return {...acc};
                }, {});

            fastify.cache.set('items', formattedItems, 60 * 1000, error => {
                if (error) return reply.send(error);
                return reply.send(formattedItems);
            })
        });
    });

    done();
}
