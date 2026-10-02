import nextra from "nextra";
import { remarkMermaid } from "remark-mermaid-nextra";

/**
 * @type {import("nextra").NextraConfig}
 */
const nextraConfig = {
  latex: true,
  mdxOptions: {
    remarkPlugins: [remarkMermaid],
  },
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.tsx",
};

const withNextra = nextra(nextraConfig);

export default withNextra();
