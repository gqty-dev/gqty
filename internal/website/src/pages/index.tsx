import { HeroGradient, InfoList } from '@theguild/components';

import { Heading, HStack } from '@chakra-ui/react';
import { ClassNames } from '@emotion/react';
import { handlePushRoute } from '@guild-docs/client';
import Image from 'next/image';
import GraphQLLogo from '../../public/img/graphql.svg';
import ProductionReady from '../../public/img/production_ready.png';
import ReactLogo from '../../public/img/react.svg';
import TypeScriptLogo from '../../public/img/typescript.png';

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

      <ClassNames>
        {({ css }) => {
          return (
            <InfoList
              containerProps={{
                className: css`
                  > div {
                    align-items: center;
                    justify-content: center;
                  }
                `,
              }}
              items={[
                {
                  title: (
                    <HStack>
                      <Image
                        alt="GraphQL Logo"
                        src={GraphQLLogo}
                        width={50}
                        height={50}
                      />
                      <Heading fontSize="1em">Invisible data fetching</Heading>
                    </HStack>
                  ),
                  description:
                    'Queries, Mutations and Subscriptions are generated at runtime using ES6 Proxies.',
                  link: {
                    href: '/docs/intro/features#invisible-data-fetching',
                    onClick: (e) =>
                      handlePushRoute(
                        '/docs/intro/features#invisible-data-fetching',
                        e
                      ),
                    title: 'Read more',
                    children: 'Read more',
                  },
                },
                {
                  title: (
                    <HStack>
                      <Image
                        alt="TypeScript Logo"
                        src={TypeScriptLogo}
                        width={50}
                        height={50}
                      />
                      <Heading fontSize="1em">Strongly typed</Heading>
                    </HStack>
                  ),
                  description:
                    'Built from the ground up to work with Typescript — no more code generation',
                  link: {
                    href: '/docs/intro/features#typescript',
                    onClick: (e) =>
                      handlePushRoute('/docs/intro/features#typescript', e),
                    title: 'Read more',
                    children: 'Read more',
                  },
                },
                {
                  title: (
                    <HStack>
                      <Image
                        alt="React Logo"
                        src={ReactLogo}
                        width={50}
                        height={50}
                      />
                      <Heading fontSize="1em">React.js</Heading>
                    </HStack>
                  ),
                  description:
                    'React Suspense support, hooks, automatic component updates and more.',
                  link: {
                    href: '/docs/react/fetching-data',
                    onClick: (e) =>
                      handlePushRoute('/docs/react/fetching-data', e),
                    title: 'Read more',
                    children: 'Read more',
                  },
                },
                {
                  title: (
                    <HStack>
                      <Image
                        alt="Icon of Production Ready"
                        src={ProductionReady}
                        width={50}
                        height={50}
                      />
                      <Heading fontSize="1em">Production ready</Heading>
                    </HStack>
                  ),
                  description:
                    'Fully-featured with inbuilt normalized cache, server side rendering, subscriptions and more.',
                  link: {
                    href: '/docs/intro/features',
                    onClick: (e) => handlePushRoute('/docs/intro/features', e),
                    title: 'Read more',
                    children: 'Read more',
                  },
                },
              ]}
            />
          );
        }}
      </ClassNames>
    </>
  );
}
