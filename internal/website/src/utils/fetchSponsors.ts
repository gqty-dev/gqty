import { ensureVariables } from '../env';
import { query, resolved } from '../gqty';

export type SponsorLike = {
  avatarUrl?: string;
  id: string;
  login: string;
  name?: string;
  url?: string;
  websiteUrl?: string;
};

export const fetchSponsors = async (organization: string, avatarSize = 100) => {
  const { GITHUB_PAT } = ensureVariables('GITHUB_PAT');

  const sponsors: SponsorLike[] = [];
  let lastSponsorId: string | undefined;
  let totalCount = 0;

  do {
    const response = await resolved(
      () => {
        const sponsorsConnection = query
          .organization({ login: organization })
          ?.sponsors({ first: 100, after: lastSponsorId });

        sponsorsConnection?.totalCount;
        sponsorsConnection?.nodes?.flatMap((sponsorLike) => {
          const org = sponsorLike?.$on.Organization;
          const usr = sponsorLike?.$on.User;

          return [
            org?.avatarUrl({ size: avatarSize }),
            org?.id,
            org?.login,
            org?.name,
            org?.url,
            org?.websiteUrl,
            usr?.avatarUrl({ size: avatarSize }),
            usr?.id,
            usr?.login,
            usr?.name,
            usr?.url,
            usr?.websiteUrl,
          ];
        });

        return sponsorsConnection;
      },
      {
        fetchOptions: {
          headers: {
            Authorization: `Bearer ${GITHUB_PAT}`,
            'Content-Type': 'application/json',
          },
        },
      },
    );

    totalCount = response?.totalCount ?? 0;

    for (const sponsor of response?.nodes ?? []) {
      const sponsorUnion = sponsor?.$on.User ?? sponsor?.$on.Organization;
      if (!sponsorUnion || !sponsorUnion.id || !sponsorUnion.login) continue;

      const sponsorLike: SponsorLike = {
        id: sponsorUnion.id,
        avatarUrl: sponsorUnion.avatarUrl({ size: avatarSize }),
        login: sponsorUnion.login,
        url: sponsorUnion.url,
      };

      if (sponsorUnion.name) {
        sponsorLike.name = sponsorUnion.name;
      }

      let websiteUrl = sponsorUnion.websiteUrl;
      if (websiteUrl) {
        if (!websiteUrl.startsWith('http')) {
          websiteUrl = `http://${websiteUrl}`;
        }

        sponsorLike.websiteUrl = websiteUrl;
      }

      sponsors.push(sponsorLike);

      lastSponsorId = sponsorUnion.id;
    }
  } while (sponsors.length < totalCount);

  return sponsors;
};
