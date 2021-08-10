import assert from 'assert';

import { gql, registerModule } from '../app';

registerModule(
  gql`
    enum UserRole {
      USER
      ADMIN
    }
    type User {
      id: ID!
      name: String
      role: UserRole!
    }
    extend type Mutation {
      setName(name: String!): User!
    }
  `,
  {
    resolvers: {
      Mutation: {
        async setName(_root, { name }, { prisma, user }) {
          assert(user, 'You are not authenticated!');
          name = name.trim();
          assert(
            name.length >= 3,
            'Name is too short, it has to be at least 3 characters'
          );

          return await prisma.user.update({
            data: {
              name,
            },
            where: {
              id: user.userId,
            },
          });
        },
      },
    },
  }
);
