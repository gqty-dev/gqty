import { Heading, Link as ChakraLink, Text } from '@chakra-ui/react';
import Link from 'next/link';

import { WithExamplePage } from '../../../src/components/Examples/App';
import { CodeSandboxEmbed } from '../../../src/components/Examples/Embed';

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
