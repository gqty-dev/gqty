import type {
  GraphQLResolveInfo,
  GraphQLScalarType,
  GraphQLScalarTypeConfig,
} from 'graphql';
import type { EZContext } from 'graphql-ez';
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
export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) =>
  | Promise<import('graphql-ez').DeepPartial<TResult>>
  | import('graphql-ez').DeepPartial<TResult>;
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
  /** The `Upload` scalar type represents a file upload. */
  Upload: Promise<import('graphql-upload').FileUpload>;
};

/** Dog Type */
export type Dog = {
  __typename?: 'Dog';
  id: Scalars['ID'];
  name: Scalars['String'];
  owner?: Maybe<Human>;
};

/** Human Type */
export type Human = {
  __typename?: 'Human';
  id: Scalars['ID'];
  /** Human Name */
  name: Scalars['String'];
  dogs?: Maybe<Array<Dog>>;
  /** @deprecated Field no longer supported */
  fieldWithArg?: Maybe<Scalars['Int']>;
};

/** Human Type */
export type HumanFieldWithArgArgs = {
  a?: Maybe<Scalars['String']>;
};

/** Query Type */
export type Query = {
  __typename?: 'Query';
  /** Expected Error! */
  expectedError: Scalars['Boolean'];
  expectedNullableError?: Maybe<Scalars['Boolean']>;
  thirdTry: Scalars['Boolean'];
  dogs: Array<Dog>;
  time: Scalars['String'];
  stringList: Array<Scalars['String']>;
  humans: Array<Human>;
  human1: Human;
  human1Other: Human;
  paginatedHumans: HumansConnection;
  emptyScalarArray: Array<Scalars['Int']>;
  emptyHumanArray: Array<Human>;
};

/** Query Type */
export type QueryPaginatedHumansArgs = {
  input: ConnectionArgs;
};

/** Mutation */
export type Mutation = {
  __typename?: 'Mutation';
  renameDog?: Maybe<Dog>;
  renameHuman?: Maybe<Human>;
  other?: Maybe<Scalars['Int']>;
  createHuman: Human;
  sendNotification: Scalars['Boolean'];
  uploadFile: Scalars['String'];
};

/** Mutation */
export type MutationRenameDogArgs = {
  id: Scalars['ID'];
  name: Scalars['String'];
};

/** Mutation */
export type MutationRenameHumanArgs = {
  id: Scalars['ID'];
  name: Scalars['String'];
};

/** Mutation */
export type MutationOtherArgs = {
  arg: InputTypeExample;
};

/** Mutation */
export type MutationCreateHumanArgs = {
  id: Scalars['ID'];
  name: Scalars['String'];
};

/** Mutation */
export type MutationSendNotificationArgs = {
  message: Scalars['String'];
};

/** Mutation */
export type MutationUploadFileArgs = {
  file: Scalars['Upload'];
};

export type Subscription = {
  __typename?: 'Subscription';
  newNotification: Scalars['String'];
};

/** Input Type Example XD */
export type InputTypeExample = {
  a: Scalars['String'];
  other?: Maybe<Scalars['Int']>;
};

/** Humans Connection */
export type HumansConnection = {
  __typename?: 'HumansConnection';
  pageInfo: PageInfo;
  nodes: Array<Human>;
};

/** Page Info Object */
export type PageInfo = {
  __typename?: 'PageInfo';
  hasPreviousPage: Scalars['Boolean'];
  hasNextPage: Scalars['Boolean'];
  startCursor?: Maybe<Scalars['String']>;
  endCursor?: Maybe<Scalars['String']>;
};

/** ConnectionArgs description! */
export type ConnectionArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
};

export type Species = Human | Dog;

/** Dog Type */
export enum DogType {
  Big = 'Big',
  Small = 'Small',
  Other = 'Other',
}

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
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

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
  Dog: ResolverTypeWrapper<Dog>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  String: ResolverTypeWrapper<Scalars['String']>;
  Human: ResolverTypeWrapper<Human>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  Query: ResolverTypeWrapper<{}>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  Mutation: ResolverTypeWrapper<{}>;
  Subscription: ResolverTypeWrapper<{}>;
  inputTypeExample: InputTypeExample;
  HumansConnection: ResolverTypeWrapper<HumansConnection>;
  PageInfo: ResolverTypeWrapper<PageInfo>;
  ConnectionArgs: ConnectionArgs;
  Species: ResolversTypes['Human'] | ResolversTypes['Dog'];
  DogType: DogType;
  Upload: ResolverTypeWrapper<Scalars['Upload']>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Dog: Dog;
  ID: Scalars['ID'];
  String: Scalars['String'];
  Human: Human;
  Int: Scalars['Int'];
  Query: {};
  Boolean: Scalars['Boolean'];
  Mutation: {};
  Subscription: {};
  inputTypeExample: InputTypeExample;
  HumansConnection: HumansConnection;
  PageInfo: PageInfo;
  ConnectionArgs: ConnectionArgs;
  Species: ResolversParentTypes['Human'] | ResolversParentTypes['Dog'];
  Upload: Scalars['Upload'];
};

