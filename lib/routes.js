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
        return {hello: 'world'}
    })

    fastify.get('/items', async (request, reply) => {
        await fastify.cache.get('items', async (error, result) => {
            if (error) return reply.send(error);
            if (result) return reply.send(result);

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