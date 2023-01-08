import {
  Box,
  BoxProps,
  chakra,
  extendTheme,
  theme as chakraTheme,
  useColorModeValue,
} from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';
import { ClassNames } from '@emotion/react';
import {
  AppSeoProps,
  CombinedThemeProvider,
  DocsPage,
  ExtendComponents,
  handlePushRoute,
} from '@guild-docs/client';
import { Subheader, useThemeContext } from '@theguild/components';
import { appWithTranslation } from 'next-i18next';
import type { AppProps } from 'next/app';
import Router from 'next/router';
import { BsBook, BsMoonFill, BsSun } from 'react-icons/bs';
import { FaBookOpen, FaDiscord, FaGithub, FaHome } from 'react-icons/fa';
import '../../public/style.css';

const BaseAnchor = chakra('a', {
  baseStyle: {
    color: '#2f77c9',
    _hover: {
      textDecoration: 'underline',
    },
  },
});

const a: typeof BaseAnchor = (props) => {
  const localHref =
    typeof props.href === 'string' && !props.href.startsWith('http')
      ? props.href
      : undefined;

  return (
    <BaseAnchor
      {...props}
      href={localHref || props.href}
      onClick={
        localHref &&
        ((ev) => {
          ev.preventDefault();
          Router.push(localHref);
        })
      }
      onMouseOver={
        localHref &&
        (() => {
          Router.prefetch(localHref);
        })
      }
    />
  );
};

const blockquote = (props: BoxProps) => {
  const bgColor = useColorModeValue('pink.500', 'pink.700');

  return (
    <Box
      borderLeft="5px solid #f380fd"
      padding="0.8em"
      borderRadius="5px"
      mt={4}
      width="full"
      bg={bgColor}
      variant="left-accent"
      status="info"
      css={{
        '> *:first-of-type': {
          marginTop: 0,
        },
      }}
      {...props}
    />
  );
};
export const table = (props: BoxProps) => (
  <Box as="table" textAlign="left" mt="32px" width="full" {...props} />
);

export const th = (props: BoxProps) => {
  const bg = useColorModeValue('gray.50', 'whiteAlpha.100');

  return (
    <Box
      as="th"
      bg={bg}
      minW="148px"
      fontWeight="semibold"
      p={2}
      fontSize="sm"
      {...props}
    />
  );
};

export const td = (props: BoxProps) => (
  <Box
    as="td"
    p={2}
    borderTopWidth="1px"
    borderColor="inherit"
    fontSize="sm"
    {...props}
  />
);

ExtendComponents({
  HelloWorld() {
    return <p>Hello World!</p>;
  },
  Box,
  a,
  blockquote,
  table,
  th,
  td,
});

const styles: (typeof chakraTheme)['styles'] = {
  global: (props) => ({
    body: {
      bg: mode('white', 'gray.850')(props),
    },
  }),
};

const theme = extendTheme({
  colors: {
    gray: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      850: '#1b1b1b',
      900: '#171717',
    },
  },
  fonts: {
    heading: 'TGCFont, sans-serif',
    body: 'TGCFont, sans-serif',
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  styles,
});

const accentColor = '#C00B84';

const serializedMdx = process.env.SERIALIZED_MDX_ROUTES;
const mdxRoutes = { data: serializedMdx && JSON.parse(serializedMdx) };

function AppContent(appProps: AppProps) {
  const { Component, pageProps, router } = appProps;
  const isDocs = router.asPath.startsWith('/docs');
  const { setDarkTheme, isDarkTheme } = useThemeContext();

  return (
    <>
      <ClassNames>
        {({ css }) => {
          return (
            <>
              <Subheader
                activeLink={router.asPath}
                logoProps={{
                  className: css({
                    img: {
                      width: '6rem !important',
                    },
                  }),
                }}
                product={{
                  title: '',
                  description: '',
                  image: {
                    src: '/logo/logo.svg',
                    alt: 'Docs',
                  },
                  onClick: (e) => handlePushRoute('/', e),
                }}
                links={[
                  {
                    children: <FaHome size={20} />,
                    title: 'GQty Home',
                    href: '/',
                    onClick: (e) => handlePushRoute('/', e),
                  },
                  {
                    children: isDarkTheme ? (
                      <BsBook size={20} />
                    ) : (
                      <FaBookOpen size={20} />
                    ),
                    title: 'Read the docs',
                    href: '/docs',
                    onClick: (e) => handlePushRoute('/docs/intro', e),
                  },
                  {
                    children: <FaGithub size={20} />,
                    href: 'https://github.com/gqty-dev/gqty',
                    target: '_blank',
                    rel: 'noopener norefereer',
                    title: "Head to the project's GitHub",
                  },
                  {
                    children: <FaDiscord size={24} />,
                    href: 'https://discord.gg/YNux4cde',
                    target: '_blank',
                    rel: 'noopener norefereer',
                    title: 'Join our Discord server',
                  },
                  {
                    children:
                      setDarkTheme &&
                      (isDarkTheme ? (
                        <BsMoonFill
                          size={18}
                          className={css`
                            cursor: pointer;
                          `}
                        />
                      ) : (
                        <BsSun
                          size={18}
                          className={css`
                            cursor: pointer;
                          `}
                        />
                      )),
                    href: null as any,
                    onClick: () => setDarkTheme?.((dark) => !dark),
                    title: isDarkTheme
                      ? 'Switch to light theme'
                      : 'Switch to dark mode',
                  },
                ]}
                cta={{
                  children: 'Get Started',
                  title: 'Start using GQty',
                  href: '/docs/getting-started',
                  onClick: (e) => handlePushRoute('/docs/getting-started', e),
                  target: '_blank',
                  rel: 'noopener noreferrer',
                }}
              />
            </>
          );
        }}
      </ClassNames>
      {isDocs ? (
        <DocsPage
          appProps={appProps}
          accentColor={accentColor}
          mdxRoutes={mdxRoutes}
          mdxNavigationProps={{
            defaultOpenDepth: 2,
            wrapperProps({ depth }) {
              return depth === 0
                ? {
                    height: 'calc(100vh - 240px)',
                    overflowY: 'auto',
                  }
                : {};
            },
            summaryLabelProps() {
              return {
                textTransform: 'none',
              };
            },
          }}
        />
      ) : (
        <Component {...pageProps} />
      )}
    </>
  );
}

const defaultSeo: AppSeoProps = {
  title: 'GQty',
  description: 'Your GraphQL client since day 0.',
  logo: {
    url: 'https://gqty.dev/logo.png',
    width: 50,
    height: 54,
  },
};

export default appWithTranslation(function App(appProps) {
  return (
    <CombinedThemeProvider
      theme={theme}
      accentColor={accentColor}
      defaultSeo={defaultSeo}
    >
      <AppContent {...appProps} />
    </CombinedThemeProvider>
  );
});
