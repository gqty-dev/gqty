import assert from 'assert';

import { gql, registerModule } from '../app';
import { toInteger } from '../utils/casters';

import type { CursorConnectionArgs, CursorPageInfo } from '../ez.generated';
async function ResolveCursorConnection<T extends { id: number | string }>(
  input: CursorConnectionArgs,
  cb: (connectionArgs: {
    take: number;
    skip: number | undefined;
    cursor:
      | {
          id: number;
        }
      | undefined;
  }) => Promise<T[]>
) {
  const {
    after,
    first,

    before,
    last,
  } = input;

  if (first == null && last == null) {
    throw Error("You have to specify either 'last' or 'first'");
  } else if (before && last == null) {
    throw Error("If you use 'before', you have to specify 'last'");
  } else if (after && first == null) {
    throw Error("If you use 'after', you have to specify 'first'");
  }

  let forwardPagination: boolean;

  let take: number;

  if (before) {
    forwardPagination = false;
    take = last!;
  } else if (after) {
    forwardPagination = true;
    take = first!;
  } else if (first != null) {
    forwardPagination = true;
    take = first;
  } else {
    forwardPagination = false;
    take = last!;
  }

  const originalLength = take++;

  assert(originalLength <= 50, 'You can only take up to 50 nodes');

  let hasExtraNode = false;

  let nodes: T[];

  if (forwardPagination) {
    nodes = await cb({
      take,
      skip: after ? 1 : undefined,
      cursor: after
        ? {
            id: toInteger(after),
          }
        : undefined,
    });
  } else {
    nodes = await cb({
      take: -take,
      skip: before ? 1 : undefined,
      cursor: before
        ? {
            id: toInteger(before),
          }
        : undefined,
    });
  }

  if (nodes.length > originalLength) {
    hasExtraNode = forwardPagination ? !!nodes.pop() : !!nodes.shift();
  }

  const hasNextPage = forwardPagination ? hasExtraNode : !!before;
  const hasPreviousPage = forwardPagination ? !!after : hasExtraNode;

  const pageInfo: CursorPageInfo = {
    startCursor: nodes[0]?.id.toString(),
    endCursor: nodes[nodes.length - 1]?.id.toString(),
    hasNextPage,
    hasPreviousPage,
  };

  return {
    nodes,
    pageInfo,
  };
}

registerModule(
  gql`
    type Category {
      id: ID!
      name: String
      posts(input: CursorConnectionArgs!): PostsConnection!
    }
    type Post {
      id: ID!
      createdAt: DateTime!
      published: Boolean!
      title: String!
      category: [Category!]
    }
    input PostCreate {
      title: NonEmptyString!
      category: [String!]
    }
    input PostUpdate {
      id: String!
      title: NonEmptyString
      category: [String!]
      published: Boolean
    }
    type PostsConnection {
      nodes: [Post!]!
      pageInfo: CursorPageInfo!
    }
    extend type User {
      "Posts created by user"
      posts(input: CursorConnectionArgs!): PostsConnection!
    }

    extend type Query {
      "Get all published posts"
      publicPosts(input: CursorConnectionArgs!): PostsConnection!
      "Get all current created categories"
      postsCategories: [Category!]!
    }
    extend type Mutation {
      "[Authenticated] Create new post"
      createPost(post: PostCreate!): Post!
      "[Authenticated] Update existing post"
      updatePost(post: PostUpdate!): Post!
      "[Authenticated] Remove own post"
      removeOwnPost(postId: String!): Boolean!
    }
  `,
  {
    resolvers: {
      Query: {
        async publicPosts(_root, { input }, { prisma }) {
          return ResolveCursorConnection(input, (connection) => {
            return prisma.post.findMany({
              ...connection,
              where: {
                published: {
                  equals: true,
                },
              },
              orderBy: {
                id: 'desc',
              },
            });
          });
        },
      },
      Mutation: {
        async removeOwnPost(_root, { postId }, { prisma, user }) {
          assert(user, 'You have to be authenticated');

          const post = await prisma.post.findUnique({
            where: {
              id: ~~postId,
            },
            include: {
              User: true,
            },
          });

          if (post?.User.id === user.userId) {
            const removed = await prisma.post.delete({
              where: {
                id: ~~postId,
              },
              select: {
                id: true,
              },
            });

            return removed.id === ~~postId;
          }

          return false;
        },
        async updatePost(_root, { post }, { user, prisma }) {
          assert(user, 'You have to be authenticated!');

          const { count } = await prisma.post.updateMany({
            data: {
              title: post.title ? post.title : undefined,
              published: post.published != null ? post.published : undefined,
            },
            where: {
              id: toInteger(post.id),
              User: {
                id: user.userId,
              },
            },
          });

          assert(count === 1, 'Post could not be found');

          if (post.category) {
            return await prisma.post.update({
              where: {
                id: toInteger(post.id),
              },
              data: {
                Category: {
                  connectOrCreate: post.category.map((name) => {
                    return {
                      create: {
                        name,
                      },
                      where: {
                        name,
                      },
                    };
                  }),
                },
              },
            });
          }
          return prisma.post.findUnique({
            where: {
              id: toInteger(post.id),
            },
            rejectOnNotFound: true,
          });
        },
        createPost(_root, { post }, { user, prisma }) {
          assert(user, 'You have to be authenticated!');

          return prisma.post.create({
            data: {
              title: post.title,
              User: {
                connect: {
                  id: user.userId,
                },
              },
              Category: post.category
                ? {
                    connectOrCreate: post.category.map((name) => {
                      return {
                        create: {
                          name,
                        },
                        where: {
                          name,
                        },
                      };
                    }),
                  }
                : undefined,
            },
          });
        },
      },
      Post: {
        category(root, _args, { prisma }) {
          return prisma.post
            .findUnique({
              where: {
                id: root.id,
              },
            })
            .Category();
        },
      },
      User: {
        posts(root, { input }, { prisma }) {
          return ResolveCursorConnection(input, (connection) => {
            return prisma.user
              .findUnique({
                where: {
                  id: root.id,
                },
              })
              .Post({
                ...connection,
                orderBy: {
                  id: 'desc',
                },
              });
          });
        },
      },
      Category: {
        posts(root, { input }, { prisma }) {
          return ResolveCursorConnection(input, (connection) => {
            return prisma.category
              .findUnique({
                where: {
                  id: root.id,
                },
              })
              .Post({
                ...connection,
                orderBy: {
                  id: 'desc',
                },
              });
          });
        },
      },
    },
  }
);
