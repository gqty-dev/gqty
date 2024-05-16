/**
 * GQty AUTO-GENERATED CODE: PLEASE DO NOT MODIFY MANUALLY
 */

import { type ScalarsEnumsHash } from 'gqty';

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
  Upload: { input: any; output: any };
}

export enum CacheControlScope {
  PRIVATE = 'PRIVATE',
  PUBLIC = 'PUBLIC',
}

export interface FilterCharacter {
  gender?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  species?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}

export interface FilterEpisode {
  episode?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
}

export interface FilterLocation {
  dimension?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}

export const scalarsEnumsHash: ScalarsEnumsHash = {
  Boolean: true,
  CacheControlScope: true,
  ID: true,
  Int: true,
  String: true,
  Upload: true,
};
export const generatedSchema = {
  Character: {
    __typename: { __type: 'String!' },
    created: { __type: 'String' },
    episode: { __type: '[Episode]!' },
    gender: { __type: 'String' },
    id: { __type: 'ID' },
    image: { __type: 'String' },
    location: { __type: 'Location' },
    name: { __type: 'String' },
    origin: { __type: 'Location' },
    species: { __type: 'String' },
    status: { __type: 'String' },
    type: { __type: 'String' },
  },
  Characters: {
    __typename: { __type: 'String!' },
    info: { __type: 'Info' },
    results: { __type: '[Character]' },
  },
  Episode: {
    __typename: { __type: 'String!' },
    air_date: { __type: 'String' },
    characters: { __type: '[Character]!' },
    created: { __type: 'String' },
    episode: { __type: 'String' },
    id: { __type: 'ID' },
    name: { __type: 'String' },
  },
  Episodes: {
    __typename: { __type: 'String!' },
    info: { __type: 'Info' },
    results: { __type: '[Episode]' },
  },
  FilterCharacter: {
    gender: { __type: 'String' },
    name: { __type: 'String' },
    species: { __type: 'String' },
    status: { __type: 'String' },
    type: { __type: 'String' },
  },
  FilterEpisode: { episode: { __type: 'String' }, name: { __type: 'String' } },
  FilterLocation: {
    dimension: { __type: 'String' },
    name: { __type: 'String' },
    type: { __type: 'String' },
  },
  Info: {
    __typename: { __type: 'String!' },
    count: { __type: 'Int' },
    next: { __type: 'Int' },
    pages: { __type: 'Int' },
    prev: { __type: 'Int' },
  },
  Location: {
    __typename: { __type: 'String!' },
    created: { __type: 'String' },
    dimension: { __type: 'String' },
    id: { __type: 'ID' },
    name: { __type: 'String' },
    residents: { __type: '[Character]!' },
    type: { __type: 'String' },
  },
  Locations: {
    __typename: { __type: 'String!' },
    info: { __type: 'Info' },
    results: { __type: '[Location]' },
  },
  mutation: {},
  query: {
    __typename: { __type: 'String!' },
    character: { __type: 'Character', __args: { id: 'ID!' } },
    characters: {
      __type: 'Characters',
      __args: { filter: 'FilterCharacter', page: 'Int' },
    },
    charactersByIds: { __type: '[Character]', __args: { ids: '[ID!]!' } },
    episode: { __type: 'Episode', __args: { id: 'ID!' } },
    episodes: {
      __type: 'Episodes',
      __args: { filter: 'FilterEpisode', page: 'Int' },
    },
    episodesByIds: { __type: '[Episode]', __args: { ids: '[ID!]!' } },
    location: { __type: 'Location', __args: { id: 'ID!' } },
    locations: {
      __type: 'Locations',
      __args: { filter: 'FilterLocation', page: 'Int' },
    },
    locationsByIds: { __type: '[Location]', __args: { ids: '[ID!]!' } },
  },
  subscription: {},
} as const;

export interface Character {
  __typename?: 'Character';
  /**
   * Time at which the character was created in the database.
   */
  created?: Maybe<Scalars['String']['output']>;
  /**
   * Episodes in which this character appeared.
   */
  episode: Array<Maybe<Episode>>;
  /**
   * The gender of the character ('Female', 'Male', 'Genderless' or 'unknown').
   */
  gender?: Maybe<Scalars['String']['output']>;
  /**
   * The id of the character.
   */
  id?: Maybe<Scalars['ID']['output']>;
  /**
   * Link to the character's image.
   * All images are 300x300px and most are medium shots or portraits since they are intended to be used as avatars.
   */
  image?: Maybe<Scalars['String']['output']>;
  /**
   * The character's last known location
   */
  location?: Maybe<Location>;
  /**
   * The name of the character.
   */
  name?: Maybe<Scalars['String']['output']>;
  /**
   * The character's origin location
   */
  origin?: Maybe<Location>;
  /**
   * The species of the character.
   */
  species?: Maybe<Scalars['String']['output']>;
  /**
   * The status of the character ('Alive', 'Dead' or 'unknown').
   */
  status?: Maybe<Scalars['String']['output']>;
  /**
   * The type or subspecies of the character.
   */
  type?: Maybe<Scalars['String']['output']>;
}

