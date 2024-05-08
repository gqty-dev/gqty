import { Suspense, createResource, type Component } from 'solid-js';
import { resolve } from '~/gqty';
import Avatar from './tailwindui/Avatar';
import Card from './tailwindui/Card';
import SmallText from './tailwindui/SmallText';
import Text from './tailwindui/Text';

const Character: Component<{ id: string }> = ({ id }) => {
  const [data] = createResource(() =>
    resolve(({ query }) => {
      const character = query.character({ id });

      ({ ...character, origin: { ...character?.origin } });

      return character;
    })
  );

  return (
    <Card>
      <img
        class="inline-block rounded-full mr-3"
        alt={`Image of ${data()?.name}`}
        src={data()?.image!}
        width={50}
        height={50}
      />

      <div class="flex-1 dark:text-white">
        {data()?.name}
        <p class="text-xs text-gray-500 dark:text-gray-400">
          {data()?.species}
        </p>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          {data()?.origin?.name}
        </p>
      </div>
    </Card>
  );
};

const CharacterWithSuspense: Component<{ id: string }> = ({ id }) => {
  return (
    <Suspense
      fallback={
        <Card>
          <Avatar character={null} />

          <div class="flex-1 dark:text-white">
            <Text></Text>
            <SmallText></SmallText>
            <SmallText></SmallText>
          </div>
        </Card>
      }
    >
      <Character id={id} />
    </Suspense>
  );
};

export default CharacterWithSuspense;
