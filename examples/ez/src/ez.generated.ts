import type {
  GraphQLResolveInfo,
  GraphQLScalarType,
  GraphQLScalarTypeConfig,
} from 'graphql';
import type { EZContext } from 'graphql-ez';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
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
export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) =>
  | Promise<import('graphql-ez').DeepPartial<TResult>>
  | import('graphql-ez').DeepPartial<TResult>;
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = {
  [X in Exclude<keyof T, K>]?: T[X];
} & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  ExampleScalar: any;
};

export type NamedEntity = {
  name: Scalars['String'];
};

export enum GreetingsEnum {
  Hello = 'Hello',
  Hi = 'Hi',
  Hey = 'Hey',
}

export type GreetingsInput = {
  language: Scalars['String'];
  value?: InputMaybe<Scalars['String']>;
  scal?: InputMaybe<Scalars['ExampleScalar']>;
};

export type Query = {
  __typename?: 'Query';
  simpleString: Scalars['String'];
  stringWithArgs: Scalars['String'];
  stringNullableWithArgs?: Maybe<Scalars['String']>;
  stringNullableWithArgsArray?: Maybe<Scalars['String']>;
  object?: Maybe<Human>;
  objectArray?: Maybe<Array<Maybe<Human>>>;
  objectWithArgs: Human;
  arrayString: Array<Scalars['String']>;
  arrayObjectArgs: Array<Human>;
  greetings: GreetingsEnum;
  giveGreetingsInput: Scalars['String'];
  number: Scalars['Int'];
  union: Array<TestUnion>;
};

export type QueryStringWithArgsArgs = {
  hello: Scalars['String'];
};

export type QueryStringNullableWithArgsArgs = {
  hello: Scalars['String'];
  helloTwo?: InputMaybe<Scalars['String']>;
};

export type QueryStringNullableWithArgsArrayArgs = {
  hello: Array<InputMaybe<Scalars['String']>>;
};

export type QueryObjectWithArgsArgs = {
  who: Scalars['String'];
};

export type QueryArrayObjectArgsArgs = {
  limit: Scalars['Int'];
};

export type QueryGiveGreetingsInputArgs = {
  input: GreetingsInput;
};

export type Mutation = {
  __typename?: 'Mutation';
  increment: Scalars['Int'];
};

export type MutationIncrementArgs = {
  n: Scalars['Int'];
};

export type Human = NamedEntity & {
  __typename?: 'Human';
  name: Scalars['String'];
  father: Human;
  fieldWithArgs: Scalars['Int'];
  sons?: Maybe<Array<Human>>;
  union: Array<TestUnion>;
  args?: Maybe<Scalars['Int']>;
};

export type HumanFieldWithArgsArgs = {
  id: Scalars['Int'];
};

export type HumanArgsArgs = {
  a?: InputMaybe<Scalars['String']>;
};

export type Dog = NamedEntity & {
  __typename?: 'Dog';
  name: Scalars['String'];
  owner: Human;
};

export type A = {
  __typename?: 'A';
  a: Scalars['String'];
  common?: Maybe<Scalars['Int']>;
  z?: Maybe<Scalars['String']>;
};

export type ACommonArgs = {
  a?: InputMaybe<Scalars['String']>;
};

export type B = {
  __typename?: 'B';
  b: Scalars['Int'];
  common?: Maybe<Scalars['String']>;
  z?: Maybe<Scalars['String']>;
};

export type BCommonArgs = {
  b?: InputMaybe<Scalars['Int']>;
};

export type C = {
  __typename?: 'C';
  c: GreetingsEnum;
  z?: Maybe<Scalars['String']>;
};

export type TestUnion = A | B | C;

export type ResolverTypeWrapper<T> = Promise<T> | T;

