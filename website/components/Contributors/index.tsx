import { type NextPage } from "next";
import { Text, View } from "reshaped/bundle";
import Member, { type MemberLike } from "../Member";

export type Props = {
  contributors: Array<MemberLike>;
};

const Contributors: NextPage<Props> = ({ contributors, ...props }) => {
  return (
    <View gap={12}>
      <View align="center" justify="start">
        <Text
          variant="display-3"
          align="center"
          as="h2"
          attributes={{ id: "contributors" }}
        >
          Contributors
        </Text>
      </View>

      <View direction="column" gap={4} align="center">
        <View direction="column" align="center">
          <View
            direction="row"
            align="center"
            justify="center"
            gap={{ xl: 5, l: 5, m: 3, s: 2 }}
          >
            {contributors.map((contributor) => (
              <Member
                key={contributor.id}
                image={contributor.image}
                name={contributor.name}
                link={contributor.link}
              />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

export default Contributors;
