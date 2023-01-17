import db from './db.js';

/**
 * @param {FastifyInstance} fastify
 * @param {Object} _options
 * @param {Function} done
 */
export default function(fastify, _options, done) {
    fastify.get('/', async (request, reply) => {
        return { hello: 'world' }
    })

    fastify.get('/items', async (request, reply) => {
        const items = await db.get('items') || {};

        return Object.values(items).reduce((acc, item) => {
            acc[item.id] = {
                id: item.id,
                name: item.name,
                rap: item.rap || 0,
                thumbnail: item.thumbnail || null,
                productId: item.details?.productId || null,
                originalPrice: item.details?.price || null,
                lowestPrice: item.details?.lowestPrice || null,
            };
            return {...acc};
        }, {});
    });

    done();
}