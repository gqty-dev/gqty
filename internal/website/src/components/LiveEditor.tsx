import { Heading, Text } from '@chakra-ui/react';
import { useThemeContext } from '@theguild/components';
import { FunctionComponent } from 'react';

const LiveEditor: FunctionComponent = () => {
  const { isDarkTheme } = useThemeContext();

  return (
    <section className={`text-center ${isDarkTheme ? `py-5` : `py-0`} px-5 hidden md:block`}>
      <Heading>Try it out</Heading>
      <Text>Update the component and see how the query change.</Text>

      <div className="max-w-screen-lg w-full h-[640px] mx-auto mt-2">
        <iframe
          className="w-full h-full rounded bg-[#282b2e]"
          src="https://stackblitz.com/edit/nextjs-2jqmx4?embed=1&file=graphql/schema.graphql,src/components/Query.tsx&hideExplorer=1&hideNavigation=1"
        ></iframe>
      </div>
    </section>
  );
};

export default LiveEditor;
