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
  K extends keyof T,
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
  Date: { input: string; output: string };
}

export enum ChangeEventType {
  CREATED = 'CREATED',
  DELETED = 'DELETED',
  UPDATED = 'UPDATED',
}

export const scalarsEnumsHash: ScalarsEnumsHash = {
  Boolean: true,
  ChangeEventType: true,
  Date: true,
  ID: true,
  Int: true,
  String: true,
};
export const generatedSchema = {
  Cat: {
    __typename: { __type: 'String!' },
    id: { __type: 'ID!' },
    name: { __type: 'String' },
    owner: { __type: 'People' },
    pet: { __type: 'String', __args: { times: 'Int' } },
  },
  Dog: {
    __typename: { __type: 'String!' },
    id: { __type: 'ID!' },
    name: { __type: 'String' },
    owner: { __type: 'People' },
    pet: { __type: 'String', __args: { times: 'Int' } },
  },
  People: {
    __typename: { __type: 'String!' },
    id: { __type: 'ID!' },
    name: { __type: 'String!' },
    pets: { __type: '[Pet!]!' },
  },
  PeopleChangeEvent: {
    __typename: { __type: 'String!' },
    people: { __type: 'People!' },
    type: { __type: 'ChangeEventType!' },
  },
  Pet: {
    __typename: { __type: 'String!' },
    id: { __type: 'ID!' },
    name: { __type: 'String' },
    owner: { __type: 'People' },
    pet: { __type: 'String', __args: { times: 'Int' } },
    $on: { __type: '$Pet!' },
  },
  mutation: {
    __typename: { __type: 'String!' },
    createCat: { __type: 'Cat!', __args: { name: 'String' } },
    createDog: { __type: 'Dog!', __args: { name: 'String' } },
    createPeople: { __type: 'People!', __args: { name: 'String!' } },
    dropPet: { __type: 'Pet!', __args: { people: 'ID!', pet: 'ID!' } },
    renameCat: { __type: 'Cat!', __args: { id: 'ID!', name: 'String!' } },
    renameDog: { __type: 'Dog!', __args: { id: 'ID!', name: 'String!' } },
    takePet: { __type: 'Pet!', __args: { people: 'ID!', pet: 'ID!' } },
  },
  query: {
    __typename: { __type: 'String!' },
    now: { __type: 'Date!' },
    people: { __type: 'People', __args: { id: 'ID!' } },
    peoples: { __type: '[People!]!' },
    pet: { __type: 'Pet', __args: { id: 'ID!' } },
  },
  subscription: {
    __typename: { __type: 'String!' },
    peopleChanged: { __type: 'PeopleChangeEvent!' },
  },
  [SchemaUnionsKey]: { Pet: ['Cat', 'Dog'] },
} as const;

export interface Cat {
  __typename?: 'Cat';
  id: ScalarsEnums['ID'];
  name?: Maybe<ScalarsEnums['String']>;
  owner?: Maybe<People>;
  /**
   * Cat ignores you and returns null
   */
  pet: (args?: {
    /**
     * @defaultValue `1`
     */
    times?: Maybe<ScalarsEnums['Int']>;
  }) => Maybe<ScalarsEnums['String']>;
}

export interface Dog {
  __typename?: 'Dog';
  id: ScalarsEnums['ID'];
  name?: Maybe<ScalarsEnums['String']>;
  owner?: Maybe<People>;
  /**
   * Dog arf x times.
   */
  pet: (args?: {
    /**
     * @defaultValue `1`
     */
    times?: Maybe<ScalarsEnums['Int']>;
  }) => Maybe<ScalarsEnums['String']>;
}

export interface People {
  __typename?: 'People';
  id: ScalarsEnums['ID'];
  name: ScalarsEnums['String'];
  pets: Array<Pet>;
}

export interface PeopleChangeEvent {
  __typename?: 'PeopleChangeEvent';
  people: People;
  type: ScalarsEnums['ChangeEventType'];
}

export interface Pet {
  __typename?: 'Cat' | 'Dog';
  id: ScalarsEnums['ID'];
  name?: Maybe<ScalarsEnums['String']>;
  owner?: Maybe<People>;
  pet: (args?: {
    /**
     * @defaultValue `1`
     */
    times?: Maybe<ScalarsEnums['Int']>;
  }) => Maybe<ScalarsEnums['String']>;
  $on: $Pet;
}

/**
 * 1. Basic mutation
 * 2. Loading state change and query refetches
 * 3. Optimistic updates
 */
export interface Mutation {
  __typename?: 'Mutation';
  createCat: (args?: { name?: Maybe<ScalarsEnums['String']> }) => Cat;
  createDog: (args?: { name?: Maybe<ScalarsEnums['String']> }) => Dog;
  createPeople: (args: { name: ScalarsEnums['String'] }) => People;
  dropPet: (args: {
    people: ScalarsEnums['ID'];
    pet: ScalarsEnums['ID'];
  }) => Pet;
  renameCat: (args: {
    id: ScalarsEnums['ID'];
    name: ScalarsEnums['String'];
  }) => Cat;
  renameDog: (args: {
    id: ScalarsEnums['ID'];
    name: ScalarsEnums['String'];
  }) => Dog;
  takePet: (args: {
    people: ScalarsEnums['ID'];
    pet: ScalarsEnums['ID'];
  }) => Pet;
}

/**
 * # Basic query
 * 1. Top-level scalar
 * 2. Object types
 * 3. Unions
 * 4. Interfaces
 * 5. Arrays
 *
 * ## Special cases
 * 1. Nullables
 * 2. Empty arrays
 * 3. Recursive relationships
 * 4. Customer scalar
 */
export interface Query {
  __typename?: 'Query';
  now: ScalarsEnums['Date'];
  people: (args: { id: ScalarsEnums['ID'] }) => Maybe<People>;
  peoples: Array<People>;
  pet: (args: { id: ScalarsEnums['ID'] }) => Maybe<Pet>;
}

/**
 * 1. Triggered by mutation
 * 2. Triggered externally
 * 3. Normalized cache update
 */
export interface Subscription {
  __typename?: 'Subscription';
  peopleChanged: PeopleChangeEvent;
}

export interface $Pet {
  Cat?: Cat;
  Dog?: Dog;
}

export interface GeneratedSchema {
  query: Query;
  mutation: Mutation;
  subscription: Subscription;
}

export type ScalarsEnums = {
  [Key in keyof Scalars]: Scalars[Key] extends { output: unknown }
    ? Scalars[Key]['output']
    : never;
} & {
  ChangeEventType: ChangeEventType;
};
