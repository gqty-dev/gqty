import { Avatar, Button, Heading, Link, LinkOverlay, Text } from '@chakra-ui/react';
import { ClassNames } from '@emotion/react';
import { useThemeContext } from '@theguild/components';
import { FunctionComponent } from 'react';
import { FaHeart } from 'react-icons/fa';
import { SponsorLike } from '../utils/fetchSponsors';

export type Props = {
  sponsors: SponsorLike[];
};

const Sponsors: FunctionComponent<Props> = ({ sponsors }) => {
  const { isDarkTheme } = useThemeContext();
  return (
    <ClassNames>
      {({ css }) => (
        <section
          className={css`
            text-align: center;
            margin: 2rem 0 5rem;

            > div {
              width: 1024px;
              margin: 1.5rem auto;
              text-align: left;
              padding: 0 1.5rem;

              display: flex;
              gap: 0.5rem;
            }
          `}
        >
          <Heading>Our Community</Heading>
          <Text>GQty is here because of our amazing community and sponsors!</Text>

          <div>
            {sponsors.map(({ id, name, login, avatarUrl, url, websiteUrl }) => (
              <Link
                href={websiteUrl ?? url}
                target="_blank"
                className={css`
                  display: inline-block;
                  text-align: center;
                `}
              >
                <Avatar
                  key={id}
                  src={avatarUrl}
                  name={name}
                  showBorder
                  borderColor={isDarkTheme ? 'lightgray' : 'darkgray'}
                />
                <Text fontSize="xs">{login}</Text>
              </Link>
            ))}
          </div>

          <Button leftIcon={<FaHeart color="red" />} colorScheme="gray" variant="outline" fontWeight="normal">
            <LinkOverlay href="https://github.com/sponsors/gqty-dev" target="_blank">
              Become a Sponsor
            </LinkOverlay>
          </Button>
        </section>
      )}
    </ClassNames>
  );
};

export default Sponsors;
