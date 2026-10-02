import {
  Image,
  Text,
  View,
  Button,
  ButtonProps,
  Link,
  LinkProps,
  useToast,
  ToastProps,
  Hidden,
  HiddenProps,
} from "reshaped/bundle";
import Copy from "../Icons/Play/Copy";
import Play from "../Icons/Play/Play";
import React from "react";
import CheckPink from "../Icons/Play/CheckPing";

function copyToClipboard(textToCopy: string): void {
  navigator.clipboard
    .writeText(textToCopy)
    .then(() => { })
    .catch((error) => {
      console.error("Failed to copy text: ", error);
    });
}

export default function HeroSection() {
  const npmCommand = "npx @gqty/cli";
  const [color, setColor] = React.useState("inverted");
  const toast = useToast();
  const handleCopyClick = () => {
    copyToClipboard(npmCommand);
    toast.show({
      text: "Copied to clipboard",
      color: "neutral",
      icon: <CheckPink />,
    });
  };

  return (
    <>
      <div className=" flex flex-col relative bg-surface-900 w-full  h-[88vh]  xl:h-2/6 justify-between content-center">
        {/* Headline */}
        <View
          align="center"
          gap={4}
          paddingTop={{ xl: 20, l: 20, m: 12, s: 12 }}
          position="relative"
        >
          {/* Blur */}
          <div className="absolute rounded-full aspect-square top-[-140px] opacity-70 filter blur-3xl overflow-hidden z-0">
            <View width={80} height={40} className="bg-[#DA58B3] "></View>
          </div>

          <Text variant="display-2" align="center">
            The No-GraphQL client
          </Text>
          <Text variant="featured-2" align="center">
            for TypeScript
          </Text>
          <View paddingTop={4} align="center" gap={3}>
            <Hidden hide={{ xl: false, l: false, m: true, s: true }}>
              <View width="200px" maxWidth="240px" paddingTop={4}>
                <Button
                  color="white"
                  rounded
                  size="large"
                  fullWidth={true}
                  href="/getting-started"
                >
                  Get Started
                </Button>
              </View>
            </Hidden>
            <Link
              onClick={handleCopyClick}
              color="inherit"
              variant="plain"
              icon={<Copy />}
            >
              {npmCommand}
            </Link>
          </View>
        </View>
        {/* Desktop image */}
        <Hidden hide={{ xl: false, l: false, m: true, s: true }}>
          <View
            direction="row"
            gap={8}
            paddingTop={{ xl: 32, l: 10 }}
            position="relative"
          >
            <View.Item columns={5}>
              <View>
                <Image src="/before.png" />
              </View>
            </View.Item>
            <View.Item columns={2}>
              <View align="center">
                <Image src="/arrow.svg" />
              </View>
            </View.Item>
            <View.Item columns={5}>
              <View>

                <Image src="/after.png" />
              </View>
            </View.Item>
            <div className="absolute bottom-0 left-0 h-60 w-full bg-gradient-to-t from-surface-900 via-surface-900"></div>
          </View>
        </Hidden>
        {/* Mobile image */}
        <Hidden hide={{ xl: true, l: true, m: false, s: false }}>
          <View
            direction="column"
            position="relative"
            align="center"
            paddingTop={28}
            gap={4}
          >
            {/* Image */}
            <View position="relative">
              <View paddingBottom={24} maxWidth="400px">
                <Image src="/before-after.png" width="588px" />
              </View>
              <div className="absolute bottom-10 left-0 h-40 w-full bg-gradient-to-t from-surface-900 via-surface-900"></div>
              <Hidden hide={{ xl: true, l: true, m: false, s: false }}>
                <div className="flex absolute bottom-10 w-full px-20 pb-12">
                  <Button
                    color="white"
                    fullWidth={true}
                    rounded
                    size="large"
                    href="/getting-started"
                  >
                    Get Started
                  </Button>
                </div>
              </Hidden>
            </View>
          </View>
        </Hidden>
        {/* Mobile CTA */}
      </div>
    </>
  );
}
