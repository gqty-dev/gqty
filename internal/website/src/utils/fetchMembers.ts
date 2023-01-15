import { Client, GatewayIntentBits } from 'discord.js';
import { ensureVariables } from '../env';

export type MemberLike = {
  id: string;
  avatarUrl?: string;
  username: string;
};

/**
 * Fetch discord members.
 */
export const fetchMembers = async () => {
  const { DISCORD_BOT_TOKEN, DISCORD_GUILD_ID } = ensureVariables('DISCORD_BOT_TOKEN', 'DISCORD_GUILD_ID');

  const discordClient = new Client({
    intents: [GatewayIntentBits.GuildMembers],
  });

  await discordClient.login(DISCORD_BOT_TOKEN);

  const guild = await discordClient.guilds.fetch({ guild: DISCORD_GUILD_ID });

  const members = await guild.members.fetch({ limit: 1000 });

  return members.reduce<MemberLike[]>((prev, member) => {
    if (member.user) {
      const memberStub: MemberLike = {
        id: member.user.id,
        username: member.user.username,
      };

      const avatarUrl = member.user.avatarURL({ extension: 'png', size: 64 });
      if (avatarUrl) {
        memberStub.avatarUrl = avatarUrl;
      }

      prev.push(memberStub);
    }
    return prev;
  }, []);
};

export default fetchMembers;
