/**
 * GQTY AUTO-GENERATED CODE: PLEASE DO NOT MODIFY MANUALLY
 */

export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export interface Scalars {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** Integers that will have a value of 0 or more. */
  NonNegativeInt: any;
  /** A string that cannot be passed as an empty value */
  NonEmptyString: any;
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  DateTime: string;
  /** A field whose value conforms to the standard internet email address format as specified in RFC822: https://www.w3.org/Protocols/rfc822/. */
  EmailAddress: any;
}

export interface LoginInput {
  email: Scalars['EmailAddress'];
}

export interface RegisterInput {
  email: Scalars['EmailAddress'];
}

export interface PostCreate {
  title: Scalars['NonEmptyString'];
  category?: Maybe<Array<Scalars['String']>>;
}

export interface PostUpdate {
  id: Scalars['String'];
  title?: Maybe<Scalars['NonEmptyString']>;
  category?: Maybe<Array<Scalars['String']>>;
  published?: Maybe<Scalars['Boolean']>;
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface CursorConnectionArgs {
  first?: Maybe<Scalars['NonNegativeInt']>;
  after?: Maybe<Scalars['NonEmptyString']>;
  last?: Maybe<Scalars['NonNegativeInt']>;
  before?: Maybe<Scalars['NonEmptyString']>;
}

export const scalarsEnumsHash: import('gqty').ScalarsEnumsHash = {
  NonNegativeInt: true,
  NonEmptyString: true,
  DateTime: true,
  EmailAddress: true,
  String: true,
  ID: true,
  Boolean: true,
  UserRole: true,
  Int: true,
};
export const generatedSchema = {
  query: {
    __typename: { __type: 'String!' },
    hello: { __type: 'String!' },
    namesList: { __type: '[String!]!', __args: { n: 'Int' } },
    currentUser: { __type: 'AuthResult!' },
    publicPosts: {
      __type: 'PostsConnection!',
      __args: { input: 'CursorConnectionArgs!' },
    },
    postsCategories: { __type: '[Category!]!' },
  },
  mutation: {
    __typename: { __type: 'String!' },
    hello: { __type: 'String!' },
    login: { __type: 'AuthResult!', __args: { input: 'LoginInput!' } },
    register: { __type: 'AuthResult!', __args: { input: 'RegisterInput!' } },
    createPost: { __type: 'Post!', __args: { post: 'PostCreate!' } },
    updatePost: { __type: 'Post!', __args: { post: 'PostUpdate!' } },
    removeOwnPost: { __type: 'Boolean!', __args: { postId: 'String!' } },
    setName: { __type: 'User!', __args: { name: 'String!' } },
  },
  subscription: {},
  LoginInput: { email: { __type: 'EmailAddress!' } },
  RegisterInput: { email: { __type: 'EmailAddress!' } },
  AuthResult: {
    __typename: { __type: 'String!' },
    user: { __type: 'User' },
    error: { __type: 'String' },
    token: { __type: 'String' },
  },
  Category: {
    __typename: { __type: 'String!' },
    id: { __type: 'ID!' },
    name: { __type: 'String' },
    posts: {
      __type: 'PostsConnection!',
      __args: { input: 'CursorConnectionArgs!' },
    },
  },
  Post: {
    __typename: { __type: 'String!' },
    id: { __type: 'ID!' },
    createdAt: { __type: 'DateTime!' },
    published: { __type: 'Boolean!' },
    title: { __type: 'String!' },
    category: { __type: '[Category!]' },
  },
  PostCreate: {
    title: { __type: 'NonEmptyString!' },
    category: { __type: '[String!]' },
  },
  PostUpdate: {
    id: { __type: 'String!' },
    title: { __type: 'NonEmptyString' },
    category: { __type: '[String!]' },
    published: { __type: 'Boolean' },
  },
  PostsConnection: {
    __typename: { __type: 'String!' },
    nodes: { __type: '[Post!]!' },
    pageInfo: { __type: 'CursorPageInfo!' },
  },
  User: {
    __typename: { __type: 'String!' },
    id: { __type: 'ID!' },
    name: { __type: 'String' },
    role: { __type: 'UserRole!' },
    email: { __type: 'String!' },
    posts: {
      __type: 'PostsConnection!',
      __args: { input: 'CursorConnectionArgs!' },
    },
  },
  CursorConnectionArgs: {
    first: { __type: 'NonNegativeInt' },
    after: { __type: 'NonEmptyString' },
    last: { __type: 'NonNegativeInt' },
    before: { __type: 'NonEmptyString' },
  },
  CursorPageInfo: {
    __typename: { __type: 'String!' },
    hasNextPage: { __type: 'Boolean!' },
    hasPreviousPage: { __type: 'Boolean!' },
    startCursor: { __type: 'NonEmptyString' },
    endCursor: { __type: 'NonEmptyString' },
  },
} as const;

export interface Query {
  __typename: 'Query' | undefined;
  hello: ScalarsEnums['String'];
  namesList: (args?: {
    /**
     * @defaultValue `10`
     */
    n?: Maybe<Scalars['Int']>;
  }) => Array<ScalarsEnums['String']>;
  /**
   * Current authenticated user
   */
  currentUser: AuthResult;
  /**
   * Get all published posts
   */
  publicPosts: (args: { input: CursorConnectionArgs }) => PostsConnection;
  /**
   * Get all current created categories
   */
  postsCategories: Array<Category>;
}

export interface Mutation {
  __typename: 'Mutation' | undefined;
  hello: ScalarsEnums['String'];
  /**
   * Login user
   */
  login: (args: { input: LoginInput }) => AuthResult;
  /**
   * Register user
   */
  register: (args: { input: RegisterInput }) => AuthResult;
  /**
   * [Authenticated] Create new post
   */
  createPost: (args: { post: PostCreate }) => Post;
  /**
   * [Authenticated] Update existing post
   */
  updatePost: (args: { post: PostUpdate }) => Post;
  /**
   * [Authenticated] Remove own post
   */
  removeOwnPost: (args: {
    postId: Scalars['String'];
  }) => ScalarsEnums['Boolean'];
  setName: (args: { name: Scalars['String'] }) => User;
}

export interface Subscription {
  __typename: 'Subscription' | undefined;
}

export interface AuthResult {
  __typename: 'AuthResult' | undefined;
  user?: Maybe<User>;
  error?: Maybe<ScalarsEnums['String']>;
  token?: Maybe<ScalarsEnums['String']>;
}

export interface Category {
  __typename: 'Category' | undefined;
  id: ScalarsEnums['ID'];
  name?: Maybe<ScalarsEnums['String']>;
  posts: (args: { input: CursorConnectionArgs }) => PostsConnection;
}

export interface Post {
  __typename: 'Post' | undefined;
  id: ScalarsEnums['ID'];
  createdAt: ScalarsEnums['DateTime'];
  published: ScalarsEnums['Boolean'];
  title: ScalarsEnums['String'];
  category?: Maybe<Array<Category>>;
}

export interface PostsConnection {
  __typename: 'PostsConnection' | undefined;
  nodes: Array<Post>;
  pageInfo: CursorPageInfo;
}

export interface User {
  __typename: 'User' | undefined;
  id: ScalarsEnums['ID'];
  name?: Maybe<ScalarsEnums['String']>;
  role: ScalarsEnums['UserRole'];
  email: ScalarsEnums['String'];
  /**
   * Posts created by user
   */
  posts: (args: { input: CursorConnectionArgs }) => PostsConnection;
}

export interface CursorPageInfo {
  __typename: 'CursorPageInfo' | undefined;
  hasNextPage: ScalarsEnums['Boolean'];
  hasPreviousPage: ScalarsEnums['Boolean'];
  startCursor?: Maybe<ScalarsEnums['NonEmptyString']>;
  endCursor?: Maybe<ScalarsEnums['NonEmptyString']>;
}

export interface SchemaObjectTypes {
  Query: Query;
  Mutation: Mutation;
  Subscription: Subscription;
  AuthResult: AuthResult;
  Category: Category;
  Post: Post;
  PostsConnection: PostsConnection;
  User: User;
  CursorPageInfo: CursorPageInfo;
}
export type SchemaObjectTypesNames =
  | 'Query'
  | 'Mutation'
  | 'Subscription'
  | 'AuthResult'
  | 'Category'
  | 'Post'
  | 'PostsConnection'
  | 'User'
  | 'CursorPageInfo';

export interface GeneratedSchema {
  query: Query;
  mutation: Mutation;
  subscription: Subscription;
}

export type MakeNullable<T> = {
  [K in keyof T]: T[K] | undefined;
};

export interface ScalarsEnums extends MakeNullable<Scalars> {
  UserRole: UserRole | undefined;
}
