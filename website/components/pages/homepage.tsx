import { type NextPage } from 'next';
import Contributors from '../Contributors';
import HeroSection from '../HeroSection';
import Playground from '../Playground';
import Roadmap from '../Roadmap';
import USPRead from './USPRead';
import USPWrite from './USPWrite';

/**
 * The homepage is fully static. It previously used `getStaticProps` plus the
 * Nextra `useSSG()` hook to inject GitHub contributor and sponsorship data,
 * which required a personal access token at build time.
 */
const Homepage: NextPage = () => {
  return (
    <main className="shell shell--center">
      <HeroSection />

      <div className="stack stack--xl stack--center">
        <USPRead />
        <USPWrite />
        <Playground />
        <Contributors />
        <Roadmap />
      </div>
    </main>
  );
};

export default Homepage;
