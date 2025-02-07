import { For, Suspense, createSignal, type Component } from 'solid-js';
import Avatar from '~/components/tailwindui/Avatar';
import Button from '~/components/tailwindui/Button';
import Card from '~/components/tailwindui/Card';
import SmallText from '~/components/tailwindui/SmallText';
import Text from '~/components/tailwindui/Text';
import { createQuery } from '~/gqty';

const CharacterSearch: Component = () => {
  const [searchValue, setSearchValue] = createSignal<string>();

  const query = createQuery();

  return (
    <>
      <SearchBox
        onChange={(v) => {
          setSearchValue(v);
        }}
      />

      <Suspense
        fallback={<Card class="p-3 bg-white">Suspence loading...</Card>}
      >
        <For
          each={
            query().characters(
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
      </Suspense>
    </>
  );
};

const SearchBox: Component<{
  onChange?: (value: string) => void;
}> = ({ onChange }) => {
  const [inputName, setInputName] = createSignal('');

  return (
    <form
      class="flex gap-3 items-center mb-3"
      onSubmit={(e) => {
        e.preventDefault();
        onChange?.(inputName());
      }}
    >
      <input
        autofocus
        type="text"
        value={inputName()}
        onChange={(e) => setInputName(e.target.value)}
        class="border border-gray-300 rounded-md px-3 py-2 w-full text-black bg-white"
      />
      <Button type="submit" size="lg">
        Search
      </Button>
    </form>
  );
};

export default CharacterSearch;
