import Link from 'next/link';
import { asset } from '../../lib/asset';
import Image from 'next/image';
import React from 'react';
import Copy from '../Icons/Play/Copy';
import CheckPink from '../Icons/Play/CheckPing';
import { COPY_FEEDBACK_MS, copyFeedbackReducer } from './copy-feedback.mjs';

export default function HeroSection() {
  const npmCommand = 'npx @gqty/cli';
  const [feedback, dispatch] = React.useReducer(copyFeedbackReducer, {
    status: 'idle',
  });

  React.useEffect(() => {
    if (feedback.status === 'idle') return;

    // Clearing the message is what lets a repeated copy announce again: an
    // unchanged live-region string is not re-announced.
    const timer = setTimeout(
      () => dispatch({ type: 'reset' }),
      COPY_FEEDBACK_MS
    );
    return () => clearTimeout(timer);
  }, [feedback.status]);

  const handleCopyClick = () => {
    navigator.clipboard
      .writeText(npmCommand)
      .then(() => dispatch({ type: 'copy-settled', ok: true }))
      .catch(() => dispatch({ type: 'copy-settled', ok: false }));
  };

  return (
    <section className="hero" aria-label="Introduction">
      <div className="hero__headline">
        <div className="hero__glow" aria-hidden="true" />

        <h1 className="display-2">The No-GraphQL client</h1>
        <p className="display-2">for TypeScript</p>

        <div className="hero__actions">
          <Link
            className="button button--primary hero__cta"
            href="/getting-started"
          >
            Get Started
          </Link>
          <button
            type="button"
            className="hero__copy"
            onClick={handleCopyClick}
            aria-label={`Copy command: ${npmCommand}`}
          >
            {npmCommand}
            <Copy aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Desktop image */}
      <div className="hero__figure hero__figure--desktop">
        <Image
          src={asset('/before.png')}
          width={440}
          height={300}
          alt="Before GQty"
        />
        <Image src={asset('/arrow.svg')} width={120} height={40} alt="" />
        <Image
          src={asset('/after.png')}
          width={440}
          height={300}
          alt="After GQty"
        />
      </div>

      {/* Mobile image */}
      <div className="hero__figure hero__figure--mobile">
        <Image
          src={asset('/before-after.png')}
          width={588}
          height={400}
          alt="Before and after using GQty"
        />
      </div>

      <div className="sr-status" role="status" aria-live="polite">
        {feedback.status === 'copied' ? (
          <span className="toast__bubble">
            <CheckPink aria-hidden="true" />
            Copied to clipboard
          </span>
        ) : null}
        {feedback.status === 'failed' ? (
          <span className="toast__bubble">
            Couldn&rsquo;t copy &mdash; select the command manually
          </span>
        ) : null}
      </div>
    </section>
  );
}
