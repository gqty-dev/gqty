import React from 'react';

import { Heading, Text, Link as ChakraLink } from '@chakra-ui/react';
import Link from 'next/link';

import { WithExamplePage } from '../../../components/Examples/App';
import { CodeSandboxEmbed } from '../../../components/Examples/Embed';

export default WithExamplePage(function Page() {
  return (
    <>
      <Heading>GraphQL Queries in React Suspense</Heading>
      <Text>
        In this example you can see some usage examples of{' '}
        <Link href="/react/fetching-data#usequery">
          <ChakraLink color="blue.500">useQuery</ChakraLink>
        </Link>{' '}
        and{' '}
        <Link href="/react/fetching-data#graphql-hoc">
          <ChakraLink color="blue.500">graphql HOC</ChakraLink>
        </Link>
        .
      </Text>
      <CodeSandboxEmbed file="src/components/Hello.tsx" initialPath="/" />
    </>
  );
});
