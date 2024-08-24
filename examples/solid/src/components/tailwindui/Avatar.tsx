import type { Component, ParentProps } from 'solid-js';
import type { Character, Maybe } from '~/gqty';
import Skeleton from './Skeleton';

const avatarStyle = `inline-block rounded-full mr-3`;

const Avatar: Component<ParentProps<{ character?: Maybe<Character> }>> = ({
  character,
}) => (
  <Skeleton
    fallback={
      <div
        class={`${avatarStyle} animate-pulse bg-gray-400`}
        style={{ width: '50px', height: '50px' }}
      ></div>
    }
  >
    {character?.image && (
      <img
        class={avatarStyle}
        alt={`Image of ${character.name}`}
        src={character.image}
        width={50}
        height={50}
      />
    )}
  </Skeleton>
);

export default Avatar;