export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs
> {
  subscribe: SubscriptionSubscribeFn<
    { [key in TKey]: TResult },
    TParent,
    TContext,
    TArgs
  >;
  resolve?: SubscriptionResolveFn<
    TResult,
    { [key in TKey]: TResult },
    TContext,
    TArgs
  >;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs
> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<
  TResult,
  TKey extends string,
  TParent = {},
  TContext = {},
  TArgs = {}
> =
  | ((
      ...args: any[]
    ) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (
  obj: T,
  context: TContext,
  info: GraphQLResolveInfo
) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<
  TResult = {},
  TParent = {},
  TContext = {},
  TArgs = {}
> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  NamedEntity: ResolversTypes['Human'] | ResolversTypes['Dog'];
  String: ResolverTypeWrapper<Scalars['String']>;
  ExampleScalar: ResolverTypeWrapper<Scalars['ExampleScalar']>;
  GreetingsEnum: GreetingsEnum;
  GreetingsInput: GreetingsInput;
  Query: ResolverTypeWrapper<{}>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  Mutation: ResolverTypeWrapper<{}>;
  Human: ResolverTypeWrapper<
    Omit<Human, 'union'> & { union: Array<ResolversTypes['TestUnion']> }
  >;
  Dog: ResolverTypeWrapper<Dog>;
  A: ResolverTypeWrapper<A>;
  B: ResolverTypeWrapper<B>;
  C: ResolverTypeWrapper<C>;
  TestUnion: ResolversTypes['A'] | ResolversTypes['B'] | ResolversTypes['C'];
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  NamedEntity: ResolversParentTypes['Human'] | ResolversParentTypes['Dog'];
  String: Scalars['String'];
  ExampleScalar: Scalars['ExampleScalar'];
  GreetingsInput: GreetingsInput;
  Query: {};
  Int: Scalars['Int'];
  Mutation: {};
  Human: Omit<Human, 'union'> & {
    union: Array<ResolversParentTypes['TestUnion']>;
  };
  Dog: Dog;
  A: A;
  B: B;
  C: C;
  TestUnion:
    | ResolversParentTypes['A']
    | ResolversParentTypes['B']
    | ResolversParentTypes['C'];
  Boolean: Scalars['Boolean'];
};

export type NamedEntityResolvers<
  ContextType = EZContext,
  ParentType extends ResolversParentTypes['NamedEntity'] = ResolversParentTypes['NamedEntity']
> = {
  __resolveType: TypeResolveFn<'Human' | 'Dog', ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export interface ExampleScalarScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes['ExampleScalar'], any> {
  name: 'ExampleScalar';
}

export type QueryResolvers<
  ContextType = EZContext,
  ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']
> = {
  simpleString?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  stringWithArgs?: Resolver<
    ResolversTypes['String'],
    ParentType,
    ContextType,
    RequireFields<QueryStringWithArgsArgs, 'hello'>
  >;
  stringNullableWithArgs?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType,
    RequireFields<QueryStringNullableWithArgsArgs, 'hello'>
  >;
  stringNullableWithArgsArray?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType,
    RequireFields<QueryStringNullableWithArgsArrayArgs, 'hello'>
  >;
  object?: Resolver<Maybe<ResolversTypes['Human']>, ParentType, ContextType>;
  objectArray?: Resolver<
    Maybe<Array<Maybe<ResolversTypes['Human']>>>,
    ParentType,
    ContextType
  >;
  objectWithArgs?: Resolver<
    ResolversTypes['Human'],
    ParentType,
    ContextType,
    RequireFields<QueryObjectWithArgsArgs, 'who'>
  >;
  arrayString?: Resolver<
    Array<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  arrayObjectArgs?: Resolver<
    Array<ResolversTypes['Human']>,
    ParentType,
    ContextType,
    RequireFields<QueryArrayObjectArgsArgs, 'limit'>
  >;
  greetings?: Resolver<
    ResolversTypes['GreetingsEnum'],
    ParentType,
    ContextType
  >;
  giveGreetingsInput?: Resolver<
    ResolversTypes['String'],
    ParentType,
    ContextType,
    RequireFields<QueryGiveGreetingsInputArgs, 'input'>
  >;
  number?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  union?: Resolver<Array<ResolversTypes['TestUnion']>, ParentType, ContextType>;
};

export type MutationResolvers<
  ContextType = EZContext,
  ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']
> = {
  increment?: Resolver<
    ResolversTypes['Int'],
    ParentType,
    ContextType,
    RequireFields<MutationIncrementArgs, 'n'>
  >;
};

export type HumanResolvers<
  ContextType = EZContext,
  ParentType extends ResolversParentTypes['Human'] = ResolversParentTypes['Human']
> = {
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  father?: Resolver<ResolversTypes['Human'], ParentType, ContextType>;
  fieldWithArgs?: Resolver<
    ResolversTypes['Int'],
    ParentType,
    ContextType,
    RequireFields<HumanFieldWithArgsArgs, 'id'>
  >;
  sons?: Resolver<
    Maybe<Array<ResolversTypes['Human']>>,
    ParentType,
    ContextType
  >;
  union?: Resolver<Array<ResolversTypes['TestUnion']>, ParentType, ContextType>;
  args?: Resolver<
    Maybe<ResolversTypes['Int']>,
    ParentType,
    ContextType,
    RequireFields<HumanArgsArgs, never>
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DogResolvers<
  ContextType = EZContext,
  ParentType extends ResolversParentTypes['Dog'] = ResolversParentTypes['Dog']
> = {
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  owner?: Resolver<ResolversTypes['Human'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AResolvers<
  ContextType = EZContext,
  ParentType extends ResolversParentTypes['A'] = ResolversParentTypes['A']
> = {
  a?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  common?: Resolver<
    Maybe<ResolversTypes['Int']>,
    ParentType,
    ContextType,
    RequireFields<ACommonArgs, never>
  >;
  z?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BResolvers<
  ContextType = EZContext,
  ParentType extends ResolversParentTypes['B'] = ResolversParentTypes['B']
> = {
  b?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  common?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType,
    RequireFields<BCommonArgs, never>
  >;
  z?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CResolvers<
  ContextType = EZContext,
  ParentType extends ResolversParentTypes['C'] = ResolversParentTypes['C']
> = {
  c?: Resolver<ResolversTypes['GreetingsEnum'], ParentType, ContextType>;
  z?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TestUnionResolvers<
  ContextType = EZContext,
  ParentType extends ResolversParentTypes['TestUnion'] = ResolversParentTypes['TestUnion']
> = {
  __resolveType: TypeResolveFn<'A' | 'B' | 'C', ParentType, ContextType>;
};

export type Resolvers<ContextType = EZContext> = {
  NamedEntity?: NamedEntityResolvers<ContextType>;
  ExampleScalar?: GraphQLScalarType;
  Query?: QueryResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Human?: HumanResolvers<ContextType>;
  Dog?: DogResolvers<ContextType>;
  A?: AResolvers<ContextType>;
  B?: BResolvers<ContextType>;
  C?: CResolvers<ContextType>;
  TestUnion?: TestUnionResolvers<ContextType>;
};

export type SimpleStringQueryVariables = Exact<{ [key: string]: never }>;

export type SimpleStringQuery = {
  __typename?: 'Query';
  simpleString: string;
  union: Array<
    | { __typename: 'A'; a: string }
    | { __typename: 'B'; b: number }
    | { __typename: 'C'; c: GreetingsEnum }
  >;
};

export type ArrayObjectArgsQueryVariables = Exact<{ [key: string]: never }>;

export type ArrayObjectArgsQuery = {
  __typename?: 'Query';
  arrayObjectArgs: Array<{
    __typename?: 'Human';
    name: string;
    father: {
      __typename?: 'Human';
      name: string;
      father: { __typename?: 'Human'; name: string };
    };
  }>;
};

export type MultipleArgsQueryVariables = Exact<{ [key: string]: never }>;

export type MultipleArgsQuery = {
  __typename?: 'Query';
  a1: { __typename?: 'Human'; zxc: string; abc: string };
  a2: { __typename?: 'Human'; name: string };
};

export const SimpleStringDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'simpleString' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'simpleString' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'union' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                {
                  kind: 'InlineFragment',
                  typeCondition: {
                    kind: 'NamedType',
                    name: { kind: 'Name', value: 'A' },
                  },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'a' } },
                    ],
                  },
                },
                {
                  kind: 'InlineFragment',
                  typeCondition: {
                    kind: 'NamedType',
                    name: { kind: 'Name', value: 'B' },
                  },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'b' } },
                    ],
                  },
                },
                {
                  kind: 'InlineFragment',
                  typeCondition: {
                    kind: 'NamedType',
                    name: { kind: 'Name', value: 'C' },
                  },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'c' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SimpleStringQuery, SimpleStringQueryVariables>;
export const ArrayObjectArgsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'arrayObjectArgs' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'arrayObjectArgs' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'limit' },
                value: { kind: 'IntValue', value: '2' },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'father' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'father' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ArrayObjectArgsQuery,
  ArrayObjectArgsQueryVariables
>;
export const MultipleArgsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'multipleArgs' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            alias: { kind: 'Name', value: 'a1' },
            name: { kind: 'Name', value: 'objectWithArgs' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'who' },
                value: { kind: 'StringValue', value: 'hello', block: false },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  alias: { kind: 'Name', value: 'zxc' },
                  name: { kind: 'Name', value: 'name' },
                },
                {
                  kind: 'Field',
                  alias: { kind: 'Name', value: 'abc' },
                  name: { kind: 'Name', value: 'name' },
                },
              ],
            },
          },
          {
            kind: 'Field',
            alias: { kind: 'Name', value: 'a2' },
            name: { kind: 'Name', value: 'objectWithArgs' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'who' },
                value: { kind: 'StringValue', value: 'hello2', block: false },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<MultipleArgsQuery, MultipleArgsQueryVariables>;

declare module 'graphql-ez' {
  interface EZResolvers extends Resolvers<import('graphql-ez').EZContext> {}
}
