import Fastify from 'fastify';
import ms from 'ms';
import { buildApp } from './graphql';

const app = Fastify({
  logger: true,
  pluginTimeout: ms('60 seconds'),
});

app.register(buildApp().fastifyPlugin);

console.log('> Vue example API server started. http://localhost:4142/altair');

app.listen(4142, 'localhost', (err) => {
  if (err) throw err;
});
