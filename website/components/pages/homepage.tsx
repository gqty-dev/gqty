import { type NextPage } from "next";
import { useSSG } from "nextra/ssg";
import { View } from "reshaped/bundle";
import Contributors, { type Props as ContributorsProps } from "../Contributors";
import HeroSection from "../HeroSection";
import Playground from "../Playground";
import Roadmap, { type Props as RoadmapProps } from "../Roadmap";
import USPRead from "./USPRead";
import USPWork from "./USPWrite";

export type Props = Partial<ContributorsProps & RoadmapProps>;

const Homepage: NextPage = () => {
  const { contributors, sponsorship } = useSSG() as Props;

  return (
    <View direction="column" align="center" className="bg-surface-900">
      <View
        direction="column"
        gap={{ xl: 24, l: 24, m: 16, s: 0 }}
        width="100%"
        maxWidth="1270px"
        padding={{ l: [0, 20], s: [0, 4] }}
        align="center"
      >
        <HeroSection />
        <View
          direction="column"
          gap={{ xl: 30, l: 30, m: 16, s: 12 }}
          paddingTop={{ l: 5, m: 5, s: 0 }}
        >
          <USPRead />
          <USPWork />
          {/* <USP
              direction="row"
              title="Read"
              content="Simply read from the query object, and GQty fetches missing data on-the-fly!"
            />
            <USP
              direction="row-reverse"
              title="Write"
              content="You have full control when mutations are sent, with optimistic updates and more!"
            />
            <USP
              direction="row"
              title="Performance optimized"
              content="Normalized cache built-In, which you can also use quite easily for state
            management!"
            /> */}
          <Playground />
          <Contributors contributors={contributors} />
          <Roadmap sponsorship={sponsorship} />
        </View>
      </View>
    </View>
  );
};

export default Homepage;