export type DogResolvers<
  ContextType = EZContext,
  ParentType extends ResolversParentTypes['Dog'] = ResolversParentTypes['Dog']
> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  owner?: Resolver<Maybe<ResolversTypes['Human']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type HumanResolvers<
  ContextType = EZContext,
  ParentType extends ResolversParentTypes['Human'] = ResolversParentTypes['Human']
> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  dogs?: Resolver<Maybe<Array<ResolversTypes['Dog']>>, ParentType, ContextType>;
  fieldWithArg?: Resolver<
    Maybe<ResolversTypes['Int']>,
    ParentType,
    ContextType,
    RequireFields<HumanFieldWithArgArgs, 'a'>
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<
  ContextType = EZContext,
  ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']
> = {
  expectedError?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  expectedNullableError?: Resolver<
    Maybe<ResolversTypes['Boolean']>,
    ParentType,
    ContextType
  >;
  thirdTry?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  dogs?: Resolver<Array<ResolversTypes['Dog']>, ParentType, ContextType>;
  time?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  stringList?: Resolver<
    Array<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  humans?: Resolver<Array<ResolversTypes['Human']>, ParentType, ContextType>;
  human1?: Resolver<ResolversTypes['Human'], ParentType, ContextType>;
  human1Other?: Resolver<ResolversTypes['Human'], ParentType, ContextType>;
  paginatedHumans?: Resolver<
    ResolversTypes['HumansConnection'],
    ParentType,
    ContextType,
    RequireFields<QueryPaginatedHumansArgs, 'input'>
  >;
  emptyScalarArray?: Resolver<
    Array<ResolversTypes['Int']>,
    ParentType,
    ContextType
  >;
  emptyHumanArray?: Resolver<
    Array<ResolversTypes['Human']>,
    ParentType,
    ContextType
  >;
};

export type MutationResolvers<
  ContextType = EZContext,
  ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']
> = {
  renameDog?: Resolver<
    Maybe<ResolversTypes['Dog']>,
    ParentType,
    ContextType,
    RequireFields<MutationRenameDogArgs, 'id' | 'name'>
  >;
  renameHuman?: Resolver<
    Maybe<ResolversTypes['Human']>,
    ParentType,
    ContextType,
    RequireFields<MutationRenameHumanArgs, 'id' | 'name'>
  >;
  other?: Resolver<
    Maybe<ResolversTypes['Int']>,
    ParentType,
    ContextType,
    RequireFields<MutationOtherArgs, 'arg'>
  >;
  createHuman?: Resolver<
    ResolversTypes['Human'],
    ParentType,
    ContextType,
    RequireFields<MutationCreateHumanArgs, 'id' | 'name'>
  >;
  sendNotification?: Resolver<
    ResolversTypes['Boolean'],
    ParentType,
    ContextType,
    RequireFields<MutationSendNotificationArgs, 'message'>
  >;
  uploadFile?: Resolver<
    ResolversTypes['String'],
    ParentType,
    ContextType,
    RequireFields<MutationUploadFileArgs, 'file'>
  >;
};

export type SubscriptionResolvers<
  ContextType = EZContext,
  ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']
> = {
  newNotification?: SubscriptionResolver<
    ResolversTypes['String'],
    'newNotification',
    ParentType,
    ContextType
  >;
};

export type HumansConnectionResolvers<
  ContextType = EZContext,
  ParentType extends ResolversParentTypes['HumansConnection'] = ResolversParentTypes['HumansConnection']
> = {
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  nodes?: Resolver<Array<ResolversTypes['Human']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PageInfoResolvers<
  ContextType = EZContext,
  ParentType extends ResolversParentTypes['PageInfo'] = ResolversParentTypes['PageInfo']
> = {
  hasPreviousPage?: Resolver<
    ResolversTypes['Boolean'],
    ParentType,
    ContextType
  >;
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  startCursor?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  endCursor?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SpeciesResolvers<
  ContextType = EZContext,
  ParentType extends ResolversParentTypes['Species'] = ResolversParentTypes['Species']
> = {
  __resolveType: TypeResolveFn<'Human' | 'Dog', ParentType, ContextType>;
};

export interface UploadScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes['Upload'], any> {
  name: 'Upload';
}

export type Resolvers<ContextType = EZContext> = {
  Dog?: DogResolvers<ContextType>;
  Human?: HumanResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  HumansConnection?: HumansConnectionResolvers<ContextType>;
  PageInfo?: PageInfoResolvers<ContextType>;
  Species?: SpeciesResolvers<ContextType>;
  Upload?: GraphQLScalarType;
};

declare module 'graphql-ez' {
  interface EZResolvers extends Resolvers<import('graphql-ez').EZContext> {}
}
