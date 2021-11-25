/**
 * GQTY AUTO-GENERATED CODE: PLEASE DO NOT MODIFY MANUALLY
 */

export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
/** All built-in and custom scalars, mapped to their actual values */
export interface Scalars {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  DateTime: string;
  /** A field whose value conforms to the standard internet email address format as specified in RFC822: https://www.w3.org/Protocols/rfc822/. */
  EmailAddress: any;
  /** A string that cannot be passed as an empty value */
  NonEmptyString: any;
  /** Integers that will have a value of 0 or more. */
  NonNegativeInt: any;
}

export interface CursorConnectionArgs {
  after?: InputMaybe<Scalars['NonEmptyString']>;
  before?: InputMaybe<Scalars['NonEmptyString']>;
  first?: InputMaybe<Scalars['NonNegativeInt']>;
  last?: InputMaybe<Scalars['NonNegativeInt']>;
}

export interface LoginInput {
  email: Scalars['EmailAddress'];
}

export interface PostCreate {
  category?: InputMaybe<Array<Scalars['String']>>;
  title: Scalars['NonEmptyString'];
}

export interface PostUpdate {
  category?: InputMaybe<Array<Scalars['String']>>;
  id: Scalars['String'];
  published?: InputMaybe<Scalars['Boolean']>;
  title?: InputMaybe<Scalars['NonEmptyString']>;
}

