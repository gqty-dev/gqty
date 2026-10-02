import { type GetStaticProps } from "next";
import { resolve, type Organization, type User } from "../../../gqty";
import { type MemberLike } from "../../Member";
import { type Props as HomepageProps } from "../homepage";

export type Props = { ssg: HomepageProps };

export const getStaticProps: GetStaticProps<Props> = async () => {
  const selectAvatarFields = (
    userLike: Organization | User | undefined,
    avatarSize: number
  ): MemberLike => {
    if (userLike === undefined) return;

    return {
      id: userLike.id,
      image: userLike.avatarUrl({ size: avatarSize }),
      name: userLike.name ?? userLike.login,
      link:
        userLike.websiteUrl ??
        (userLike.twitterUsername
          ? `https://twitter.com/${userLike.twitterUsername}`
          : undefined) ??
        userLike.url,
    };
  };

  return {
    props: {
      ssg: {
        contributors: await resolve(({ query }) => {
          return query
            .organization({ login: "gqty-dev" })
            .repositories({ first: 100 })
            .nodes?.flatMap(
              (repo) =>
                repo
                  ?.collaborators({ first: 100 })
                  ?.nodes?.filter((user): user is User => user !== undefined)
                  .map((user) => selectAvatarFields(user, 104)) ?? []
            )
            .reduce(
              (uniq, user) =>
                uniq.some((u) => u.id === user.id) ? uniq : [...uniq, user],
              []
            );
        }),
        sponsorship: await resolve(({ query }) => {
          const { totalCount, totalRecurringMonthlyPriceInCents } = query
            .organization({ login: "gqty-dev" })
            ?.sponsorshipsAsMaintainer();

          return {
            totalCount,
            totalRecurringMonthlyPriceInCents,
          };
        }),
      },
    },
  };
};
