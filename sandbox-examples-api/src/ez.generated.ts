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
export type MakeOptional<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]: Maybe<T[SubKey]> };
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
} &
  { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: number;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** Integers that will have a value of 0 or more. */
  NonNegativeInt: number;
  /** A string that cannot be passed as an empty value */
  NonEmptyString: string;
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  DateTime: string | Date;
  /** A field whose value conforms to the standard internet email address format as specified in RFC822: https://www.w3.org/Protocols/rfc822/. */
  EmailAddress: string;
};

export type LoginInput = {
  email: Scalars['EmailAddress'];
};

export type RegisterInput = {
  email: Scalars['EmailAddress'];
};

export type AuthResult = {
  __typename?: 'AuthResult';
  user?: Maybe<User>;
  error?: Maybe<Scalars['String']>;
  token?: Maybe<Scalars['String']>;
};

export type Category = {
  __typename?: 'Category';
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  posts: PostsConnection;
};

export type CategoryPostsArgs = {
  input: CursorConnectionArgs;
};

export type Post = {
  __typename?: 'Post';
  id: Scalars['ID'];
  createdAt: Scalars['DateTime'];
  published: Scalars['Boolean'];
  title: Scalars['String'];
  category?: Maybe<Array<Category>>;
};

export type PostCreate = {
  title: Scalars['NonEmptyString'];
  category?: Maybe<Array<Scalars['String']>>;
};

export type PostUpdate = {
  id: Scalars['String'];
  title?: Maybe<Scalars['NonEmptyString']>;
  category?: Maybe<Array<Scalars['String']>>;
  published?: Maybe<Scalars['Boolean']>;
};

export type PostsConnection = {
  __typename?: 'PostsConnection';
  nodes: Array<Post>;
  pageInfo: CursorPageInfo;
};

export type UserRole = 'USER' | 'ADMIN';

export type User = {
  __typename?: 'User';
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  role: UserRole;
  email: Scalars['String'];
  /** Posts created by user */
  posts: PostsConnection;
};

export type UserPostsArgs = {
  input: CursorConnectionArgs;
};

export type CursorConnectionArgs = {
  first?: Maybe<Scalars['NonNegativeInt']>;
  after?: Maybe<Scalars['NonEmptyString']>;
  last?: Maybe<Scalars['NonNegativeInt']>;
  before?: Maybe<Scalars['NonEmptyString']>;
};

export type CursorPageInfo = {
  __typename?: 'CursorPageInfo';
  hasNextPage: Scalars['Boolean'];
  hasPreviousPage: Scalars['Boolean'];
  startCursor?: Maybe<Scalars['NonEmptyString']>;
  endCursor?: Maybe<Scalars['NonEmptyString']>;
};

export type Query = {
  __typename?: 'Query';
  hello: Scalars['String'];
  namesList: Array<Scalars['String']>;
  /** Current authenticated user */
  currentUser: AuthResult;
  /** Get all published posts */
  publicPosts: PostsConnection;
  /** Get all current created categories */
  postsCategories: Array<Category>;
};

export type QueryNamesListArgs = {
  n?: Maybe<Scalars['Int']>;
};

export type QueryPublicPostsArgs = {
  input: CursorConnectionArgs;
};

export type Mutation = {
  __typename?: 'Mutation';
  hello: Scalars['String'];
  /** Login user */
  login: AuthResult;
  /** Register user */
  register: AuthResult;
  /** [Authenticated] Create new post */
  createPost: Post;
  /** [Authenticated] Update existing post */
  updatePost: Post;
  /** [Authenticated] Remove own post */
  removeOwnPost: Scalars['Boolean'];
  setName: User;
};

export type MutationLoginArgs = {
  input: LoginInput;
};

export type MutationRegisterArgs = {
  input: RegisterInput;
};

export type MutationCreatePostArgs = {
  post: PostCreate;
};

export type MutationUpdatePostArgs = {
  post: PostUpdate;
};

export type MutationRemoveOwnPostArgs = {
  postId: Scalars['String'];
};

export type MutationSetNameArgs = {
  name: Scalars['String'];
};

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
  NonNegativeInt: ResolverTypeWrapper<Scalars['NonNegativeInt']>;
  NonEmptyString: ResolverTypeWrapper<Scalars['NonEmptyString']>;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']>;
  EmailAddress: ResolverTypeWrapper<Scalars['EmailAddress']>;
  LoginInput: LoginInput;
  RegisterInput: RegisterInput;
  AuthResult: ResolverTypeWrapper<AuthResult>;
  String: ResolverTypeWrapper<Scalars['String']>;
  Category: ResolverTypeWrapper<Category>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Post: ResolverTypeWrapper<Post>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  PostCreate: PostCreate;
  PostUpdate: PostUpdate;
  PostsConnection: ResolverTypeWrapper<PostsConnection>;
  UserRole: UserRole;
  User: ResolverTypeWrapper<User>;
  CursorConnectionArgs: CursorConnectionArgs;
  CursorPageInfo: ResolverTypeWrapper<CursorPageInfo>;
  Query: ResolverTypeWrapper<{}>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  Mutation: ResolverTypeWrapper<{}>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  NonNegativeInt: Scalars['NonNegativeInt'];
  NonEmptyString: Scalars['NonEmptyString'];
  DateTime: Scalars['DateTime'];
  EmailAddress: Scalars['EmailAddress'];
  LoginInput: LoginInput;
  RegisterInput: RegisterInput;
  AuthResult: AuthResult;
  String: Scalars['String'];
  Category: Category;
  ID: Scalars['ID'];
  Post: Post;
  Boolean: Scalars['Boolean'];
  PostCreate: PostCreate;
  PostUpdate: PostUpdate;
  PostsConnection: PostsConnection;
  User: User;
  CursorConnectionArgs: CursorConnectionArgs;
  CursorPageInfo: CursorPageInfo;
  Query: {};
  Int: Scalars['Int'];
  Mutation: {};
};

