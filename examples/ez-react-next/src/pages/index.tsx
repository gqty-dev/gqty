import { useQuery, useRefetch } from '../gqty';

export default function Index() {
  const refetch = useRefetch();
  const { hello, user } = useQuery();
  return (
    <div>
      <p>{hello || '...'}</p>
      <p>{user.id}</p>
      <div>
        {user.users.map((v) => (
          <p key={v.id}>{v.id}</p>
        ))}
      </div>
      <button
        onClick={() => {
          refetch(user);
        }}
      >
        Refetch
      </button>
    </div>
  );
}
