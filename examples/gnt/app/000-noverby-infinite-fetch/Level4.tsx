import { useQuery } from './gqty';

const Level4 = ({ id }: { id: string }) => {
  const query = useQuery().node({ id });
  query?.id;
  return null;
};

export default Level4;
