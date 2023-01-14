import { Heading, Text } from '@chakra-ui/react';
import { ClassNames } from '@emotion/react';
import { useThemeContext } from '@theguild/components';
import { FunctionComponent } from 'react';

const LiveEditor: FunctionComponent = () => {
  const { isDarkTheme } = useThemeContext();

  return (
    <ClassNames>
      {({ css }) => (
        <>
          <section
            className={css`
              padding: ${isDarkTheme ? '2rem' : '0'} 0 2rem;
              text-align: center;

              @media (max-width: 1024px) {
                display: none;
              }

              > div {
                width: 1024px;
                height: 640px;
                margin: 1rem auto 0;
                padding: 0 1.5rem;

                > iframe {
                  width: 100%;
                  height: 100%;
                  border-radius: 1rem;
                }
              }
            `}
          >
            <Heading>Try it out</Heading>
            <Text>Update the component and see how the query change.</Text>

            <div>
              <iframe src="https://stackblitz.com/edit/nextjs-2jqmx4?embed=1&file=graphql/schema.graphql,src/components/Query.tsx&hideExplorer=1&hideNavigation=1"></iframe>
            </div>
          </section>
        </>
      )}
    </ClassNames>
  );
};

export default LiveEditor;
