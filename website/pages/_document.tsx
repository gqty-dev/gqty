import { Head, Html, Main, NextScript } from 'next/document';

/**
 * Nextra renders Markdown links through `next/link`, which prefixes the
 * configured `basePath` itself, so nothing here needs to rewrite hrefs. This
 * document only pins the language and the document shell.
 */
export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
