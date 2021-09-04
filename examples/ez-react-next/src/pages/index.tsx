import { useQuery } from '../gqty';

export default function Index() {
  const { hello } = useQuery();
  return hello || '...';
}
