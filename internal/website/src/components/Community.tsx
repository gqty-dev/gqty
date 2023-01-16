import { Avatar, Button, Heading, Link, LinkOverlay, Text, Tooltip } from '@chakra-ui/react';
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
    <section className="text-center mt-8 mb-20">
      <Heading>Our Community</Heading>
      <Text>GQty is here because of our amazing community and sponsors!</Text>

      <div className="max-w-screen-lg mx-auto mt-5 text-left py-4 flex justify-center gap-2 flex-wrap">
        {sponsors.map(({ id, name, login, avatarUrl, url, websiteUrl }) => (
          <Link key={id} href={websiteUrl ?? url} target="_blank" className="inline-block text-center">
            <Tooltip label={name ?? login} aria-label={name ?? login}>
              <Avatar src={avatarUrl} name={name} borderColor={isDarkTheme ? 'goldenrod' : 'gold'} borderWidth={3} />
            </Tooltip>
          </Link>
        ))}

        {members.map(({ id, username, avatarUrl }) => (
          <Tooltip key={id} className="inline-block text-center" label={username} aria-label={username}>
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
  );
};

export default Community;
