import withTwindApp from "@twind/next/shim/app";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import App from "next/app";
import { Reshaped } from "reshaped/bundle";
import twindConfig from "../tailwind.config.js";

import "../themes/global.css";

export default withTwindApp(
  twindConfig,
  class MyApp extends App {
    render() {
      const { Component, pageProps } = this.props;
      return (
        <Reshaped theme="gqty" defaultColorMode="dark">
          <Component {...pageProps} />
          <Analytics />
          <SpeedInsights />
        </Reshaped>
      );
    }
  },
);