export interface RegisterInput {
  email: Scalars['EmailAddress'];
}

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export const scalarsEnumsHash: import('gqty').ScalarsEnumsHash = {
  Boolean: true,
  DateTime: true,
  EmailAddress: true,
  ID: true,
  Int: true,
  NonEmptyString: true,
  NonNegativeInt: true,
  String: true,
  UserRole: true,
};
export const generatedSchema = {
  AuthResult: {
    __typename: { __type: 'String!' },
    error: { __type: 'String' },
    token: { __type: 'String' },
    user: { __type: 'User' },
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
  CursorConnectionArgs: {
    after: { __type: 'NonEmptyString' },
    before: { __type: 'NonEmptyString' },
    first: { __type: 'NonNegativeInt' },
    last: { __type: 'NonNegativeInt' },
  },
  CursorPageInfo: {
    __typename: { __type: 'String!' },
    endCursor: { __type: 'NonEmptyString' },
    hasNextPage: { __type: 'Boolean!' },
    hasPreviousPage: { __type: 'Boolean!' },
    startCursor: { __type: 'NonEmptyString' },
  },
  LoginInput: { email: { __type: 'EmailAddress!' } },
  Post: {
    __typename: { __type: 'String!' },
    category: { __type: '[Category!]' },
    createdAt: { __type: 'DateTime!' },
    id: { __type: 'ID!' },
    published: { __type: 'Boolean!' },
    title: { __type: 'String!' },
  },
  PostCreate: {
    category: { __type: '[String!]' },
    title: { __type: 'NonEmptyString!' },
  },
  PostUpdate: {
    category: { __type: '[String!]' },
    id: { __type: 'String!' },
    published: { __type: 'Boolean' },
    title: { __type: 'NonEmptyString' },
  },
  PostsConnection: {
    __typename: { __type: 'String!' },
    nodes: { __type: '[Post!]!' },
    pageInfo: { __type: 'CursorPageInfo!' },
  },
  RegisterInput: { email: { __type: 'EmailAddress!' } },
  User: {
    __typename: { __type: 'String!' },
    email: { __type: 'String!' },
    id: { __type: 'ID!' },
    name: { __type: 'String' },
    posts: {
      __type: 'PostsConnection!',
      __args: { input: 'CursorConnectionArgs!' },
    },
    role: { __type: 'UserRole!' },
  },
  mutation: {
    __typename: { __type: 'String!' },
    createPost: { __type: 'Post!', __args: { post: 'PostCreate!' } },
    hello: { __type: 'String!' },
    login: { __type: 'AuthResult!', __args: { input: 'LoginInput!' } },
    register: { __type: 'AuthResult!', __args: { input: 'RegisterInput!' } },
    removeOwnPost: { __type: 'Boolean!', __args: { postId: 'String!' } },
    setName: { __type: 'User!', __args: { name: 'String!' } },
    updatePost: { __type: 'Post!', __args: { post: 'PostUpdate!' } },
  },
  query: {
    __typename: { __type: 'String!' },
    currentUser: { __type: 'AuthResult!' },
    hello: { __type: 'String!' },
    namesList: { __type: '[String!]!', __args: { n: 'Int' } },
    postsCategories: { __type: '[Category!]!' },
    publicPosts: {
      __type: 'PostsConnection!',
      __args: { input: 'CursorConnectionArgs!' },
    },
  },
  subscription: {},
} as const;

export interface AuthResult {
  __typename?: 'AuthResult';
  error?: Maybe<ScalarsEnums['String']>;
  token?: Maybe<ScalarsEnums['String']>;
  user?: Maybe<User>;
}

export interface Category {
  __typename?: 'Category';
  id: ScalarsEnums['ID'];
  name?: Maybe<ScalarsEnums['String']>;
  posts: (args: { input: CursorConnectionArgs }) => PostsConnection;
}

export interface CursorPageInfo {
  __typename?: 'CursorPageInfo';
  endCursor?: Maybe<ScalarsEnums['NonEmptyString']>;
  hasNextPage: ScalarsEnums['Boolean'];
  hasPreviousPage: ScalarsEnums['Boolean'];
  startCursor?: Maybe<ScalarsEnums['NonEmptyString']>;
}

export interface Post {
  __typename?: 'Post';
  category?: Maybe<Array<Category>>;
  createdAt: ScalarsEnums['DateTime'];
  id: ScalarsEnums['ID'];
  published: ScalarsEnums['Boolean'];
  title: ScalarsEnums['String'];
}

export interface PostsConnection {
  __typename?: 'PostsConnection';
  nodes: Array<Post>;
  pageInfo: CursorPageInfo;
}

export interface User {
  __typename?: 'User';
  email: ScalarsEnums['String'];
  id: ScalarsEnums['ID'];
  name?: Maybe<ScalarsEnums['String']>;
  /**
   * Posts created by user
   */
  posts: (args: { input: CursorConnectionArgs }) => PostsConnection;
  role: ScalarsEnums['UserRole'];
}

export interface Mutation {
  __typename?: 'Mutation';
  /**
   * [Authenticated] Create new post
   */
  createPost: (args: { post: PostCreate }) => Post;
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
   * [Authenticated] Remove own post
   */
  removeOwnPost: (args: {
    postId: Scalars['String'];
  }) => ScalarsEnums['Boolean'];
  setName: (args: { name: Scalars['String'] }) => User;
  /**
   * [Authenticated] Update existing post
   */
  updatePost: (args: { post: PostUpdate }) => Post;
}

export interface Query {
  __typename?: 'Query';
  /**
   * Current authenticated user
   */
  currentUser: AuthResult;
  hello: ScalarsEnums['String'];
  namesList: (args?: {
    /**
     * @defaultValue `10`
     */
    n?: Maybe<Scalars['Int']>;
  }) => Array<ScalarsEnums['String']>;
  /**
   * Get all current created categories
   */
  postsCategories: Array<Category>;
  /**
   * Get all published posts
   */
  publicPosts: (args: { input: CursorConnectionArgs }) => PostsConnection;
}

export interface Subscription {
  __typename?: 'Subscription';
}

export interface SchemaObjectTypes {
  AuthResult: AuthResult;
  Category: Category;
  CursorPageInfo: CursorPageInfo;
  Mutation: Mutation;
  Post: Post;
  PostsConnection: PostsConnection;
  Query: Query;
  Subscription: Subscription;
  User: User;
}
export type SchemaObjectTypesNames =
  | 'AuthResult'
  | 'Category'
  | 'CursorPageInfo'
  | 'Mutation'
  | 'Post'
  | 'PostsConnection'
  | 'Query'
  | 'Subscription'
  | 'User';

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
