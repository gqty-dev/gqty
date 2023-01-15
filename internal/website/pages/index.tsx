import { Heading, HStack } from '@chakra-ui/react';
import { ClassNames } from '@emotion/react';
import { handlePushRoute } from '@guild-docs/client';
import { HeroGradient, InfoList } from '@theguild/components';
import { GetServerSideProps, NextPage } from 'next';
import Image from 'next/image';
import GraphQLLogo from '../public/img/graphql.svg';
import ProductionReady from '../public/img/production_ready.png';
import ReactLogo from '../public/img/react.svg';
import TypeScriptLogo from '../public/img/typescript.png';
import Community from '../src/components/Community';
import LiveEditor from '../src/components/LiveEditor';
import { fetchMembers, type MemberLike } from '../src/utils/fetchMembers';
import { fetchSponsors, type SponsorLike } from '../src/utils/fetchSponsors';

type PageProps = {
  members: MemberLike[];
  sponsors: SponsorLike[];
};

const AVATAR_SIZE = 50;

export const getServerSideProps: GetServerSideProps<PageProps> = async ({ res }) => {
  const sponsors = await fetchSponsors('gqty-dev', AVATAR_SIZE);
  const members = await fetchMembers();

  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');

  return {
    props: { members, sponsors },
  };
};

const Index: NextPage<PageProps> = ({ members, sponsors }) => {
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
        {({ css }) => (
          <>
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
                      <Image src={GraphQLLogo} alt="GraphQL" width={50} height={50} />
                      <Heading fontSize="1em">Invisible data fetching</Heading>
                    </HStack>
                  ),
                  description: 'Queries, Mutations and Subscriptions are generated at runtime using ES6 Proxies.',
                  link: {
                    href: '/docs/intro/features#invisible-data-fetching',
                    onClick: (e) => handlePushRoute('/docs/intro/features#invisible-data-fetching', e),
                    title: 'Read more',
                    children: 'Read more',
                  },
                },
                {
                  title: (
                    <HStack>
                      <Image src={TypeScriptLogo} alt="TypeScript" width={50} height={50} />
                      <Heading fontSize="1em">Strongly typed</Heading>
                    </HStack>
                  ),
                  description: 'Built from the ground up to work with Typescript — no more code generation',
                  link: {
                    href: '/docs/intro/features#typescript',
                    onClick: (e) => handlePushRoute('/docs/intro/features#typescript', e),
                    title: 'Read more',
                    children: 'Read more',
                  },
                },
                {
                  title: (
                    <HStack>
                      <Image src={ReactLogo} alt="React" width={50} height={50} />
                      <Heading fontSize="1em">React.js</Heading>
                    </HStack>
                  ),
                  description: 'React Suspense support, hooks, automatic component updates and more.',
                  link: {
                    href: '/docs/react/fetching-data',
                    onClick: (e) => handlePushRoute('/docs/react/fetching-data', e),
                    title: 'Read more',
                    children: 'Read more',
                  },
                },
                {
                  title: (
                    <HStack>
                      <Image src={ProductionReady} alt="Production Ready" width={50} height={50} />
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

            <LiveEditor />

            <Community members={members} sponsors={sponsors} />
          </>
        )}
      </ClassNames>
    </>
  );
};

export default Index;
