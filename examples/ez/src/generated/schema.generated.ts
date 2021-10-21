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
  ExampleScalar: string;
}

export enum GreetingsEnum {
  Hello = 'Hello',
  Hi = 'Hi',
  Hey = 'Hey',
}

export interface GreetingsInput {
  language: Scalars['String'];
  value?: Maybe<Scalars['String']>;
  scal?: Maybe<Scalars['ExampleScalar']>;
}

export const scalarsEnumsHash: import('gqty').ScalarsEnumsHash = {
  Boolean: true,
  ExampleScalar: true,
  GreetingsEnum: true,
  Int: true,
  String: true,
};
export const generatedSchema = {
  A: {
    __typename: { __type: 'String!' },
    a: { __type: 'String!' },
    common: { __type: 'Int', __args: { a: 'String' } },
    z: { __type: 'String' },
  },
  B: {
    __typename: { __type: 'String!' },
    b: { __type: 'Int!' },
    common: { __type: 'String', __args: { b: 'Int' } },
    z: { __type: 'String' },
  },
  C: {
    __typename: { __type: 'String!' },
    c: { __type: 'GreetingsEnum!' },
    z: { __type: 'String' },
  },
  Dog: {
    __typename: { __type: 'String!' },
    name: { __type: 'String!' },
    owner: { __type: 'Human!' },
  },
  GreetingsInput: {
    language: { __type: 'String!' },
    value: { __type: 'String' },
    scal: { __type: 'ExampleScalar' },
  },
  Human: {
    __typename: { __type: 'String!' },
    name: { __type: 'String!' },
    father: { __type: 'Human!' },
    fieldWithArgs: { __type: 'Int!', __args: { id: 'Int!' } },
    sons: { __type: '[Human!]' },
    union: { __type: '[TestUnion!]!' },
    args: { __type: 'Int', __args: { a: 'String' } },
  },
  NamedEntity: {
    __typename: { __type: 'String!' },
    name: { __type: 'String!' },
    $on: { __type: '$NamedEntity!' },
  },
  TestUnion: {
    __typename: { __type: 'String!' },
    $on: { __type: '$TestUnion!' },
  },
  mutation: {
    __typename: { __type: 'String!' },
    increment: { __type: 'Int!', __args: { n: 'Int!' } },
  },
  query: {
    __typename: { __type: 'String!' },
    simpleString: { __type: 'String!' },
    stringWithArgs: { __type: 'String!', __args: { hello: 'String!' } },
    stringNullableWithArgs: {
      __type: 'String',
      __args: { hello: 'String!', helloTwo: 'String' },
    },
    stringNullableWithArgsArray: {
      __type: 'String',
      __args: { hello: '[String]!' },
    },
    object: { __type: 'Human' },
    objectArray: { __type: '[Human]' },
    objectWithArgs: { __type: 'Human!', __args: { who: 'String!' } },
    arrayString: { __type: '[String!]!' },
    arrayObjectArgs: { __type: '[Human!]!', __args: { limit: 'Int!' } },
    greetings: { __type: 'GreetingsEnum!' },
    giveGreetingsInput: {
      __type: 'String!',
      __args: { input: 'GreetingsInput!' },
    },
    number: { __type: 'Int!' },
    union: { __type: '[TestUnion!]!' },
  },
  subscription: {},
  [SchemaUnionsKey]: {
    NamedEntity: ['Human', 'Dog'],
    TestUnion: ['A', 'B', 'C'],
  },
} as const;

export interface A {
  __typename?: 'A';
  a: ScalarsEnums['String'];
  common: (args?: {
    a?: Maybe<Scalars['String']>;
  }) => Maybe<ScalarsEnums['Int']>;
  z?: Maybe<ScalarsEnums['String']>;
}

export interface B {
  __typename?: 'B';
  b: ScalarsEnums['Int'];
  common: (args?: {
    b?: Maybe<Scalars['Int']>;
  }) => Maybe<ScalarsEnums['String']>;
  z?: Maybe<ScalarsEnums['String']>;
}

export interface C {
  __typename?: 'C';
  c: ScalarsEnums['GreetingsEnum'];
  z?: Maybe<ScalarsEnums['String']>;
}

export interface Dog {
  __typename?: 'Dog';
  name: ScalarsEnums['String'];
  owner: Human;
}

export interface Human {
  __typename?: 'Human';
  name: ScalarsEnums['String'];
  father: Human;
  fieldWithArgs: (args: { id: Scalars['Int'] }) => ScalarsEnums['Int'];
  sons?: Maybe<Array<Human>>;
  union: Array<TestUnion>;
  args: (args?: { a?: Maybe<Scalars['String']> }) => Maybe<ScalarsEnums['Int']>;
}

export interface NamedEntity {
  __typename?: 'Human' | 'Dog';
  name: ScalarsEnums['String'];
  $on: $NamedEntity;
}

export interface TestUnion {
  __typename?: 'A' | 'B' | 'C';
  $on: $TestUnion;
}

export interface Mutation {
  __typename?: 'Mutation';
  increment: (args: { n: Scalars['Int'] }) => ScalarsEnums['Int'];
}

export interface Query {
  __typename?: 'Query';
  simpleString: ScalarsEnums['String'];
  stringWithArgs: (args: {
    hello: Scalars['String'];
  }) => ScalarsEnums['String'];
  stringNullableWithArgs: (args: {
    hello: Scalars['String'];
    helloTwo?: Maybe<Scalars['String']>;
  }) => Maybe<ScalarsEnums['String']>;
  stringNullableWithArgsArray: (args: {
    hello: Array<Maybe<Scalars['String']>>;
  }) => Maybe<ScalarsEnums['String']>;
  object?: Maybe<Human>;
  objectArray?: Maybe<Array<Maybe<Human>>>;
  objectWithArgs: (args: { who: Scalars['String'] }) => Human;
  arrayString: Array<ScalarsEnums['String']>;
  arrayObjectArgs: (args: { limit: Scalars['Int'] }) => Array<Human>;
  greetings: ScalarsEnums['GreetingsEnum'];
  giveGreetingsInput: (args: {
    input: GreetingsInput;
  }) => ScalarsEnums['String'];
  number: ScalarsEnums['Int'];
  union: Array<TestUnion>;
}

export interface Subscription {
  __typename?: 'Subscription';
}

export interface SchemaObjectTypes {
  A: A;
  B: B;
  C: C;
  Dog: Dog;
  Human: Human;
  Mutation: Mutation;
  Query: Query;
  Subscription: Subscription;
}
export type SchemaObjectTypesNames =
  | 'A'
  | 'B'
  | 'C'
  | 'Dog'
  | 'Human'
  | 'Mutation'
  | 'Query'
  | 'Subscription';

export interface $NamedEntity {
  Human?: Human;
  Dog?: Dog;
}

export interface $TestUnion {
  A?: A;
  B?: B;
  C?: C;
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
  GreetingsEnum: GreetingsEnum | undefined;
}
