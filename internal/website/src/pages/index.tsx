import { HeroGradient, InfoList, useThemeContext } from '@theguild/components';

import { Heading, HStack } from '@chakra-ui/react';
import { ClassNames } from '@emotion/react';
import { handlePushRoute } from '@guild-docs/client';
import Image from 'next/image';
import GraphQLLogo from '../../public/img/graphql.svg';
import ProductionReady from '../../public/img/production_ready.png';
import ReactLogo from '../../public/img/react.svg';
import TypeScriptLogo from '../../public/img/typescript.png';

export default function Index() {
  const { isDarkTheme } = useThemeContext();

  return (
    <>
      <HeroGradient
        title="GQty"
        description="Your GraphQL client since day 0."
        link={{
          href: '/docs/getting-started',
          children: 'Get Started',
          title: 'Get started with GQty',
          onClick: (e) => handlePushRoute('/docs/getting-started', e),
        }}
        colors={['#EC4CB7', '#C00B84']}
        wrapperProps={{
          style: {
            paddingBottom: '3rem',
          },
        }}
      />

      <ClassNames>
        {({ css }) => {
          return (
            <>
              <section
                className={css`
                  padding: 2rem 0;
                  text-align: center;

                  > div {
                    width: 1024px;
                    height: 640px;
                    margin: 1rem auto 0;
                    padding: 0 1.5rem;

                    > iframe {
                      width: 100%;
                      height: 100%;
                      border-radius: 1rem;
                    }
                  }
                `}
              >
                <Heading>Try it out</Heading>
                <p>Update the component and see how the query change.</p>

                <div>
                  <iframe
                    src={`https://stackblitz.com/edit/nextjs-2jqmx4?embed=1&file=graphql/schema.graphql,src/components/Query.tsx&hideExplorer=1&hideNavigation=1&theme=${
                      isDarkTheme ? 'dark' : 'light'
                    }`}
                  ></iframe>
                </div>
              </section>

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
                        <Image src={GraphQLLogo} width="50px" height="50px" />
                        <Heading fontSize="1em">
                          Invisible data fetching
                        </Heading>
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
                          src={TypeScriptLogo}
                          width="50px"
                          height="50px"
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
                        <Image src={ReactLogo} width="50px" height="50px" />
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
                          src={ProductionReady}
                          width="50px"
                          height="50px"
                        />
                        <Heading fontSize="1em">Production ready</Heading>
                      </HStack>
                    ),
                    description:
                      'Fully-featured with inbuilt normalized cache, server side rendering, subscriptions and more.',
                    link: {
                      href: '/docs/intro/features',
                      onClick: (e) =>
                        handlePushRoute('/docs/intro/features', e),
                      title: 'Read more',
                      children: 'Read more',
                    },
                  },
                ]}
              />
            </>
          );
        }}
      </ClassNames>
    </>
  );
}
