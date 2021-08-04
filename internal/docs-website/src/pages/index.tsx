import { HeroGradient, InfoList } from '@theguild/components';

import { handlePushRoute } from '@guild-docs/client';

export default function Index() {
  return (
    <>
      <HeroGradient
        title="GQty"
        description="a GraphQL client built for rapid iteration."
        link={{
          href: '/docs/getting-started',
          children: 'Get Started',
          title: 'Get started with GQty',
          onClick: (e) => handlePushRoute('/docs/getting-started', e),
        }}
        colors={['#EC4CB7', '#C00B84']}
      />

      <InfoList
        title="First steps"
        items={[
          {
            title: 'Install',
            description:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Egestas euismod amet duis quisque semper.',
          },
          {
            title: 'Configure',
            description:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Egestas euismod amet duis quisque semper.',
          },
          {
            title: 'Enjoy',
            description:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Egestas euismod amet duis quisque semper.',
          },
        ]}
      />
    </>
  );
}
