import {
  HStack,
  Icon,
  Link,
  LinkProps,
  Text,
  useColorModeValue as mode,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';

interface NavLinkProps extends LinkProps {
  label: string;
  icon?: any;
}

export const NavLink = (props: NavLinkProps) => {
  const { icon, label, href, ...rest } = props;
  const { pathname } = useRouter();

  const isActive = pathname === href;

  return (
    <NextLink href={href!} passHref>
      <Link
        display="block"
        py="2"
        px="3"
        borderRadius="md"
        transition="unset"
        fontSize="sm"
        userSelect="none"
        textDecor="none !important"
        href={href}
        to={href}
        aria-current={isActive ? 'page' : undefined}
        color={mode('gray.700', 'gray.400')}
        _hover={{
          bg: mode('gray.100', 'gray.700'),
          color: mode('gray.900', 'white'),
        }}
        _activeLink={{
          bg: mode('gray.200', 'gray.700'),
          color: 'inherit',
        }}
        {...rest}
      >
        <HStack spacing="4">
          <Icon as={icon} fontSize="lg" opacity={0.64} />
          <Text fontWeight={isActive ? 'medium' : undefined} as="span">
            {label}
          </Text>
        </HStack>
      </Link>
    </NextLink>
  );
};