export interface NonNegativeIntScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes['NonNegativeInt'], any> {
  name: 'NonNegativeInt';
}

export interface NonEmptyStringScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes['NonEmptyString'], any> {
  name: 'NonEmptyString';
}

export interface DateTimeScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export interface EmailAddressScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes['EmailAddress'], any> {
  name: 'EmailAddress';
}

export type AuthResultResolvers<
  ContextType = EZContext,
  ParentType extends ResolversParentTypes['AuthResult'] = ResolversParentTypes['AuthResult']
> = {
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  token?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CategoryResolvers<
  ContextType = EZContext,
  ParentType extends ResolversParentTypes['Category'] = ResolversParentTypes['Category']
> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  posts?: Resolver<
    ResolversTypes['PostsConnection'],
    ParentType,
    ContextType,
    RequireFields<CategoryPostsArgs, 'input'>
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PostResolvers<
  ContextType = EZContext,
  ParentType extends ResolversParentTypes['Post'] = ResolversParentTypes['Post']
> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  published?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  category?: Resolver<
    Maybe<Array<ResolversTypes['Category']>>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PostsConnectionResolvers<
  ContextType = EZContext,
  ParentType extends ResolversParentTypes['PostsConnection'] = ResolversParentTypes['PostsConnection']
> = {
  nodes?: Resolver<Array<ResolversTypes['Post']>, ParentType, ContextType>;
  pageInfo?: Resolver<
    ResolversTypes['CursorPageInfo'],
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserResolvers<
  ContextType = EZContext,
  ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']
> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  role?: Resolver<ResolversTypes['UserRole'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  posts?: Resolver<
    ResolversTypes['PostsConnection'],
    ParentType,
    ContextType,
    RequireFields<UserPostsArgs, 'input'>
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CursorPageInfoResolvers<
  ContextType = EZContext,
  ParentType extends ResolversParentTypes['CursorPageInfo'] = ResolversParentTypes['CursorPageInfo']
> = {
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  hasPreviousPage?: Resolver<
    ResolversTypes['Boolean'],
    ParentType,
    ContextType
  >;
  startCursor?: Resolver<
    Maybe<ResolversTypes['NonEmptyString']>,
    ParentType,
    ContextType
  >;
  endCursor?: Resolver<
    Maybe<ResolversTypes['NonEmptyString']>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<
  ContextType = EZContext,
  ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']
> = {
  hello?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  namesList?: Resolver<
    Array<ResolversTypes['String']>,
    ParentType,
    ContextType,
    RequireFields<QueryNamesListArgs, 'n'>
  >;
  currentUser?: Resolver<ResolversTypes['AuthResult'], ParentType, ContextType>;
  publicPosts?: Resolver<
    ResolversTypes['PostsConnection'],
    ParentType,
    ContextType,
    RequireFields<QueryPublicPostsArgs, 'input'>
  >;
  postsCategories?: Resolver<
    Array<ResolversTypes['Category']>,
    ParentType,
    ContextType
  >;
};

export type MutationResolvers<
  ContextType = EZContext,
  ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']
> = {
  hello?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  login?: Resolver<
    ResolversTypes['AuthResult'],
    ParentType,
    ContextType,
    RequireFields<MutationLoginArgs, 'input'>
  >;
  register?: Resolver<
    ResolversTypes['AuthResult'],
    ParentType,
    ContextType,
    RequireFields<MutationRegisterArgs, 'input'>
  >;
  createPost?: Resolver<
    ResolversTypes['Post'],
    ParentType,
    ContextType,
    RequireFields<MutationCreatePostArgs, 'post'>
  >;
  updatePost?: Resolver<
    ResolversTypes['Post'],
    ParentType,
    ContextType,
    RequireFields<MutationUpdatePostArgs, 'post'>
  >;
  removeOwnPost?: Resolver<
    ResolversTypes['Boolean'],
    ParentType,
    ContextType,
    RequireFields<MutationRemoveOwnPostArgs, 'postId'>
  >;
  setName?: Resolver<
    ResolversTypes['User'],
    ParentType,
    ContextType,
    RequireFields<MutationSetNameArgs, 'name'>
  >;
};

export type Resolvers<ContextType = EZContext> = {
  NonNegativeInt?: GraphQLScalarType;
  NonEmptyString?: GraphQLScalarType;
  DateTime?: GraphQLScalarType;
  EmailAddress?: GraphQLScalarType;
  AuthResult?: AuthResultResolvers<ContextType>;
  Category?: CategoryResolvers<ContextType>;
  Post?: PostResolvers<ContextType>;
  PostsConnection?: PostsConnectionResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  CursorPageInfo?: CursorPageInfoResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
};

declare module 'graphql-ez' {
  interface EZResolvers extends Resolvers<import('graphql-ez').EZContext> {}
}
