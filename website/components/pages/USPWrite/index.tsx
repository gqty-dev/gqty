import Image from 'next/image';
import Link from 'next/link';
import { asset } from '../../../lib/asset';

const USPWrite = () => {
  return (
    <section className="usp usp--write" aria-labelledby="usp-write">
      <div className="usp__media">
        <div className="usp__glow usp__glow--write" aria-hidden="true" />
        <div className="usp__panel">
          <Image
            src={asset('/usp_write_dark.gif')}
            width={600}
            height={105}
            alt="GQty writing data through a mutation"
          />
        </div>
        <Image
          className="usp__hex usp__hex--write"
          src={asset('/Hexagon.svg')}
          alt=""
          width={40}
          height={40}
        />
      </div>

      <div className="usp__body">
        <div>
          <h2 className="title-1" id="usp-write">
            Write
          </h2>
          <p className="text-muted">
            Create, Update, Delete? Call the function - that&rsquo;s it...
            <br />
            Including Optimistic Response!
          </p>
        </div>
        <Link className="usp__link" href="#playground">
          Try this feature →
        </Link>
      </div>
    </section>
  );
};

export default USPWrite;
