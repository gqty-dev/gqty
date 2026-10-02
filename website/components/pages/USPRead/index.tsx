import Image from 'next/image';
import Link from 'next/link';
import { asset } from '../../../lib/asset';

const USPRead = () => {
  return (
    <section className="usp" aria-labelledby="usp-read">
      <div className="usp__body">
        <div>
          <h2 className="title-1" id="usp-read">
            Read
          </h2>
          <p className="text-muted">
            Fetch data by writing simple type-based orientated code, and GQty
            creates the GraphQL query on the fly.
          </p>
        </div>
        <Link className="usp__link" href="#playground">
          Try this feature →
        </Link>
      </div>

      <div className="usp__media">
        <div className="usp__glow usp__glow--read" aria-hidden="true" />
        <div className="usp__panel">
          <Image
            src={asset('/usp_read_dark.gif')}
            width={600}
            height={105}
            alt="GQty reading data from the cache"
          />
        </div>
        <Image
          className="usp__hex usp__hex--read"
          src={asset('/Hexagon.svg')}
          alt=""
          width={30}
          height={30}
        />
        <Image
          className="usp__hex usp__hex--wide"
          src={asset('/Hexagon.svg')}
          alt=""
          width={150}
          height={150}
        />
      </div>
    </section>
  );
};

export default USPRead;
