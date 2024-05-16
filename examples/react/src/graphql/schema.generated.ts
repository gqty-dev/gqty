/**
 * GQty AUTO-GENERATED CODE: PLEASE DO NOT MODIFY MANUALLY
 */

import { SchemaUnionsKey, type ScalarsEnumsHash } from 'gqty';

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
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export interface Scalars {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  /** The `Upload` scalar type represents a file upload. */
  Upload: { input: File; output: File };
}

/** ConnectionArgs description! */
export interface ConnectionArgs {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  /** @deprecated asd */
  last?: InputMaybe<Scalars['Int']['input']>;
}

/** Dog Type */
export enum DogType {
  Big = 'Big',
  /** @deprecated Field no longer supported */
  Other = 'Other',
  Small = 'Small',
}

/** Input Type Example XD */
export interface inputTypeExample {
  a: Scalars['String']['input'];
  other?: InputMaybe<Scalars['Int']['input']>;
}

export const scalarsEnumsHash: ScalarsEnumsHash = {
  Boolean: true,
  DogType: true,
  ID: true,
  Int: true,
  String: true,
  Upload: true,
};
export const generatedSchema = {
  ConnectionArgs: {
    after: { __type: 'String' },
    before: { __type: 'String' },
    first: { __type: 'Int' },
    last: { __type: 'Int' },
  },
  Dog: {
    __typename: { __type: 'String!' },
    id: { __type: 'ID!' },
    name: { __type: 'String!' },
    owner: { __type: 'Human' },
  },
  Human: {
    __typename: { __type: 'String!' },
    dogs: { __type: '[Dog!]' },
    fieldWithArg: { __type: 'Int', __args: { a: 'String' } },
    id: { __type: 'ID!' },
    name: { __type: 'String!' },
  },
  HumansConnection: {
    __typename: { __type: 'String!' },
    nodes: { __type: '[Human!]!' },
    pageInfo: { __type: 'PageInfo!' },
  },
  PageInfo: {
    __typename: { __type: 'String!' },
    endCursor: { __type: 'String' },
    hasNextPage: { __type: 'Boolean!' },
    hasPreviousPage: { __type: 'Boolean!' },
    startCursor: { __type: 'String' },
  },
  Species: { __typename: { __type: 'String!' }, $on: { __type: '$Species!' } },
  inputTypeExample: { a: { __type: 'String!' }, other: { __type: 'Int' } },
  mutation: {
    __typename: { __type: 'String!' },
    createHuman: { __type: 'Human!', __args: { id: 'ID!', name: 'String!' } },
    other: { __type: 'Int', __args: { arg: 'inputTypeExample!' } },
    renameDog: { __type: 'Dog', __args: { id: 'ID!', name: 'String!' } },
    renameHuman: { __type: 'Human', __args: { id: 'ID!', name: 'String!' } },
    sendNotification: { __type: 'Boolean!', __args: { message: 'String!' } },
    uploadFile: { __type: 'String!', __args: { file: 'Upload!' } },
  },
  query: {
    __typename: { __type: 'String!' },
    dogs: { __type: '[Dog!]!' },
    emptyHumanArray: { __type: '[Human!]!' },
    emptyScalarArray: { __type: '[Int!]!' },
    expectedError: { __type: 'Boolean!' },
    expectedNullableError: { __type: 'Boolean' },
    human1: { __type: 'Human!' },
    human1Other: { __type: 'Human!' },
    humans: { __type: '[Human!]!' },
    paginatedHumans: {
      __type: 'HumansConnection!',
      __args: { input: 'ConnectionArgs!' },
    },
    stringList: { __type: '[String!]!' },
    thirdTry: { __type: 'Boolean!' },
    time: { __type: 'String!' },
  },
  subscription: {
    __typename: { __type: 'String!' },
    newNotification: { __type: 'String!' },
  },
  [SchemaUnionsKey]: { Species: ['Dog', 'Human'] },
} as const;

/**
 * Dog Type
 */
export interface Dog {
  __typename?: 'Dog';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  owner?: Maybe<Human>;
}

/**
 * Human Type
 */
export interface Human {
  __typename?: 'Human';
  dogs?: Maybe<Array<Dog>>;
  /**
   * @deprecated No longer supported
   */
  fieldWithArg: (args?: {
    /**
     * @defaultValue `"Hello World"`
     */
    a?: Maybe<Scalars['String']['input']>;
  }) => Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  /**
   * Human Name
   */
  name: Scalars['String']['output'];
}

/**
 * Humans Connection
 */
export interface HumansConnection {
  __typename?: 'HumansConnection';
  nodes: Array<Human>;
  pageInfo: PageInfo;
}

/**
 * Page Info Object
 */
export interface PageInfo {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
}

export interface Species {
  __typename?: 'Dog' | 'Human';
  $on: $Species;
}

/**
 * Mutation
 */
export interface Mutation {
  __typename?: 'Mutation';
  createHuman: (args: {
    id: Scalars['ID']['input'];
    name: Scalars['String']['input'];
  }) => Human;
  other: (args: { arg: inputTypeExample }) => Maybe<Scalars['Int']['output']>;
  renameDog: (args: {
    /**
     * Dog Id
     */
    id: Scalars['ID']['input'];
    name: Scalars['String']['input'];
  }) => Maybe<Dog>;
  renameHuman: (args: {
    id: Scalars['ID']['input'];
    name: Scalars['String']['input'];
  }) => Maybe<Human>;
  sendNotification: (args: {
    message: Scalars['String']['input'];
  }) => Scalars['Boolean']['output'];
  uploadFile: (args: {
    file: Scalars['Upload']['input'];
  }) => Scalars['String']['output'];
}

/**
 * Query Type
 */
export interface Query {
  __typename?: 'Query';
  dogs: Array<Dog>;
  emptyHumanArray: Array<Human>;
  emptyScalarArray: Array<Scalars['Int']['output']>;
  /**
   * Expected Error!
   */
  expectedError: Scalars['Boolean']['output'];
  expectedNullableError?: Maybe<Scalars['Boolean']['output']>;
  human1: Human;
  human1Other: Human;
  humans: Array<Human>;
  paginatedHumans: (args: {
    /**
     * Paginated Humans Input
     */
    input: ConnectionArgs;
  }) => HumansConnection;
  stringList: Array<Scalars['String']['output']>;
  thirdTry: Scalars['Boolean']['output'];
  time: Scalars['String']['output'];
}

export interface Subscription {
  __typename?: 'Subscription';
  newNotification: Scalars['String']['output'];
}

export interface $Species {
  Dog?: Dog;
  Human?: Human;
}

export interface GeneratedSchema {
  query: Query;
  mutation: Mutation;
  subscription: Subscription;
}

type Enums = {};

export type InputFields = {
  [Key in keyof Scalars]: Scalars[Key] extends { input: unknown }
    ? Scalars[Key]['input']
    : never;
} & Enums;

export type OutputFields = {
  [Key in keyof Scalars]: Scalars[Key] extends { output: unknown }
    ? Scalars[Key]['output']
    : never;
} & Enums;
