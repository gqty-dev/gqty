import Level3 from './Level3';
import { useQuery } from './gqty';

const Level2 = ({ id }: { id: string }) => {
  const node = useQuery().node({ id });
  if (!node?.mimeId) return null;

  return <Level3 id={id} />;
};

export default Level2;
