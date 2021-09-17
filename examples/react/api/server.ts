import Fastify from 'fastify';
import ms from 'ms';
import FastifyNext from 'fastify-nextjs';
import { resolve } from 'path';

import { buildApp } from './graphql';

const app = Fastify({
  logger: true,
  pluginTimeout: ms('60 seconds'),
});

app.register(buildApp().fastifyPlugin);

console.log('> React example API server started.');

app
  .register(FastifyNext, {
    logLevel: 'error',
    dir: resolve(__dirname, '../'),
  })
  .then(() => {
    if (!app.next) {
      console.error('Next.js could not be registered');
      process.exit(1);
    }
    try {
      app.next('/*');
    } catch (err) {
      console.error(err);
    }
  });

app.listen(4141, '0.0.0.0', (err) => {
  if (err) throw err;
});
