import { useQuery } from '../gqty';

export default function Index() {
  const { page } = useQuery();
  return (
    <p>
      {JSON.stringify(
        page().pageBuilder.modules.map((v) => {
          v.__typename;
          v.$on.A?.foo?.bar;
        })
      )}
    </p>
  );
}
