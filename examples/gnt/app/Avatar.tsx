import { Character, Maybe } from '@/gqty';
import NextImage from 'next/image';
import { type FunctionComponent } from 'react';
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
      <NextImage
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
