import React, { useMemo } from 'react';

import {
  Heading,
  ListItem,
  Stack,
  Text,
  UnorderedList,
  Link as ChakraLink,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { WithExamplePage } from '../../../components/Examples/App';
import {
  CodeSandboxEmbed,
  EmbedProps,
} from '../../../components/Examples/Embed';

export default WithExamplePage(function Page() {
  const { query = {} } = useRouter();

  const { file, initialPath } = useMemo<EmbedProps>(() => {
    switch (query.hash) {
      case '#headers': {
        return {
          file: 'src/gqty/index.ts',
          initialPath: '/login',
        };
      }
      case '#currentUser':
        return {
          file: 'src/hooks/currentUser.ts',
          initialPath: '/login',
        };

      case '#register':
        return {
          file: 'src/components/Register.tsx',
          initialPath: '/register',
        };

      case '#login':
      default:
        return {
          file: 'src/components/Login.tsx',
          initialPath: '/login',
        };
    }
  }, [query.hash]);
  return (
    <>
      <Heading as="h1">GraphQL Authentication in React Suspense</Heading>

      <Text>
        In this example you can check some examples of{' '}
        <Link href="/react/mutations">useMutation</Link> inside a authentication
        inside GraphQL Flow.
      </Text>
      <Stack>
        <Heading as="h2" fontSize="1rem">
          Relevant files:
        </Heading>
        <UnorderedList>
          <ListItem>
            Handling of authorization headers in fetch:{' '}
            <Link href="#headers">
              <ChakraLink color="blue.500">src/gqty/index.ts</ChakraLink>
            </Link>
          </ListItem>
          <ListItem>
            Login:{' '}
            <Link href="#login">
              <ChakraLink color="blue.500">src/Components/Login.tsx</ChakraLink>
            </Link>
          </ListItem>
          <ListItem>
            Register:{' '}
            <Link href="#register">
              <ChakraLink color="blue.500">
                src/Components/Register.tsx
              </ChakraLink>
            </Link>
          </ListItem>
          <ListItem>
            Checking if user is authenticated:{' '}
            <Link href="#currentUser">
              <ChakraLink color="blue.500">src/hooks/currentUser.ts</ChakraLink>
            </Link>
          </ListItem>
        </UnorderedList>
      </Stack>
      <CodeSandboxEmbed file={file} initialPath={initialPath} />
    </>
  );
});
