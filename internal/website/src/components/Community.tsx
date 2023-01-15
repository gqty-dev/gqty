import { Avatar, Button, Heading, Link, LinkOverlay, Text, Tooltip } from '@chakra-ui/react';
import { ClassNames } from '@emotion/react';
import { useThemeContext } from '@theguild/components';
import { FunctionComponent } from 'react';
import { FaHeart } from 'react-icons/fa';
import { MemberLike } from '../utils/fetchMembers';
import { SponsorLike } from '../utils/fetchSponsors';

export type Props = {
  members: MemberLike[];
  sponsors: SponsorLike[];
};

const Community: FunctionComponent<Props> = ({ members, sponsors }) => {
  const { isDarkTheme } = useThemeContext();
  return (
    <ClassNames>
      {({ css }) => (
        <section
          className={css`
            text-align: center;
            margin: 2rem 0 5rem;
          `}
        >
          <Heading>Our Community</Heading>
          <Text>GQty is here because of our amazing community and sponsors!</Text>

          <div
            className={css`
              width: 1024px;
              margin: 1.5rem auto;
              text-align: left;
              padding: 0 1.5rem;

              display: flex;
              gap: 0.5rem;
              flex-wrap: wrap;
            `}
          >
            {sponsors.map(({ id, name, login, avatarUrl, url, websiteUrl }) => (
              <Link
                key={id}
                href={websiteUrl ?? url}
                target="_blank"
                className={css`
                  display: inline-block;
                  text-align: center;
                `}
              >
                <Tooltip label={name ?? login} aria-label={name ?? login}>
                  <Avatar
                    src={avatarUrl}
                    name={name}
                    borderColor={isDarkTheme ? 'goldenrod' : 'gold'}
                    borderWidth={3}
                  />
                </Tooltip>
              </Link>
            ))}

            {members.map(({ id, username, avatarUrl }) => (
              <Tooltip
                key={id}
                className={css`
                  display: inline-block;
                  text-align: center;
                `}
                label={username}
                aria-label={username}
              >
                <Avatar name={username} src={avatarUrl} />
              </Tooltip>
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

export default Community;
