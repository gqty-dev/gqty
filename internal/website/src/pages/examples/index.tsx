import { FaCircle, FaReact } from 'react-icons/fa';

import { Heading, Stack, Text, Link as ChakraLink } from '@chakra-ui/react';
import Link from 'next/link';

import { WithExamplePage } from '../../components/Examples/App';
import { NavLink } from '../../components/Examples/NavLink';

export default WithExamplePage(function Page() {
  return (
    <Stack maxW="75ch">
      <Heading as="h1">API</Heading>
      <Text>
        All the examples made here are around a playground API specially made to
        showcase usual usage of GraphQL APIs in <b>gqty</b>.
      </Text>
      <Text>
        You can also check it{' '}
        <Link href="http://examples-api.gqty.dev" passHref>
          <ChakraLink color="blue.500">http://examples-api.gqty.dev</ChakraLink>
        </Link>{' '}
        and play with it, since it also offers a playground using{' '}
        <Link href="https://altair.sirmuel.design/" passHref>
          <ChakraLink color="blue.500">Altair GraphQL Client</ChakraLink>
        </Link>{' '}
        and an interactive visualization of the schema using{' '}
        <Link href="https://github.com/APIs-guru/graphql-voyager" passHref>
          <ChakraLink color="blue.500">GraphQL Voyager</ChakraLink>
        </Link>
        .
      </Text>
      <Text>Feel free to suggest new specific features to offer in it.</Text>
      <Heading as="h2">Online Editor and Visualization</Heading>
      <Text>
        These examples are made using{' '}
        <Link href="https://codesandbox.io/" passHref>
          <ChakraLink color="blue.500">
            <b>CodeSandbox</b>
          </ChakraLink>
        </Link>
        , which allows you to modify the examples and play with gqty{' '}
        <b>without installing anything</b>.
      </Text>
      <Heading as="h2">Examples</Heading>
      <Text>
        We are planning to add more examples about all the different expected
        usages of <b>gqty</b>.
      </Text>
      <Text>
        And we encourage you to open a new{' '}
        <Link href="https://github.com/PabloSzx/gqty/issues" passHref>
          <ChakraLink color="blue.500">GitHub issue</ChakraLink>
        </Link>{' '}
        to request some examples about specific issues you might have, and you
        will also be helping everyone.
      </Text>
      <br />
      <Text>For now, you can check some examples about:</Text>

      <Heading as="h3" fontSize="1.3em" display="flex" alignItems="center">
        <FaCircle fontSize="0.8rem" />{' '}
        <Text as="span" marginLeft="0.4rem">
          gqty in React Suspense
        </Text>
      </Heading>

      <Stack isInline spacing="1">
        <NavLink
          label="React Suspense Query"
          href="/examples/suspense/query"
          icon={FaReact}
        />
        <NavLink
          label="React Suspense Authentication"
          href="/examples/suspense/auth"
          icon={FaReact}
        />
      </Stack>
    </Stack>
  );
});
