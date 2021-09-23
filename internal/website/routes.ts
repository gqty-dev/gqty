import { IRoutes, GenerateRoutes } from '@guild-docs/server';

export function getRoutes(): IRoutes {
  const Routes: IRoutes = {
    _: {
      docs: {
        $name: 'Docs',
        $routes: ['$intro', 'getting-started', '$react'],
        _: {
          intro: {
            $name: 'Introduction',
            $routes: ['README', 'how-it-works', 'features', 'contributing'],
          },
          react: {
            $name: 'Usage with React',
            $routes: [
              'fetching-data',
              'mutations',
              'subscriptions',
              'config',
              'suspense',
              'ssr',
              'meta',
            ],
          },
          client: {
            $name: 'Core Client',
            $routes: [
              'fetching-data',
              'mutations',
              'subscriptions',
              'config',
              'persistence',
              'helper-functions',
              'upload',
            ],
          },
          cli: {
            $name: 'CLI',
            $routes: ['config', 'codegen', 'javascript', 'programmatic'],
          },
          development: {
            $name: 'Development Tools',
          },
        },
      },
    },
  };
  GenerateRoutes({
    Routes,
    folderPattern: 'docs',
    basePath: 'docs',
    basePathLabel: 'Documentation',
  });

  return Routes;
}
