import type { GraphQLResolveInfo } from 'graphql';
import type { EZContext } from 'graphql-ez';
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
};

export type Query = {
  __typename?: 'Query';
  page: Page;
};

export type QueryPageArgs = {
  a?: InputMaybe<Scalars['String']>;
};

export type Page = {
  __typename?: 'Page';
  pageBuilder: PageBuilder;
};

export type PageBuilder = {
  __typename?: 'PageBuilder';
  modules: Array<Module>;
};

export type Foo = {
  __typename?: 'Foo';
  bar?: Maybe<Scalars['String']>;
};

export type A = {
  __typename?: 'A';
  foo?: Maybe<Foo>;
};

export type B = {
  __typename?: 'B';
  foo?: Maybe<Foo>;
};

export type C = {
  __typename?: 'C';
  foo?: Maybe<Foo>;
};

export type Module = A | B | C;

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
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Scalars['String']>;
  Page: ResolverTypeWrapper<Page>;
  PageBuilder: ResolverTypeWrapper<
    Omit<PageBuilder, 'modules'> & { modules: Array<ResolversTypes['Module']> }
  >;
  Foo: ResolverTypeWrapper<Foo>;
  A: ResolverTypeWrapper<A>;
  B: ResolverTypeWrapper<B>;
  C: ResolverTypeWrapper<C>;
  Module: ResolversTypes['A'] | ResolversTypes['B'] | ResolversTypes['C'];
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Query: {};
  String: Scalars['String'];
  Page: Page;
  PageBuilder: Omit<PageBuilder, 'modules'> & {
    modules: Array<ResolversParentTypes['Module']>;
  };
  Foo: Foo;
  A: A;
  B: B;
  C: C;
  Module:
    | ResolversParentTypes['A']
    | ResolversParentTypes['B']
    | ResolversParentTypes['C'];
  Boolean: Scalars['Boolean'];
};

export type QueryResolvers<
  ContextType = EZContext,
  ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']
> = {
  page?: Resolver<
    ResolversTypes['Page'],
    ParentType,
    ContextType,
    RequireFields<QueryPageArgs, never>
  >;
};

export type PageResolvers<
  ContextType = EZContext,
  ParentType extends ResolversParentTypes['Page'] = ResolversParentTypes['Page']
> = {
  pageBuilder?: Resolver<
    ResolversTypes['PageBuilder'],
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PageBuilderResolvers<
  ContextType = EZContext,
  ParentType extends ResolversParentTypes['PageBuilder'] = ResolversParentTypes['PageBuilder']
> = {
  modules?: Resolver<Array<ResolversTypes['Module']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FooResolvers<
  ContextType = EZContext,
  ParentType extends ResolversParentTypes['Foo'] = ResolversParentTypes['Foo']
> = {
  bar?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AResolvers<
  ContextType = EZContext,
  ParentType extends ResolversParentTypes['A'] = ResolversParentTypes['A']
> = {
  foo?: Resolver<Maybe<ResolversTypes['Foo']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BResolvers<
  ContextType = EZContext,
  ParentType extends ResolversParentTypes['B'] = ResolversParentTypes['B']
> = {
  foo?: Resolver<Maybe<ResolversTypes['Foo']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CResolvers<
  ContextType = EZContext,
  ParentType extends ResolversParentTypes['C'] = ResolversParentTypes['C']
> = {
  foo?: Resolver<Maybe<ResolversTypes['Foo']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ModuleResolvers<
  ContextType = EZContext,
  ParentType extends ResolversParentTypes['Module'] = ResolversParentTypes['Module']
> = {
  __resolveType: TypeResolveFn<'A' | 'B' | 'C', ParentType, ContextType>;
};

export type Resolvers<ContextType = EZContext> = {
  Query?: QueryResolvers<ContextType>;
  Page?: PageResolvers<ContextType>;
  PageBuilder?: PageBuilderResolvers<ContextType>;
  Foo?: FooResolvers<ContextType>;
  A?: AResolvers<ContextType>;
  B?: BResolvers<ContextType>;
  C?: CResolvers<ContextType>;
  Module?: ModuleResolvers<ContextType>;
};

declare module 'graphql-ez' {
  interface EZResolvers extends Resolvers<import('graphql-ez').EZContext> {}
}
