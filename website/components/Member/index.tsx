import { type FunctionComponent } from 'react';

export type Props = {
  name: string;
  image: string;
  link: string;
};

const Member: FunctionComponent<Props> = ({ name, image, link }) => {
  return (
    <a
      className="member"
      href={link}
      target="_blank"
      rel="noreferrer"
      aria-label={name}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- remote avatar URL */}
      <img
        className="member__image"
        src={image}
        alt=""
        width={104}
        height={104}
      />
      <span className="member__label" aria-hidden="true">
        {name}
      </span>
    </a>
  );
};

export default Member;