export interface Characters {
  __typename?: 'Characters';
  info?: Maybe<Info>;
  results?: Maybe<Array<Maybe<Character>>>;
}

export interface Episode {
  __typename?: 'Episode';
  /**
   * The air date of the episode.
   */
  air_date?: Maybe<Scalars['String']['output']>;
  /**
   * List of characters who have been seen in the episode.
   */
  characters: Array<Maybe<Character>>;
  /**
   * Time at which the episode was created in the database.
   */
  created?: Maybe<Scalars['String']['output']>;
  /**
   * The code of the episode.
   */
  episode?: Maybe<Scalars['String']['output']>;
  /**
   * The id of the episode.
   */
  id?: Maybe<Scalars['ID']['output']>;
  /**
   * The name of the episode.
   */
  name?: Maybe<Scalars['String']['output']>;
}

export interface Episodes {
  __typename?: 'Episodes';
  info?: Maybe<Info>;
  results?: Maybe<Array<Maybe<Episode>>>;
}

export interface Info {
  __typename?: 'Info';
  /**
   * The length of the response.
   */
  count?: Maybe<Scalars['Int']['output']>;
  /**
   * Number of the next page (if it exists)
   */
  next?: Maybe<Scalars['Int']['output']>;
  /**
   * The amount of pages.
   */
  pages?: Maybe<Scalars['Int']['output']>;
  /**
   * Number of the previous page (if it exists)
   */
  prev?: Maybe<Scalars['Int']['output']>;
}

export interface Location {
  __typename?: 'Location';
  /**
   * Time at which the location was created in the database.
   */
  created?: Maybe<Scalars['String']['output']>;
  /**
   * The dimension in which the location is located.
   */
  dimension?: Maybe<Scalars['String']['output']>;
  /**
   * The id of the location.
   */
  id?: Maybe<Scalars['ID']['output']>;
  /**
   * The name of the location.
   */
  name?: Maybe<Scalars['String']['output']>;
  /**
   * List of characters who have been last seen in the location.
   */
  residents: Array<Maybe<Character>>;
  /**
   * The type of the location.
   */
  type?: Maybe<Scalars['String']['output']>;
}

export interface Locations {
  __typename?: 'Locations';
  info?: Maybe<Info>;
  results?: Maybe<Array<Maybe<Location>>>;
}

export interface Mutation {
  __typename?: 'Mutation';
}

export interface Query {
  __typename?: 'Query';
  /**
   * Get a specific character by ID
   */
  character: (args: { id: Scalars['ID']['input'] }) => Maybe<Character>;
  /**
   * Get the list of all characters
   */
  characters: (args?: {
    filter?: Maybe<FilterCharacter>;
    page?: Maybe<Scalars['Int']['input']>;
  }) => Maybe<Characters>;
  /**
   * Get a list of characters selected by ids
   */
  charactersByIds: (args: {
    ids: Array<Scalars['ID']['input']>;
  }) => Maybe<Array<Maybe<Character>>>;
  /**
   * Get a specific episode by ID
   */
  episode: (args: { id: Scalars['ID']['input'] }) => Maybe<Episode>;
  /**
   * Get the list of all episodes
   */
  episodes: (args?: {
    filter?: Maybe<FilterEpisode>;
    page?: Maybe<Scalars['Int']['input']>;
  }) => Maybe<Episodes>;
  /**
   * Get a list of episodes selected by ids
   */
  episodesByIds: (args: {
    ids: Array<Scalars['ID']['input']>;
  }) => Maybe<Array<Maybe<Episode>>>;
  /**
   * Get a specific locations by ID
   */
  location: (args: { id: Scalars['ID']['input'] }) => Maybe<Location>;
  /**
   * Get the list of all locations
   */
  locations: (args?: {
    filter?: Maybe<FilterLocation>;
    page?: Maybe<Scalars['Int']['input']>;
  }) => Maybe<Locations>;
  /**
   * Get a list of locations selected by ids
   */
  locationsByIds: (args: {
    ids: Array<Scalars['ID']['input']>;
  }) => Maybe<Array<Maybe<Location>>>;
}

export interface Subscription {
  __typename?: 'Subscription';
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
