import { type FunctionComponent } from 'react';
import Button from '~/components/tailwindui/Button';
import { useQuery, type Query } from '~/gqty';

export type Props = {
  onBackflow?: (query: Query) => void;
};

const ChildComponent: FunctionComponent<Props> = ({ onBackflow }) => {
  const query = useQuery();

  return (
    <>
      <h1 className="text-xl">Child</h1>
      <p>
        The name is{' '}
        {query.character({ id: '3' })?.name?.concat('.') ??
          'the Primeagent! No, just kidding...'}
      </p>

      <Button
        onClick={() => {
          console.debug('a');
          onBackflow?.(query);
        }}
      >
        Backflow
      </Button>
    </>
  );
};

export default ChildComponent;
