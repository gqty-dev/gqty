import { LazyPromise } from 'graphql-ez';

import { gql, registerModule } from '../../app';
import { SignToken } from './jwt';

registerModule(
  gql`
    extend type User {
      email: String!
    }
    input LoginInput {
      email: EmailAddress!
    }
    input RegisterInput {
      email: EmailAddress!
    }
    type AuthResult {
      user: User
      error: String
      token: String
    }
    extend type Query {
      "Current authenticated user"
      currentUser: AuthResult!
    }
    extend type Mutation {
      "Login user"
      login(input: LoginInput!): AuthResult!
      "Register user"
      register(input: RegisterInput!): AuthResult!
    }
  `,
  {
    resolvers: {
      Query: {
        async currentUser(_root, _args, { user, prisma }) {
          if (user) {
            return {
              user: prisma.user.findUnique({
                where: {
                  id: user.userId,
                },
              }),
              token: user.token,
            };
          }
          return {};
        },
      },
      Mutation: {
        async login(_root, { input: { email } }, { prisma }) {
          const user = await prisma.user.findUnique({
            where: {
              email,
            },
          });

          return {
            user,
            error: user ? null : 'User not found',
            token: user
              ? LazyPromise(() => SignToken(user.id, user.role))
              : null,
          };
        },
        async register(_root, { input: { email } }, { prisma }) {
          const existingUser = await prisma.user.findUnique({
            where: {
              email,
            },
            select: {
              id: true,
            },
          });

          if (existingUser) {
            return {
              error: 'Email is already registered',
            };
          }

          const user = await prisma.user.create({
            data: {
              email,
            },
          });

          return {
            user,
            token: LazyPromise(() => SignToken(user.id, user.role)),
          };
        },
      },
    },
  }
);
