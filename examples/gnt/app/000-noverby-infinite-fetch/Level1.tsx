import { order_by, useQuery } from './gqty';

const DrawerElement = ({
  id,
  path,
  fullpath,
  index,
}: {
  id: string;
  path: string[];
  fullpath: string[];
  index: number;
}) => {
  useQuery().node({ id })?.id;
  const slicedPath = fullpath.slice(0, path.length);

  const selected =
    path.length === slicedPath.length &&
    path.every((v, i) => v === slicedPath[i]);

  // console.log(`DrawerElement ${id}`);

  return selected ? (
    <DrawerList
      key={id}
      id={id}
      path={path}
      fullpath={fullpath}
      index={index}
    />
  ) : null;
};

const DrawerList = ({
  id,
  path,
  fullpath,
  index,
}: {
  id: string;
  path: string[];
  fullpath: string[];
  index: number;
}) => {
  const query = useQuery().node({ id });

  const children = query?.children({
    order_by: [{ index: order_by.asc }],
  });

  // console.log(`DrawerList ${id}`);

  return (
    <>
      {children?.map(
        ({ id, key }) =>
          id && (
            <DrawerElement
              key={id ?? 0}
              id={id}
              path={path.concat([key!])}
              fullpath={fullpath}
              index={index + 1}
            />
          )
      )}
    </>
  );
};

export default DrawerList;
