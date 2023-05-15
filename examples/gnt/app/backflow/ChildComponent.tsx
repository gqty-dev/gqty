import { type FunctionComponent } from 'react';
import Button from '~/components/tailwindui/Button';
import { useQuery, type Query } from '~/gqty';

export type Props = {
  onBackflow?: (query: Query) => void;
};

const ChildComponent: FunctionComponent<Props> = ({ onBackflow }) => {
  const query = useQuery();

  return (
    <div className="border rounded-xl p-2 m-2">
      <h1 className="text-xl">Child</h1>

      <p className="mb-2">
        The name is{' '}
        {query.character({ id: '1' })?.name?.concat('.') ??
          'the Primeagent! No, just kidding...'}
      </p>

      <Button
        size="sm"
        onClick={() => {
          console.debug('a');
          onBackflow?.(query);
        }}
      >
        Send query upwards
      </Button>
    </div>
  );
};

export default ChildComponent;
