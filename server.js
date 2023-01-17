import Fastify from 'fastify';
import routes from './lib/routes.js';

import {Worker} from 'node:worker_threads';

const fastify = new Fastify({
    logger: true
});

fastify.register(routes);

const listen = async () => {
    try {
        await fastify.listen({
            host: '0.0.0.0',
            port: 8080,
        })
    } catch (err) {
        fastify.log.error(err)
        process.exit();
    }
}

new Worker('./lib/scanner.js');

listen();