/**
 * GQTY AUTO-GENERATED CODE: PLEASE DO NOT MODIFY MANUALLY
 */

import { SchemaUnionsKey } from 'gqty';

export type Maybe<T> = T | null;
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
  /** The `Upload` scalar type represents a file upload. */
  Upload: File;
}

/** Input Type Example XD */
export interface inputTypeExample {
  a: Scalars['String'];
  other?: Maybe<Scalars['Int']>;
}

/** ConnectionArgs description! */
export interface ConnectionArgs {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
}

/** Dog Type */
export enum DogType {
  Big = 'Big',
  Small = 'Small',
  Other = 'Other',
}

export const scalarsEnumsHash: import('gqty').ScalarsEnumsHash = {
  Boolean: true,
  DogType: true,
  ID: true,
  Int: true,
  String: true,
  Upload: true,
};
export const generatedSchema = {
  ConnectionArgs: {
    first: { __type: 'Int' },
    after: { __type: 'String' },
    last: { __type: 'Int' },
    before: { __type: 'String' },
  },
  Dog: {
    __typename: { __type: 'String!' },
    id: { __type: 'ID!' },
    name: { __type: 'String!' },
    owner: { __type: 'Human' },
  },
  Human: {
    __typename: { __type: 'String!' },
    id: { __type: 'ID!' },
    name: { __type: 'String!' },
    dogs: { __type: '[Dog!]' },
    fieldWithArg: { __type: 'Int', __args: { a: 'String' } },
  },
  HumansConnection: {
    __typename: { __type: 'String!' },
    pageInfo: { __type: 'PageInfo!' },
    nodes: { __type: '[Human!]!' },
  },
  PageInfo: {
    __typename: { __type: 'String!' },
    hasPreviousPage: { __type: 'Boolean!' },
    hasNextPage: { __type: 'Boolean!' },
    startCursor: { __type: 'String' },
    endCursor: { __type: 'String' },
  },
  Species: { __typename: { __type: 'String!' }, $on: { __type: '$Species!' } },
  inputTypeExample: { a: { __type: 'String!' }, other: { __type: 'Int' } },
  mutation: {
    __typename: { __type: 'String!' },
    renameDog: { __type: 'Dog', __args: { id: 'ID!', name: 'String!' } },
    renameHuman: { __type: 'Human', __args: { id: 'ID!', name: 'String!' } },
    other: { __type: 'Int', __args: { arg: 'inputTypeExample!' } },
    createHuman: { __type: 'Human!', __args: { id: 'ID!', name: 'String!' } },
    sendNotification: { __type: 'Boolean!', __args: { message: 'String!' } },
    uploadFile: { __type: 'String!', __args: { file: 'Upload!' } },
  },
  query: {
    __typename: { __type: 'String!' },
    expectedError: { __type: 'Boolean!' },
    expectedNullableError: { __type: 'Boolean' },
    thirdTry: { __type: 'Boolean!' },
    dogs: { __type: '[Dog!]!' },
    time: { __type: 'String!' },
    stringList: { __type: '[String!]!' },
    humans: { __type: '[Human!]!' },
    human1: { __type: 'Human!' },
    human1Other: { __type: 'Human!' },
    paginatedHumans: {
      __type: 'HumansConnection!',
      __args: { input: 'ConnectionArgs!' },
    },
    emptyScalarArray: { __type: '[Int!]!' },
    emptyHumanArray: { __type: '[Human!]!' },
  },
  subscription: {
    __typename: { __type: 'String!' },
    newNotification: { __type: 'String!' },
  },
  [SchemaUnionsKey]: { Species: ['Human', 'Dog'] },
} as const;

/**
 * Dog Type
 */
export interface Dog {
  __typename?: 'Dog';
  id: ScalarsEnums['ID'];
  name: ScalarsEnums['String'];
  owner?: Maybe<Human>;
}

/**
 * Human Type
 */
export interface Human {
  __typename?: 'Human';
  id: ScalarsEnums['ID'];
  /**
   * Human Name
   */
  name: ScalarsEnums['String'];
  dogs?: Maybe<Array<Dog>>;
  /**
   * @deprecated No longer supported
   */
  fieldWithArg: (args?: {
    /**
     * @defaultValue `"Hello World"`
     */
    a?: Maybe<Scalars['String']>;
  }) => Maybe<ScalarsEnums['Int']>;
}

/**
 * Humans Connection
 */
export interface HumansConnection {
  __typename?: 'HumansConnection';
  pageInfo: PageInfo;
  nodes: Array<Human>;
}

/**
 * Page Info Object
 */
export interface PageInfo {
  __typename?: 'PageInfo';
  hasPreviousPage: ScalarsEnums['Boolean'];
  hasNextPage: ScalarsEnums['Boolean'];
  startCursor?: Maybe<ScalarsEnums['String']>;
  endCursor?: Maybe<ScalarsEnums['String']>;
}

export interface Species {
  __typename?: 'Human' | 'Dog';
  $on: $Species;
}

/**
 * Mutation
 */
export interface Mutation {
  __typename?: 'Mutation';
  renameDog: (args: {
    /**
     * Dog Id
     */
    id: Scalars['ID'];
    name: Scalars['String'];
  }) => Maybe<Dog>;
  renameHuman: (args: {
    id: Scalars['ID'];
    name: Scalars['String'];
  }) => Maybe<Human>;
  other: (args: { arg: inputTypeExample }) => Maybe<ScalarsEnums['Int']>;
  createHuman: (args: { id: Scalars['ID']; name: Scalars['String'] }) => Human;
  sendNotification: (args: {
    message: Scalars['String'];
  }) => ScalarsEnums['Boolean'];
  uploadFile: (args: { file: Scalars['Upload'] }) => ScalarsEnums['String'];
}

/**
 * Query Type
 */
export interface Query {
  __typename?: 'Query';
  /**
   * Expected Error!
   */
  expectedError: ScalarsEnums['Boolean'];
  expectedNullableError?: Maybe<ScalarsEnums['Boolean']>;
  thirdTry: ScalarsEnums['Boolean'];
  dogs: Array<Dog>;
  time: ScalarsEnums['String'];
  stringList: Array<ScalarsEnums['String']>;
  humans: Array<Human>;
  human1: Human;
  human1Other: Human;
  paginatedHumans: (args: {
    /**
     * Paginated Humans Input
     */
    input: ConnectionArgs;
  }) => HumansConnection;
  emptyScalarArray: Array<ScalarsEnums['Int']>;
  emptyHumanArray: Array<Human>;
}

export interface Subscription {
  __typename?: 'Subscription';
  newNotification: ScalarsEnums['String'];
}

export interface SchemaObjectTypes {
  Dog: Dog;
  Human: Human;
  HumansConnection: HumansConnection;
  Mutation: Mutation;
  PageInfo: PageInfo;
  Query: Query;
  Subscription: Subscription;
}
export type SchemaObjectTypesNames =
  | 'Dog'
  | 'Human'
  | 'HumansConnection'
  | 'Mutation'
  | 'PageInfo'
  | 'Query'
  | 'Subscription';

export interface $Species {
  Human?: Human;
  Dog?: Dog;
}

export interface GeneratedSchema {
  query: Query;
  mutation: Mutation;
  subscription: Subscription;
}

export type MakeNullable<T> = {
  [K in keyof T]: T[K] | undefined;
};

export interface ScalarsEnums extends MakeNullable<Scalars> {
  DogType: DogType | undefined;
}
