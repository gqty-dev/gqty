import { Head, Html, Main, NextScript } from 'next/document';

/**
 * `basePath` in `next.config.mjs` prefixes Next's own assets but not
 * hand-authored or Markdown-generated links. In the static export, one extra
 * class plus one CSS variable lets the stylesheet inject the prefix instead of
 * rewriting every author-supplied href. Both values come from build-time
 * environment variables.
 */
const staticBasePath = process.env.NEXTRA_STATIC_EXPORT
  ? (process.env.NEXT_PUBLIC_BASE_PATH ?? '')
  : '';

export default function Document() {
  return (
    <Html
      lang="en"
      className={staticBasePath ? 'static-base-path' : undefined}
      style={
        staticBasePath
          ? ({
              '--static-base-path': `"${staticBasePath}"`,
            } as React.CSSProperties)
          : undefined
      }
    >
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
