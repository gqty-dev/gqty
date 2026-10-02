import { useState } from 'react';
import { Volume2 } from 'react-feather';
import { asset } from '../../lib/asset';

const voiceNames = [
  'en-AU-Neural2-A',
  'en-AU-Neural2-B',
  'en-AU-Neural2-C',
  'en-AU-Neural2-D',
  'en-AU-News-E',
  'en-AU-News-F',
  'en-AU-News-G',
  'en-AU-Standard-A',
  'en-AU-Standard-B',
  'en-AU-Standard-C',
  'en-AU-Standard-D',
  'en-AU-Wavenet-A',
  'en-AU-Wavenet-B',
  'en-AU-Wavenet-C',
  'en-AU-Wavenet-D',
  'en-GB-Neural2-A',
  'en-GB-Neural2-B',
  'en-GB-Neural2-C',
  'en-GB-Neural2-D',
  'en-GB-Neural2-F',
  'en-GB-News-G',
  'en-GB-News-H',
  'en-GB-News-I',
  'en-GB-News-J',
  'en-GB-News-K',
  'en-GB-News-L',
  'en-GB-News-M',
  'en-GB-Standard-A',
  'en-GB-Standard-B',
  'en-GB-Standard-C',
  'en-GB-Standard-D',
  'en-GB-Standard-F',
  'en-GB-Wavenet-A',
  'en-GB-Wavenet-B',
  'en-GB-Wavenet-C',
  'en-GB-Wavenet-D',
  'en-GB-Wavenet-F',
  'en-US-Neural2-A',
  'en-US-Neural2-C',
  'en-US-Neural2-D',
  'en-US-Neural2-E',
  'en-US-Neural2-F',
  'en-US-Neural2-G',
  'en-US-Neural2-H',
  'en-US-Neural2-I',
  'en-US-Neural2-J',
  'en-US-News-K',
  'en-US-News-L',
  'en-US-News-M',
  'en-US-News-N',
  'en-US-Standard-A',
  'en-US-Standard-B',
  'en-US-Standard-C',
  'en-US-Standard-D',
  'en-US-Standard-E',
  'en-US-Standard-F',
  'en-US-Standard-G',
  'en-US-Standard-H',
  'en-US-Standard-I',
  'en-US-Standard-J',
  'en-US-Studio-M',
  'en-US-Studio-O',
  'en-US-Wavenet-A',
  'en-US-Wavenet-B',
  'en-US-Wavenet-C',
  'en-US-Wavenet-D',
  'en-US-Wavenet-E',
  'en-US-Wavenet-F',
  'en-US-Wavenet-G',
  'en-US-Wavenet-H',
  'en-US-Wavenet-I',
  'en-US-Wavenet-J',
];

export const PronounciationButton = () => {
  const [voiceName, setVoiceName] = useState<string>();

  return (
    <>
      <button
        className="pronounce"
        type="button"
        aria-label="Play pronunciation"
        onClick={(e) => {
          e.preventDefault();

          const voiceName =
            voiceNames[Math.floor(Math.random() * voiceNames.length)];

          setVoiceName(voiceName);
        }}
      >
        <Volume2 size={16} aria-hidden="true" />
      </button>

      {voiceName ? (
        <audio
          key={voiceName}
          autoPlay
          src={asset(`/pronounciation/${voiceName}.mp3`)}
        >
          <track kind="captions" />
        </audio>
      ) : null}
    </>
  );
};

export default PronounciationButton;
