import { For, createSignal, type Component } from 'solid-js';
import Avatar from '~/components/tailwindui/Avatar';
import Button from '~/components/tailwindui/Button';
import Card from '~/components/tailwindui/Card';
import SmallText from '~/components/tailwindui/SmallText';
import Text from '~/components/tailwindui/Text';
import { createQuery } from '~/gqty';

const CharacterSearch: Component = () => {
  const [searchValue, setSearchValue] = createSignal<string>();

  const { schema } = createQuery({
    // cachePolicy: 'no-cache',
  });

  return (
    <>
      <SearchBox
        onChange={(v) => {
          setSearchValue(v);
        }}
      />

      <For
        each={
          schema().query.characters(
            searchValue() ? { filter: { name: searchValue() } } : undefined
          )?.results
        }
      >
        {(item) => (
          <Card class="mb-3">
            <Avatar character={item} />

            <div class="flex-1 dark:text-white">
              <Text>
                {item?.id ?? 0}. {item?.name}
              </Text>
              <SmallText>{item?.species}</SmallText>
              <SmallText>{item?.origin?.name}</SmallText>
            </div>
          </Card>
        )}
      </For>
    </>
  );
};

const SearchBox: Component<{
  onChange?: (value: string) => void;
}> = ({ onChange }) => {
  const [inputName, setInputName] = createSignal('');

  return (
    <div class="flex gap-3 items-center mb-3">
      <input
        type="text"
        value={inputName()}
        onChange={(e) => setInputName(e.target.value)}
        class="border border-gray-300 rounded-md px-3 py-2 w-full text-black"
      />
      <Button size="lg" onClick={() => onChange?.(inputName())}>
        Search
      </Button>
    </div>
  );
};

export default CharacterSearch;
