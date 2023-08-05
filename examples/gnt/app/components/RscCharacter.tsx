import { resolve, type Query } from '~/gqty';

/** RSC */
export default async function RscCharacter({
  id,
}: Parameters<Query['character']>[0]) {
  const data = await resolve(({ query }) => {
    return query.character({ id })?.name;
  });

  return <>{JSON.stringify(data, null, 2)}</>;
}
