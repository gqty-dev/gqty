import { type FunctionComponent } from 'react';
import { Character, Maybe } from '../gqty';
import Skeleton from './Skeleton';

const avatarStyle = `inline-block rounded-full mr-3`;

const Avatar: FunctionComponent<{ character?: Maybe<Character> }> = ({
  character,
}) => (
  <Skeleton
    fallback={
      <div
        className={`${avatarStyle} animate-pulse bg-gray-400`}
        style={{ width: 50, height: 50 }}
      ></div>
    }
  >
    {character?.image && (
      <img
        className={avatarStyle}
        alt={`Image of ${character.name}`}
        src={character.image}
        width={50}
        height={50}
      />
    )}
  </Skeleton>
);

export default Avatar;
