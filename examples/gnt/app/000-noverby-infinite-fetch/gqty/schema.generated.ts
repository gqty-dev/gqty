/**
 * GQty AUTO-GENERATED CODE: PLEASE DO NOT MODIFY MANUALLY
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
  _text: any;
  bigint: any;
  bytea: any;
  citext: any;
  jsonb: any;
  timestamptz: string;
  uuid: string;
}

/** Boolean expression to compare columns of type "Boolean". All fields are combined with logical 'AND'. */
export interface Boolean_comparison_exp {
  _eq?: InputMaybe<Scalars['Boolean']>;
  _gt?: InputMaybe<Scalars['Boolean']>;
  _gte?: InputMaybe<Scalars['Boolean']>;
  _in?: InputMaybe<Array<Scalars['Boolean']>>;
  _is_null?: InputMaybe<Scalars['Boolean']>;
  _lt?: InputMaybe<Scalars['Boolean']>;
  _lte?: InputMaybe<Scalars['Boolean']>;
  _neq?: InputMaybe<Scalars['Boolean']>;
  _nin?: InputMaybe<Array<Scalars['Boolean']>>;
}

/** Boolean expression to compare columns of type "Int". All fields are combined with logical 'AND'. */
export interface Int_comparison_exp {
  _eq?: InputMaybe<Scalars['Int']>;
  _gt?: InputMaybe<Scalars['Int']>;
  _gte?: InputMaybe<Scalars['Int']>;
  _in?: InputMaybe<Array<Scalars['Int']>>;
  _is_null?: InputMaybe<Scalars['Boolean']>;
  _lt?: InputMaybe<Scalars['Int']>;
  _lte?: InputMaybe<Scalars['Int']>;
  _neq?: InputMaybe<Scalars['Int']>;
  _nin?: InputMaybe<Array<Scalars['Int']>>;
}

/** Boolean expression to compare columns of type "String". All fields are combined with logical 'AND'. */
export interface String_comparison_exp {
  _eq?: InputMaybe<Scalars['String']>;
  _gt?: InputMaybe<Scalars['String']>;
  _gte?: InputMaybe<Scalars['String']>;
  /** does the column match the given case-insensitive pattern */
  _ilike?: InputMaybe<Scalars['String']>;
  _in?: InputMaybe<Array<Scalars['String']>>;
  /** does the column match the given POSIX regular expression, case insensitive */
  _iregex?: InputMaybe<Scalars['String']>;
  _is_null?: InputMaybe<Scalars['Boolean']>;
  /** does the column match the given pattern */
  _like?: InputMaybe<Scalars['String']>;
  _lt?: InputMaybe<Scalars['String']>;
  _lte?: InputMaybe<Scalars['String']>;
  _neq?: InputMaybe<Scalars['String']>;
  /** does the column NOT match the given case-insensitive pattern */
  _nilike?: InputMaybe<Scalars['String']>;
  _nin?: InputMaybe<Array<Scalars['String']>>;
  /** does the column NOT match the given POSIX regular expression, case insensitive */
  _niregex?: InputMaybe<Scalars['String']>;
  /** does the column NOT match the given pattern */
  _nlike?: InputMaybe<Scalars['String']>;
  /** does the column NOT match the given POSIX regular expression, case sensitive */
  _nregex?: InputMaybe<Scalars['String']>;
  /** does the column NOT match the given SQL regular expression */
  _nsimilar?: InputMaybe<Scalars['String']>;
  /** does the column match the given POSIX regular expression, case sensitive */
  _regex?: InputMaybe<Scalars['String']>;
  /** does the column match the given SQL regular expression */
  _similar?: InputMaybe<Scalars['String']>;
}

/** Boolean expression to compare columns of type "_text". All fields are combined with logical 'AND'. */
export interface _text_comparison_exp {
  _eq?: InputMaybe<Scalars['_text']>;
  _gt?: InputMaybe<Scalars['_text']>;
  _gte?: InputMaybe<Scalars['_text']>;
  _in?: InputMaybe<Array<Scalars['_text']>>;
  _is_null?: InputMaybe<Scalars['Boolean']>;
  _lt?: InputMaybe<Scalars['_text']>;
  _lte?: InputMaybe<Scalars['_text']>;
  _neq?: InputMaybe<Scalars['_text']>;
  _nin?: InputMaybe<Array<Scalars['_text']>>;
}

/** append existing jsonb value of filtered columns with new jsonb value */
export interface authProviderRequests_append_input {
  options?: InputMaybe<Scalars['jsonb']>;
}

/** Boolean expression to filter rows from the table "auth.provider_requests". All fields are combined with a logical 'AND'. */
export interface authProviderRequests_bool_exp {
  _and?: InputMaybe<Array<authProviderRequests_bool_exp>>;
  _not?: InputMaybe<authProviderRequests_bool_exp>;
  _or?: InputMaybe<Array<authProviderRequests_bool_exp>>;
  id?: InputMaybe<uuid_comparison_exp>;
  options?: InputMaybe<jsonb_comparison_exp>;
}

/** unique or primary key constraints on table "auth.provider_requests" */
export enum authProviderRequests_constraint {
  /** unique or primary key constraint on columns "id" */
  provider_requests_pkey = 'provider_requests_pkey',
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export interface authProviderRequests_delete_at_path_input {
  options?: InputMaybe<Array<Scalars['String']>>;
}

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export interface authProviderRequests_delete_elem_input {
  options?: InputMaybe<Scalars['Int']>;
}

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export interface authProviderRequests_delete_key_input {
  options?: InputMaybe<Scalars['String']>;
}

/** input type for inserting data into table "auth.provider_requests" */
export interface authProviderRequests_insert_input {
  id?: InputMaybe<Scalars['uuid']>;
  options?: InputMaybe<Scalars['jsonb']>;
}

/** on_conflict condition type for table "auth.provider_requests" */
export interface authProviderRequests_on_conflict {
  constraint: authProviderRequests_constraint;
  update_columns?: Array<authProviderRequests_update_column>;
  where?: InputMaybe<authProviderRequests_bool_exp>;
}

/** Ordering options when selecting data from "auth.provider_requests". */
export interface authProviderRequests_order_by {
  id?: InputMaybe<order_by>;
  options?: InputMaybe<order_by>;
}

/** primary key columns input for table: auth.provider_requests */
export interface authProviderRequests_pk_columns_input {
  id: Scalars['uuid'];
}

/** prepend existing jsonb value of filtered columns with new jsonb value */
export interface authProviderRequests_prepend_input {
  options?: InputMaybe<Scalars['jsonb']>;
}

/** select columns of table "auth.provider_requests" */
export enum authProviderRequests_select_column {
  /** column name */
  id = 'id',
  /** column name */
  options = 'options',
}

/** input type for updating data in table "auth.provider_requests" */
export interface authProviderRequests_set_input {
  id?: InputMaybe<Scalars['uuid']>;
  options?: InputMaybe<Scalars['jsonb']>;
}

/** Streaming cursor of the table "authProviderRequests" */
export interface authProviderRequests_stream_cursor_input {
  /** Stream column input with initial value */
  initial_value: authProviderRequests_stream_cursor_value_input;
  /** cursor ordering */
  ordering?: InputMaybe<cursor_ordering>;
}

/** Initial value of the column from where the streaming should start */
export interface authProviderRequests_stream_cursor_value_input {
  id?: InputMaybe<Scalars['uuid']>;
  options?: InputMaybe<Scalars['jsonb']>;
}

/** update columns of table "auth.provider_requests" */
export enum authProviderRequests_update_column {
  /** column name */
  id = 'id',
  /** column name */
  options = 'options',
}

export interface authProviderRequests_updates {
  /** append existing jsonb value of filtered columns with new jsonb value */
  _append?: InputMaybe<authProviderRequests_append_input>;
  /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
  _delete_at_path?: InputMaybe<authProviderRequests_delete_at_path_input>;
  /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
  _delete_elem?: InputMaybe<authProviderRequests_delete_elem_input>;
  /** delete key/value pair or string element. key/value pairs are matched based on their key value */
  _delete_key?: InputMaybe<authProviderRequests_delete_key_input>;
  /** prepend existing jsonb value of filtered columns with new jsonb value */
  _prepend?: InputMaybe<authProviderRequests_prepend_input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<authProviderRequests_set_input>;
  where: authProviderRequests_bool_exp;
}

/** Boolean expression to filter rows from the table "auth.providers". All fields are combined with a logical 'AND'. */
export interface authProviders_bool_exp {
  _and?: InputMaybe<Array<authProviders_bool_exp>>;
  _not?: InputMaybe<authProviders_bool_exp>;
  _or?: InputMaybe<Array<authProviders_bool_exp>>;
  id?: InputMaybe<String_comparison_exp>;
  userProviders?: InputMaybe<authUserProviders_bool_exp>;
  userProviders_aggregate?: InputMaybe<authUserProviders_aggregate_bool_exp>;
}

/** unique or primary key constraints on table "auth.providers" */
export enum authProviders_constraint {
  /** unique or primary key constraint on columns "id" */
  providers_pkey = 'providers_pkey',
}

/** input type for inserting data into table "auth.providers" */
export interface authProviders_insert_input {
  id?: InputMaybe<Scalars['String']>;
  userProviders?: InputMaybe<authUserProviders_arr_rel_insert_input>;
}

/** input type for inserting object relation for remote table "auth.providers" */
export interface authProviders_obj_rel_insert_input {
  data: authProviders_insert_input;
  /** upsert condition */
  on_conflict?: InputMaybe<authProviders_on_conflict>;
}

/** on_conflict condition type for table "auth.providers" */
export interface authProviders_on_conflict {
  constraint: authProviders_constraint;
  update_columns?: Array<authProviders_update_column>;
  where?: InputMaybe<authProviders_bool_exp>;
}

/** Ordering options when selecting data from "auth.providers". */
export interface authProviders_order_by {
  id?: InputMaybe<order_by>;
  userProviders_aggregate?: InputMaybe<authUserProviders_aggregate_order_by>;
}

/** primary key columns input for table: auth.providers */
export interface authProviders_pk_columns_input {
  id: Scalars['String'];
}

/** select columns of table "auth.providers" */
export enum authProviders_select_column {
  /** column name */
  id = 'id',
}

/** input type for updating data in table "auth.providers" */
export interface authProviders_set_input {
  id?: InputMaybe<Scalars['String']>;
}

/** Streaming cursor of the table "authProviders" */
export interface authProviders_stream_cursor_input {
  /** Stream column input with initial value */
  initial_value: authProviders_stream_cursor_value_input;
  /** cursor ordering */
  ordering?: InputMaybe<cursor_ordering>;
}

/** Initial value of the column from where the streaming should start */
export interface authProviders_stream_cursor_value_input {
  id?: InputMaybe<Scalars['String']>;
}

/** update columns of table "auth.providers" */
export enum authProviders_update_column {
  /** column name */
  id = 'id',
}

export interface authProviders_updates {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<authProviders_set_input>;
  where: authProviders_bool_exp;
}

export interface authRefreshTokens_aggregate_bool_exp {
  count?: InputMaybe<authRefreshTokens_aggregate_bool_exp_count>;
}

export interface authRefreshTokens_aggregate_bool_exp_count {
  arguments?: InputMaybe<Array<authRefreshTokens_select_column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
  filter?: InputMaybe<authRefreshTokens_bool_exp>;
  predicate: Int_comparison_exp;
}

/** order by aggregate values of table "auth.refresh_tokens" */
export interface authRefreshTokens_aggregate_order_by {
  count?: InputMaybe<order_by>;
  max?: InputMaybe<authRefreshTokens_max_order_by>;
  min?: InputMaybe<authRefreshTokens_min_order_by>;
}

/** input type for inserting array relation for remote table "auth.refresh_tokens" */
export interface authRefreshTokens_arr_rel_insert_input {
  data: Array<authRefreshTokens_insert_input>;
  /** upsert condition */
  on_conflict?: InputMaybe<authRefreshTokens_on_conflict>;
}

/** Boolean expression to filter rows from the table "auth.refresh_tokens". All fields are combined with a logical 'AND'. */
export interface authRefreshTokens_bool_exp {
  _and?: InputMaybe<Array<authRefreshTokens_bool_exp>>;
  _not?: InputMaybe<authRefreshTokens_bool_exp>;
  _or?: InputMaybe<Array<authRefreshTokens_bool_exp>>;
  createdAt?: InputMaybe<timestamptz_comparison_exp>;
  expiresAt?: InputMaybe<timestamptz_comparison_exp>;
  refreshToken?: InputMaybe<uuid_comparison_exp>;
  refreshTokenHash?: InputMaybe<String_comparison_exp>;
  user?: InputMaybe<users_bool_exp>;
  userId?: InputMaybe<uuid_comparison_exp>;
}

/** unique or primary key constraints on table "auth.refresh_tokens" */
export enum authRefreshTokens_constraint {
  /** unique or primary key constraint on columns "refresh_token" */
  refresh_tokens_pkey = 'refresh_tokens_pkey',
}

/** input type for inserting data into table "auth.refresh_tokens" */
export interface authRefreshTokens_insert_input {
  createdAt?: InputMaybe<Scalars['timestamptz']>;
  expiresAt?: InputMaybe<Scalars['timestamptz']>;
  /** DEPRECATED: auto-generated refresh token id. Will be replaced by a genereric id column that will be used as a primary key, not the refresh token itself. Use refresh_token_hash instead. */
  refreshToken?: InputMaybe<Scalars['uuid']>;
  user?: InputMaybe<users_obj_rel_insert_input>;
  userId?: InputMaybe<Scalars['uuid']>;
}

/** order by max() on columns of table "auth.refresh_tokens" */
export interface authRefreshTokens_max_order_by {
  createdAt?: InputMaybe<order_by>;
  expiresAt?: InputMaybe<order_by>;
  /** DEPRECATED: auto-generated refresh token id. Will be replaced by a genereric id column that will be used as a primary key, not the refresh token itself. Use refresh_token_hash instead. */
  refreshToken?: InputMaybe<order_by>;
  refreshTokenHash?: InputMaybe<order_by>;
  userId?: InputMaybe<order_by>;
}

/** order by min() on columns of table "auth.refresh_tokens" */
export interface authRefreshTokens_min_order_by {
  createdAt?: InputMaybe<order_by>;
  expiresAt?: InputMaybe<order_by>;
  /** DEPRECATED: auto-generated refresh token id. Will be replaced by a genereric id column that will be used as a primary key, not the refresh token itself. Use refresh_token_hash instead. */
  refreshToken?: InputMaybe<order_by>;
  refreshTokenHash?: InputMaybe<order_by>;
  userId?: InputMaybe<order_by>;
}

/** on_conflict condition type for table "auth.refresh_tokens" */
export interface authRefreshTokens_on_conflict {
  constraint: authRefreshTokens_constraint;
  update_columns?: Array<authRefreshTokens_update_column>;
  where?: InputMaybe<authRefreshTokens_bool_exp>;
}

/** Ordering options when selecting data from "auth.refresh_tokens". */
export interface authRefreshTokens_order_by {
  createdAt?: InputMaybe<order_by>;
  expiresAt?: InputMaybe<order_by>;
  refreshToken?: InputMaybe<order_by>;
  refreshTokenHash?: InputMaybe<order_by>;
  user?: InputMaybe<users_order_by>;
  userId?: InputMaybe<order_by>;
}

/** primary key columns input for table: auth.refresh_tokens */
export interface authRefreshTokens_pk_columns_input {
  /** DEPRECATED: auto-generated refresh token id. Will be replaced by a genereric id column that will be used as a primary key, not the refresh token itself. Use refresh_token_hash instead. */
  refreshToken: Scalars['uuid'];
}

/** select columns of table "auth.refresh_tokens" */
export enum authRefreshTokens_select_column {
  /** column name */
  createdAt = 'createdAt',
  /** column name */
  expiresAt = 'expiresAt',
  /** column name */
  refreshToken = 'refreshToken',
  /** column name */
  refreshTokenHash = 'refreshTokenHash',
  /** column name */
  userId = 'userId',
}

/** input type for updating data in table "auth.refresh_tokens" */
export interface authRefreshTokens_set_input {
  createdAt?: InputMaybe<Scalars['timestamptz']>;
  expiresAt?: InputMaybe<Scalars['timestamptz']>;
  /** DEPRECATED: auto-generated refresh token id. Will be replaced by a genereric id column that will be used as a primary key, not the refresh token itself. Use refresh_token_hash instead. */
  refreshToken?: InputMaybe<Scalars['uuid']>;
  userId?: InputMaybe<Scalars['uuid']>;
}

/** Streaming cursor of the table "authRefreshTokens" */
export interface authRefreshTokens_stream_cursor_input {
  /** Stream column input with initial value */
  initial_value: authRefreshTokens_stream_cursor_value_input;
  /** cursor ordering */
  ordering?: InputMaybe<cursor_ordering>;
}

/** Initial value of the column from where the streaming should start */
export interface authRefreshTokens_stream_cursor_value_input {
  createdAt?: InputMaybe<Scalars['timestamptz']>;
  expiresAt?: InputMaybe<Scalars['timestamptz']>;
  /** DEPRECATED: auto-generated refresh token id. Will be replaced by a genereric id column that will be used as a primary key, not the refresh token itself. Use refresh_token_hash instead. */
  refreshToken?: InputMaybe<Scalars['uuid']>;
  refreshTokenHash?: InputMaybe<Scalars['String']>;
  userId?: InputMaybe<Scalars['uuid']>;
}

/** update columns of table "auth.refresh_tokens" */
export enum authRefreshTokens_update_column {
  /** column name */
  createdAt = 'createdAt',
  /** column name */
  expiresAt = 'expiresAt',
  /** column name */
  refreshToken = 'refreshToken',
  /** column name */
  userId = 'userId',
}

export interface authRefreshTokens_updates {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<authRefreshTokens_set_input>;
  where: authRefreshTokens_bool_exp;
}

/** Boolean expression to filter rows from the table "auth.roles". All fields are combined with a logical 'AND'. */
export interface authRoles_bool_exp {
  _and?: InputMaybe<Array<authRoles_bool_exp>>;
  _not?: InputMaybe<authRoles_bool_exp>;
  _or?: InputMaybe<Array<authRoles_bool_exp>>;
  role?: InputMaybe<String_comparison_exp>;
  userRoles?: InputMaybe<authUserRoles_bool_exp>;
  userRoles_aggregate?: InputMaybe<authUserRoles_aggregate_bool_exp>;
  usersByDefaultRole?: InputMaybe<users_bool_exp>;
  usersByDefaultRole_aggregate?: InputMaybe<users_aggregate_bool_exp>;
}

/** unique or primary key constraints on table "auth.roles" */
export enum authRoles_constraint {
  /** unique or primary key constraint on columns "role" */
  roles_pkey = 'roles_pkey',
}

/** input type for inserting data into table "auth.roles" */
export interface authRoles_insert_input {
  role?: InputMaybe<Scalars['String']>;
  userRoles?: InputMaybe<authUserRoles_arr_rel_insert_input>;
  usersByDefaultRole?: InputMaybe<users_arr_rel_insert_input>;
}

/** input type for inserting object relation for remote table "auth.roles" */
export interface authRoles_obj_rel_insert_input {
  data: authRoles_insert_input;
  /** upsert condition */
  on_conflict?: InputMaybe<authRoles_on_conflict>;
}

/** on_conflict condition type for table "auth.roles" */
export interface authRoles_on_conflict {
  constraint: authRoles_constraint;
  update_columns?: Array<authRoles_update_column>;
  where?: InputMaybe<authRoles_bool_exp>;
}

/** Ordering options when selecting data from "auth.roles". */
export interface authRoles_order_by {
  role?: InputMaybe<order_by>;
  userRoles_aggregate?: InputMaybe<authUserRoles_aggregate_order_by>;
  usersByDefaultRole_aggregate?: InputMaybe<users_aggregate_order_by>;
}

/** primary key columns input for table: auth.roles */
export interface authRoles_pk_columns_input {
  role: Scalars['String'];
}

/** select columns of table "auth.roles" */
export enum authRoles_select_column {
  /** column name */
  role = 'role',
}

/** input type for updating data in table "auth.roles" */
export interface authRoles_set_input {
  role?: InputMaybe<Scalars['String']>;
}

/** Streaming cursor of the table "authRoles" */
export interface authRoles_stream_cursor_input {
  /** Stream column input with initial value */
  initial_value: authRoles_stream_cursor_value_input;
  /** cursor ordering */
  ordering?: InputMaybe<cursor_ordering>;
}

/** Initial value of the column from where the streaming should start */
export interface authRoles_stream_cursor_value_input {
  role?: InputMaybe<Scalars['String']>;
}

/** update columns of table "auth.roles" */
export enum authRoles_update_column {
  /** column name */
  role = 'role',
}

export interface authRoles_updates {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<authRoles_set_input>;
  where: authRoles_bool_exp;
}

export interface authUserProviders_aggregate_bool_exp {
  count?: InputMaybe<authUserProviders_aggregate_bool_exp_count>;
}

export interface authUserProviders_aggregate_bool_exp_count {
  arguments?: InputMaybe<Array<authUserProviders_select_column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
  filter?: InputMaybe<authUserProviders_bool_exp>;
  predicate: Int_comparison_exp;
}

/** order by aggregate values of table "auth.user_providers" */
export interface authUserProviders_aggregate_order_by {
  count?: InputMaybe<order_by>;
  max?: InputMaybe<authUserProviders_max_order_by>;
  min?: InputMaybe<authUserProviders_min_order_by>;
}

/** input type for inserting array relation for remote table "auth.user_providers" */
export interface authUserProviders_arr_rel_insert_input {
  data: Array<authUserProviders_insert_input>;
  /** upsert condition */
  on_conflict?: InputMaybe<authUserProviders_on_conflict>;
}

/** Boolean expression to filter rows from the table "auth.user_providers". All fields are combined with a logical 'AND'. */
export interface authUserProviders_bool_exp {
  _and?: InputMaybe<Array<authUserProviders_bool_exp>>;
  _not?: InputMaybe<authUserProviders_bool_exp>;
  _or?: InputMaybe<Array<authUserProviders_bool_exp>>;
  accessToken?: InputMaybe<String_comparison_exp>;
  createdAt?: InputMaybe<timestamptz_comparison_exp>;
  id?: InputMaybe<uuid_comparison_exp>;
  provider?: InputMaybe<authProviders_bool_exp>;
  providerId?: InputMaybe<String_comparison_exp>;
  providerUserId?: InputMaybe<String_comparison_exp>;
  refreshToken?: InputMaybe<String_comparison_exp>;
  updatedAt?: InputMaybe<timestamptz_comparison_exp>;
  user?: InputMaybe<users_bool_exp>;
  userId?: InputMaybe<uuid_comparison_exp>;
}

/** unique or primary key constraints on table "auth.user_providers" */
export enum authUserProviders_constraint {
  /** unique or primary key constraint on columns "id" */
  user_providers_pkey = 'user_providers_pkey',
  /** unique or primary key constraint on columns "provider_id", "provider_user_id" */
  user_providers_provider_id_provider_user_id_key = 'user_providers_provider_id_provider_user_id_key',
  /** unique or primary key constraint on columns "provider_id", "user_id" */
  user_providers_user_id_provider_id_key = 'user_providers_user_id_provider_id_key',
}

/** input type for inserting data into table "auth.user_providers" */
export interface authUserProviders_insert_input {
  accessToken?: InputMaybe<Scalars['String']>;
  createdAt?: InputMaybe<Scalars['timestamptz']>;
  id?: InputMaybe<Scalars['uuid']>;
  provider?: InputMaybe<authProviders_obj_rel_insert_input>;
  providerId?: InputMaybe<Scalars['String']>;
  providerUserId?: InputMaybe<Scalars['String']>;
  refreshToken?: InputMaybe<Scalars['String']>;
  updatedAt?: InputMaybe<Scalars['timestamptz']>;
  user?: InputMaybe<users_obj_rel_insert_input>;
  userId?: InputMaybe<Scalars['uuid']>;
}

/** order by max() on columns of table "auth.user_providers" */
export interface authUserProviders_max_order_by {
  accessToken?: InputMaybe<order_by>;
  createdAt?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  providerId?: InputMaybe<order_by>;
  providerUserId?: InputMaybe<order_by>;
  refreshToken?: InputMaybe<order_by>;
  updatedAt?: InputMaybe<order_by>;
  userId?: InputMaybe<order_by>;
}

/** order by min() on columns of table "auth.user_providers" */
export interface authUserProviders_min_order_by {
  accessToken?: InputMaybe<order_by>;
  createdAt?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  providerId?: InputMaybe<order_by>;
  providerUserId?: InputMaybe<order_by>;
  refreshToken?: InputMaybe<order_by>;
  updatedAt?: InputMaybe<order_by>;
  userId?: InputMaybe<order_by>;
}

/** on_conflict condition type for table "auth.user_providers" */
export interface authUserProviders_on_conflict {
  constraint: authUserProviders_constraint;
  update_columns?: Array<authUserProviders_update_column>;
  where?: InputMaybe<authUserProviders_bool_exp>;
}

/** Ordering options when selecting data from "auth.user_providers". */
export interface authUserProviders_order_by {
  accessToken?: InputMaybe<order_by>;
  createdAt?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  provider?: InputMaybe<authProviders_order_by>;
  providerId?: InputMaybe<order_by>;
  providerUserId?: InputMaybe<order_by>;
  refreshToken?: InputMaybe<order_by>;
  updatedAt?: InputMaybe<order_by>;
  user?: InputMaybe<users_order_by>;
  userId?: InputMaybe<order_by>;
}

/** primary key columns input for table: auth.user_providers */
export interface authUserProviders_pk_columns_input {
  id: Scalars['uuid'];
}

/** select columns of table "auth.user_providers" */
export enum authUserProviders_select_column {
  /** column name */
  accessToken = 'accessToken',
  /** column name */
  createdAt = 'createdAt',
  /** column name */
  id = 'id',
  /** column name */
  providerId = 'providerId',
  /** column name */
  providerUserId = 'providerUserId',
  /** column name */
  refreshToken = 'refreshToken',
  /** column name */
  updatedAt = 'updatedAt',
  /** column name */
  userId = 'userId',
}

/** input type for updating data in table "auth.user_providers" */
export interface authUserProviders_set_input {
  accessToken?: InputMaybe<Scalars['String']>;
  createdAt?: InputMaybe<Scalars['timestamptz']>;
  id?: InputMaybe<Scalars['uuid']>;
  providerId?: InputMaybe<Scalars['String']>;
  providerUserId?: InputMaybe<Scalars['String']>;
  refreshToken?: InputMaybe<Scalars['String']>;
  updatedAt?: InputMaybe<Scalars['timestamptz']>;
  userId?: InputMaybe<Scalars['uuid']>;
}

/** Streaming cursor of the table "authUserProviders" */
export interface authUserProviders_stream_cursor_input {
  /** Stream column input with initial value */
  initial_value: authUserProviders_stream_cursor_value_input;
  /** cursor ordering */
  ordering?: InputMaybe<cursor_ordering>;
}

/** Initial value of the column from where the streaming should start */
export interface authUserProviders_stream_cursor_value_input {
  accessToken?: InputMaybe<Scalars['String']>;
  createdAt?: InputMaybe<Scalars['timestamptz']>;
  id?: InputMaybe<Scalars['uuid']>;
  providerId?: InputMaybe<Scalars['String']>;
  providerUserId?: InputMaybe<Scalars['String']>;
  refreshToken?: InputMaybe<Scalars['String']>;
  updatedAt?: InputMaybe<Scalars['timestamptz']>;
  userId?: InputMaybe<Scalars['uuid']>;
}

/** update columns of table "auth.user_providers" */
export enum authUserProviders_update_column {
  /** column name */
  accessToken = 'accessToken',
  /** column name */
  createdAt = 'createdAt',
  /** column name */
  id = 'id',
  /** column name */
  providerId = 'providerId',
  /** column name */
  providerUserId = 'providerUserId',
  /** column name */
  refreshToken = 'refreshToken',
  /** column name */
  updatedAt = 'updatedAt',
  /** column name */
  userId = 'userId',
}

export interface authUserProviders_updates {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<authUserProviders_set_input>;
  where: authUserProviders_bool_exp;
}

export interface authUserRoles_aggregate_bool_exp {
  count?: InputMaybe<authUserRoles_aggregate_bool_exp_count>;
}

export interface authUserRoles_aggregate_bool_exp_count {
  arguments?: InputMaybe<Array<authUserRoles_select_column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
  filter?: InputMaybe<authUserRoles_bool_exp>;
  predicate: Int_comparison_exp;
}

/** order by aggregate values of table "auth.user_roles" */
export interface authUserRoles_aggregate_order_by {
  count?: InputMaybe<order_by>;
  max?: InputMaybe<authUserRoles_max_order_by>;
  min?: InputMaybe<authUserRoles_min_order_by>;
}

/** input type for inserting array relation for remote table "auth.user_roles" */
export interface authUserRoles_arr_rel_insert_input {
  data: Array<authUserRoles_insert_input>;
  /** upsert condition */
  on_conflict?: InputMaybe<authUserRoles_on_conflict>;
}

/** Boolean expression to filter rows from the table "auth.user_roles". All fields are combined with a logical 'AND'. */
export interface authUserRoles_bool_exp {
  _and?: InputMaybe<Array<authUserRoles_bool_exp>>;
  _not?: InputMaybe<authUserRoles_bool_exp>;
  _or?: InputMaybe<Array<authUserRoles_bool_exp>>;
  createdAt?: InputMaybe<timestamptz_comparison_exp>;
  id?: InputMaybe<uuid_comparison_exp>;
  role?: InputMaybe<String_comparison_exp>;
  roleByRole?: InputMaybe<authRoles_bool_exp>;
  user?: InputMaybe<users_bool_exp>;
  userId?: InputMaybe<uuid_comparison_exp>;
}

/** unique or primary key constraints on table "auth.user_roles" */
export enum authUserRoles_constraint {
  /** unique or primary key constraint on columns "id" */
  user_roles_pkey = 'user_roles_pkey',
  /** unique or primary key constraint on columns "user_id", "role" */
  user_roles_user_id_role_key = 'user_roles_user_id_role_key',
}

/** input type for inserting data into table "auth.user_roles" */
export interface authUserRoles_insert_input {
  createdAt?: InputMaybe<Scalars['timestamptz']>;
  id?: InputMaybe<Scalars['uuid']>;
  role?: InputMaybe<Scalars['String']>;
  roleByRole?: InputMaybe<authRoles_obj_rel_insert_input>;
  user?: InputMaybe<users_obj_rel_insert_input>;
  userId?: InputMaybe<Scalars['uuid']>;
}

/** order by max() on columns of table "auth.user_roles" */
export interface authUserRoles_max_order_by {
  createdAt?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  role?: InputMaybe<order_by>;
  userId?: InputMaybe<order_by>;
}

/** order by min() on columns of table "auth.user_roles" */
export interface authUserRoles_min_order_by {
  createdAt?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  role?: InputMaybe<order_by>;
  userId?: InputMaybe<order_by>;
}

/** on_conflict condition type for table "auth.user_roles" */
export interface authUserRoles_on_conflict {
  constraint: authUserRoles_constraint;
  update_columns?: Array<authUserRoles_update_column>;
  where?: InputMaybe<authUserRoles_bool_exp>;
}

/** Ordering options when selecting data from "auth.user_roles". */
export interface authUserRoles_order_by {
  createdAt?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  role?: InputMaybe<order_by>;
  roleByRole?: InputMaybe<authRoles_order_by>;
  user?: InputMaybe<users_order_by>;
  userId?: InputMaybe<order_by>;
}

/** primary key columns input for table: auth.user_roles */
export interface authUserRoles_pk_columns_input {
  id: Scalars['uuid'];
}

/** select columns of table "auth.user_roles" */
export enum authUserRoles_select_column {
  /** column name */
  createdAt = 'createdAt',
  /** column name */
  id = 'id',
  /** column name */
  role = 'role',
  /** column name */
  userId = 'userId',
}

/** input type for updating data in table "auth.user_roles" */
export interface authUserRoles_set_input {
  createdAt?: InputMaybe<Scalars['timestamptz']>;
  id?: InputMaybe<Scalars['uuid']>;
  role?: InputMaybe<Scalars['String']>;
  userId?: InputMaybe<Scalars['uuid']>;
}

/** Streaming cursor of the table "authUserRoles" */
export interface authUserRoles_stream_cursor_input {
  /** Stream column input with initial value */
  initial_value: authUserRoles_stream_cursor_value_input;
  /** cursor ordering */
  ordering?: InputMaybe<cursor_ordering>;
}

/** Initial value of the column from where the streaming should start */
export interface authUserRoles_stream_cursor_value_input {
  createdAt?: InputMaybe<Scalars['timestamptz']>;
  id?: InputMaybe<Scalars['uuid']>;
  role?: InputMaybe<Scalars['String']>;
  userId?: InputMaybe<Scalars['uuid']>;
}

/** update columns of table "auth.user_roles" */
export enum authUserRoles_update_column {
  /** column name */
  createdAt = 'createdAt',
  /** column name */
  id = 'id',
  /** column name */
  role = 'role',
  /** column name */
  userId = 'userId',
}

export interface authUserRoles_updates {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<authUserRoles_set_input>;
  where: authUserRoles_bool_exp;
}

export interface authUserSecurityKeys_aggregate_bool_exp {
  count?: InputMaybe<authUserSecurityKeys_aggregate_bool_exp_count>;
}

export interface authUserSecurityKeys_aggregate_bool_exp_count {
  arguments?: InputMaybe<Array<authUserSecurityKeys_select_column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
  filter?: InputMaybe<authUserSecurityKeys_bool_exp>;
  predicate: Int_comparison_exp;
}

/** order by aggregate values of table "auth.user_security_keys" */
export interface authUserSecurityKeys_aggregate_order_by {
  avg?: InputMaybe<authUserSecurityKeys_avg_order_by>;
  count?: InputMaybe<order_by>;
  max?: InputMaybe<authUserSecurityKeys_max_order_by>;
  min?: InputMaybe<authUserSecurityKeys_min_order_by>;
  stddev?: InputMaybe<authUserSecurityKeys_stddev_order_by>;
  stddev_pop?: InputMaybe<authUserSecurityKeys_stddev_pop_order_by>;
  stddev_samp?: InputMaybe<authUserSecurityKeys_stddev_samp_order_by>;
  sum?: InputMaybe<authUserSecurityKeys_sum_order_by>;
  var_pop?: InputMaybe<authUserSecurityKeys_var_pop_order_by>;
  var_samp?: InputMaybe<authUserSecurityKeys_var_samp_order_by>;
  variance?: InputMaybe<authUserSecurityKeys_variance_order_by>;
}

/** input type for inserting array relation for remote table "auth.user_security_keys" */
export interface authUserSecurityKeys_arr_rel_insert_input {
  data: Array<authUserSecurityKeys_insert_input>;
  /** upsert condition */
  on_conflict?: InputMaybe<authUserSecurityKeys_on_conflict>;
}

/** order by avg() on columns of table "auth.user_security_keys" */
export interface authUserSecurityKeys_avg_order_by {
  counter?: InputMaybe<order_by>;
}

/** Boolean expression to filter rows from the table "auth.user_security_keys". All fields are combined with a logical 'AND'. */
export interface authUserSecurityKeys_bool_exp {
  _and?: InputMaybe<Array<authUserSecurityKeys_bool_exp>>;
  _not?: InputMaybe<authUserSecurityKeys_bool_exp>;
  _or?: InputMaybe<Array<authUserSecurityKeys_bool_exp>>;
  counter?: InputMaybe<bigint_comparison_exp>;
  credentialId?: InputMaybe<String_comparison_exp>;
  credentialPublicKey?: InputMaybe<bytea_comparison_exp>;
  id?: InputMaybe<uuid_comparison_exp>;
  nickname?: InputMaybe<String_comparison_exp>;
  transports?: InputMaybe<String_comparison_exp>;
  user?: InputMaybe<users_bool_exp>;
  userId?: InputMaybe<uuid_comparison_exp>;
}

/** unique or primary key constraints on table "auth.user_security_keys" */
export enum authUserSecurityKeys_constraint {
  /** unique or primary key constraint on columns "credential_id" */
  user_security_key_credential_id_key = 'user_security_key_credential_id_key',
  /** unique or primary key constraint on columns "id" */
  user_security_keys_pkey = 'user_security_keys_pkey',
}

/** input type for incrementing numeric columns in table "auth.user_security_keys" */
export interface authUserSecurityKeys_inc_input {
  counter?: InputMaybe<Scalars['bigint']>;
}

/** input type for inserting data into table "auth.user_security_keys" */
export interface authUserSecurityKeys_insert_input {
  counter?: InputMaybe<Scalars['bigint']>;
  credentialId?: InputMaybe<Scalars['String']>;
  credentialPublicKey?: InputMaybe<Scalars['bytea']>;
  id?: InputMaybe<Scalars['uuid']>;
  nickname?: InputMaybe<Scalars['String']>;
  transports?: InputMaybe<Scalars['String']>;
  user?: InputMaybe<users_obj_rel_insert_input>;
  userId?: InputMaybe<Scalars['uuid']>;
}

/** order by max() on columns of table "auth.user_security_keys" */
export interface authUserSecurityKeys_max_order_by {
  counter?: InputMaybe<order_by>;
  credentialId?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  nickname?: InputMaybe<order_by>;
  transports?: InputMaybe<order_by>;
  userId?: InputMaybe<order_by>;
}

/** order by min() on columns of table "auth.user_security_keys" */
export interface authUserSecurityKeys_min_order_by {
  counter?: InputMaybe<order_by>;
  credentialId?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  nickname?: InputMaybe<order_by>;
  transports?: InputMaybe<order_by>;
  userId?: InputMaybe<order_by>;
}

/** on_conflict condition type for table "auth.user_security_keys" */
export interface authUserSecurityKeys_on_conflict {
  constraint: authUserSecurityKeys_constraint;
  update_columns?: Array<authUserSecurityKeys_update_column>;
  where?: InputMaybe<authUserSecurityKeys_bool_exp>;
}

/** Ordering options when selecting data from "auth.user_security_keys". */
export interface authUserSecurityKeys_order_by {
  counter?: InputMaybe<order_by>;
  credentialId?: InputMaybe<order_by>;
  credentialPublicKey?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  nickname?: InputMaybe<order_by>;
  transports?: InputMaybe<order_by>;
  user?: InputMaybe<users_order_by>;
  userId?: InputMaybe<order_by>;
}

/** primary key columns input for table: auth.user_security_keys */
export interface authUserSecurityKeys_pk_columns_input {
  id: Scalars['uuid'];
}

/** select columns of table "auth.user_security_keys" */
export enum authUserSecurityKeys_select_column {
  /** column name */
  counter = 'counter',
  /** column name */
  credentialId = 'credentialId',
  /** column name */
  credentialPublicKey = 'credentialPublicKey',
  /** column name */
  id = 'id',
  /** column name */
  nickname = 'nickname',
  /** column name */
  transports = 'transports',
  /** column name */
  userId = 'userId',
}

/** input type for updating data in table "auth.user_security_keys" */
export interface authUserSecurityKeys_set_input {
  counter?: InputMaybe<Scalars['bigint']>;
  credentialId?: InputMaybe<Scalars['String']>;
  credentialPublicKey?: InputMaybe<Scalars['bytea']>;
  id?: InputMaybe<Scalars['uuid']>;
  nickname?: InputMaybe<Scalars['String']>;
  transports?: InputMaybe<Scalars['String']>;
  userId?: InputMaybe<Scalars['uuid']>;
}

/** order by stddev() on columns of table "auth.user_security_keys" */
export interface authUserSecurityKeys_stddev_order_by {
  counter?: InputMaybe<order_by>;
}

/** order by stddev_pop() on columns of table "auth.user_security_keys" */
export interface authUserSecurityKeys_stddev_pop_order_by {
  counter?: InputMaybe<order_by>;
}

/** order by stddev_samp() on columns of table "auth.user_security_keys" */
export interface authUserSecurityKeys_stddev_samp_order_by {
  counter?: InputMaybe<order_by>;
}

/** Streaming cursor of the table "authUserSecurityKeys" */
export interface authUserSecurityKeys_stream_cursor_input {
  /** Stream column input with initial value */
  initial_value: authUserSecurityKeys_stream_cursor_value_input;
  /** cursor ordering */
  ordering?: InputMaybe<cursor_ordering>;
}

/** Initial value of the column from where the streaming should start */
export interface authUserSecurityKeys_stream_cursor_value_input {
  counter?: InputMaybe<Scalars['bigint']>;
  credentialId?: InputMaybe<Scalars['String']>;
  credentialPublicKey?: InputMaybe<Scalars['bytea']>;
  id?: InputMaybe<Scalars['uuid']>;
  nickname?: InputMaybe<Scalars['String']>;
  transports?: InputMaybe<Scalars['String']>;
  userId?: InputMaybe<Scalars['uuid']>;
}

/** order by sum() on columns of table "auth.user_security_keys" */
export interface authUserSecurityKeys_sum_order_by {
  counter?: InputMaybe<order_by>;
}

/** update columns of table "auth.user_security_keys" */
export enum authUserSecurityKeys_update_column {
  /** column name */
  counter = 'counter',
  /** column name */
  credentialId = 'credentialId',
  /** column name */
  credentialPublicKey = 'credentialPublicKey',
  /** column name */
  id = 'id',
  /** column name */
  nickname = 'nickname',
  /** column name */
  transports = 'transports',
  /** column name */
  userId = 'userId',
}

export interface authUserSecurityKeys_updates {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<authUserSecurityKeys_inc_input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<authUserSecurityKeys_set_input>;
  where: authUserSecurityKeys_bool_exp;
}

/** order by var_pop() on columns of table "auth.user_security_keys" */
export interface authUserSecurityKeys_var_pop_order_by {
  counter?: InputMaybe<order_by>;
}

/** order by var_samp() on columns of table "auth.user_security_keys" */
export interface authUserSecurityKeys_var_samp_order_by {
  counter?: InputMaybe<order_by>;
}

/** order by variance() on columns of table "auth.user_security_keys" */
export interface authUserSecurityKeys_variance_order_by {
  counter?: InputMaybe<order_by>;
}

/** Boolean expression to compare columns of type "bigint". All fields are combined with logical 'AND'. */
export interface bigint_comparison_exp {
  _eq?: InputMaybe<Scalars['bigint']>;
  _gt?: InputMaybe<Scalars['bigint']>;
  _gte?: InputMaybe<Scalars['bigint']>;
  _in?: InputMaybe<Array<Scalars['bigint']>>;
  _is_null?: InputMaybe<Scalars['Boolean']>;
  _lt?: InputMaybe<Scalars['bigint']>;
  _lte?: InputMaybe<Scalars['bigint']>;
  _neq?: InputMaybe<Scalars['bigint']>;
  _nin?: InputMaybe<Array<Scalars['bigint']>>;
}

/** Boolean expression to filter rows from the table "storage.buckets". All fields are combined with a logical 'AND'. */
export interface buckets_bool_exp {
  _and?: InputMaybe<Array<buckets_bool_exp>>;
  _not?: InputMaybe<buckets_bool_exp>;
  _or?: InputMaybe<Array<buckets_bool_exp>>;
  cacheControl?: InputMaybe<String_comparison_exp>;
  createdAt?: InputMaybe<timestamptz_comparison_exp>;
  downloadExpiration?: InputMaybe<Int_comparison_exp>;
  files?: InputMaybe<files_bool_exp>;
  files_aggregate?: InputMaybe<files_aggregate_bool_exp>;
  id?: InputMaybe<String_comparison_exp>;
  maxUploadFileSize?: InputMaybe<Int_comparison_exp>;
  minUploadFileSize?: InputMaybe<Int_comparison_exp>;
  presignedUrlsEnabled?: InputMaybe<Boolean_comparison_exp>;
  updatedAt?: InputMaybe<timestamptz_comparison_exp>;
}

/** unique or primary key constraints on table "storage.buckets" */
export enum buckets_constraint {
  /** unique or primary key constraint on columns "id" */
  buckets_pkey = 'buckets_pkey',
}

/** input type for incrementing numeric columns in table "storage.buckets" */
export interface buckets_inc_input {
  downloadExpiration?: InputMaybe<Scalars['Int']>;
  maxUploadFileSize?: InputMaybe<Scalars['Int']>;
  minUploadFileSize?: InputMaybe<Scalars['Int']>;
}

/** input type for inserting data into table "storage.buckets" */
export interface buckets_insert_input {
  cacheControl?: InputMaybe<Scalars['String']>;
  createdAt?: InputMaybe<Scalars['timestamptz']>;
  downloadExpiration?: InputMaybe<Scalars['Int']>;
  files?: InputMaybe<files_arr_rel_insert_input>;
  id?: InputMaybe<Scalars['String']>;
  maxUploadFileSize?: InputMaybe<Scalars['Int']>;
  minUploadFileSize?: InputMaybe<Scalars['Int']>;
  presignedUrlsEnabled?: InputMaybe<Scalars['Boolean']>;
  updatedAt?: InputMaybe<Scalars['timestamptz']>;
}

/** input type for inserting object relation for remote table "storage.buckets" */
export interface buckets_obj_rel_insert_input {
  data: buckets_insert_input;
  /** upsert condition */
  on_conflict?: InputMaybe<buckets_on_conflict>;
}

/** on_conflict condition type for table "storage.buckets" */
export interface buckets_on_conflict {
  constraint: buckets_constraint;
  update_columns?: Array<buckets_update_column>;
  where?: InputMaybe<buckets_bool_exp>;
}

/** Ordering options when selecting data from "storage.buckets". */
export interface buckets_order_by {
  cacheControl?: InputMaybe<order_by>;
  createdAt?: InputMaybe<order_by>;
  downloadExpiration?: InputMaybe<order_by>;
  files_aggregate?: InputMaybe<files_aggregate_order_by>;
  id?: InputMaybe<order_by>;
  maxUploadFileSize?: InputMaybe<order_by>;
  minUploadFileSize?: InputMaybe<order_by>;
  presignedUrlsEnabled?: InputMaybe<order_by>;
  updatedAt?: InputMaybe<order_by>;
}

/** primary key columns input for table: storage.buckets */
export interface buckets_pk_columns_input {
  id: Scalars['String'];
}

/** select columns of table "storage.buckets" */
export enum buckets_select_column {
  /** column name */
  cacheControl = 'cacheControl',
  /** column name */
  createdAt = 'createdAt',
  /** column name */
  downloadExpiration = 'downloadExpiration',
  /** column name */
  id = 'id',
  /** column name */
  maxUploadFileSize = 'maxUploadFileSize',
  /** column name */
  minUploadFileSize = 'minUploadFileSize',
  /** column name */
  presignedUrlsEnabled = 'presignedUrlsEnabled',
  /** column name */
  updatedAt = 'updatedAt',
}

/** input type for updating data in table "storage.buckets" */
export interface buckets_set_input {
  cacheControl?: InputMaybe<Scalars['String']>;
  createdAt?: InputMaybe<Scalars['timestamptz']>;
  downloadExpiration?: InputMaybe<Scalars['Int']>;
  id?: InputMaybe<Scalars['String']>;
  maxUploadFileSize?: InputMaybe<Scalars['Int']>;
  minUploadFileSize?: InputMaybe<Scalars['Int']>;
  presignedUrlsEnabled?: InputMaybe<Scalars['Boolean']>;
  updatedAt?: InputMaybe<Scalars['timestamptz']>;
}

/** Streaming cursor of the table "buckets" */
export interface buckets_stream_cursor_input {
  /** Stream column input with initial value */
  initial_value: buckets_stream_cursor_value_input;
  /** cursor ordering */
  ordering?: InputMaybe<cursor_ordering>;
}

/** Initial value of the column from where the streaming should start */
export interface buckets_stream_cursor_value_input {
  cacheControl?: InputMaybe<Scalars['String']>;
  createdAt?: InputMaybe<Scalars['timestamptz']>;
  downloadExpiration?: InputMaybe<Scalars['Int']>;
  id?: InputMaybe<Scalars['String']>;
  maxUploadFileSize?: InputMaybe<Scalars['Int']>;
  minUploadFileSize?: InputMaybe<Scalars['Int']>;
  presignedUrlsEnabled?: InputMaybe<Scalars['Boolean']>;
  updatedAt?: InputMaybe<Scalars['timestamptz']>;
}

/** update columns of table "storage.buckets" */
export enum buckets_update_column {
  /** column name */
  cacheControl = 'cacheControl',
  /** column name */
  createdAt = 'createdAt',
  /** column name */
  downloadExpiration = 'downloadExpiration',
  /** column name */
  id = 'id',
  /** column name */
  maxUploadFileSize = 'maxUploadFileSize',
  /** column name */
  minUploadFileSize = 'minUploadFileSize',
  /** column name */
  presignedUrlsEnabled = 'presignedUrlsEnabled',
  /** column name */
  updatedAt = 'updatedAt',
}

export interface buckets_updates {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<buckets_inc_input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<buckets_set_input>;
  where: buckets_bool_exp;
}

/** Boolean expression to compare columns of type "bytea". All fields are combined with logical 'AND'. */
export interface bytea_comparison_exp {
  _eq?: InputMaybe<Scalars['bytea']>;
  _gt?: InputMaybe<Scalars['bytea']>;
  _gte?: InputMaybe<Scalars['bytea']>;
  _in?: InputMaybe<Array<Scalars['bytea']>>;
  _is_null?: InputMaybe<Scalars['Boolean']>;
  _lt?: InputMaybe<Scalars['bytea']>;
  _lte?: InputMaybe<Scalars['bytea']>;
  _neq?: InputMaybe<Scalars['bytea']>;
  _nin?: InputMaybe<Array<Scalars['bytea']>>;
}

export interface checkUnique_nodes_args {
  mime?: InputMaybe<Scalars['String']>;
}

/** Boolean expression to compare columns of type "citext". All fields are combined with logical 'AND'. */
export interface citext_comparison_exp {
  _eq?: InputMaybe<Scalars['citext']>;
  _gt?: InputMaybe<Scalars['citext']>;
  _gte?: InputMaybe<Scalars['citext']>;
  /** does the column match the given case-insensitive pattern */
  _ilike?: InputMaybe<Scalars['citext']>;
  _in?: InputMaybe<Array<Scalars['citext']>>;
  /** does the column match the given POSIX regular expression, case insensitive */
  _iregex?: InputMaybe<Scalars['citext']>;
  _is_null?: InputMaybe<Scalars['Boolean']>;
  /** does the column match the given pattern */
  _like?: InputMaybe<Scalars['citext']>;
  _lt?: InputMaybe<Scalars['citext']>;
  _lte?: InputMaybe<Scalars['citext']>;
  _neq?: InputMaybe<Scalars['citext']>;
  /** does the column NOT match the given case-insensitive pattern */
  _nilike?: InputMaybe<Scalars['citext']>;
  _nin?: InputMaybe<Array<Scalars['citext']>>;
  /** does the column NOT match the given POSIX regular expression, case insensitive */
  _niregex?: InputMaybe<Scalars['citext']>;
  /** does the column NOT match the given pattern */
  _nlike?: InputMaybe<Scalars['citext']>;
  /** does the column NOT match the given POSIX regular expression, case sensitive */
  _nregex?: InputMaybe<Scalars['citext']>;
  /** does the column NOT match the given SQL regular expression */
  _nsimilar?: InputMaybe<Scalars['citext']>;
  /** does the column match the given POSIX regular expression, case sensitive */
  _regex?: InputMaybe<Scalars['citext']>;
  /** does the column match the given SQL regular expression */
  _similar?: InputMaybe<Scalars['citext']>;
}

/** ordering argument of a cursor */
export enum cursor_ordering {
  /** ascending ordering of the cursor */
  ASC = 'ASC',
  /** descending ordering of the cursor */
  DESC = 'DESC',
}

export interface fields_aggregate_bool_exp {
  count?: InputMaybe<fields_aggregate_bool_exp_count>;
}

export interface fields_aggregate_bool_exp_count {
  arguments?: InputMaybe<Array<fields_select_column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
  filter?: InputMaybe<fields_bool_exp>;
  predicate: Int_comparison_exp;
}

/** order by aggregate values of table "fields" */
export interface fields_aggregate_order_by {
  count?: InputMaybe<order_by>;
  max?: InputMaybe<fields_max_order_by>;
  min?: InputMaybe<fields_min_order_by>;
}

/** append existing jsonb value of filtered columns with new jsonb value */
export interface fields_append_input {
  data?: InputMaybe<Scalars['jsonb']>;
}

/** input type for inserting array relation for remote table "fields" */
export interface fields_arr_rel_insert_input {
  data: Array<fields_insert_input>;
  /** upsert condition */
  on_conflict?: InputMaybe<fields_on_conflict>;
}

/** Boolean expression to filter rows from the table "fields". All fields are combined with a logical 'AND'. */
export interface fields_bool_exp {
  _and?: InputMaybe<Array<fields_bool_exp>>;
  _not?: InputMaybe<fields_bool_exp>;
  _or?: InputMaybe<Array<fields_bool_exp>>;
  data?: InputMaybe<jsonb_comparison_exp>;
  dataId?: InputMaybe<uuid_comparison_exp>;
  id?: InputMaybe<uuid_comparison_exp>;
  mime?: InputMaybe<String_comparison_exp>;
  name?: InputMaybe<String_comparison_exp>;
  parent?: InputMaybe<nodes_bool_exp>;
  parentId?: InputMaybe<uuid_comparison_exp>;
}

/** unique or primary key constraints on table "fields" */
export enum fields_constraint {
  /** unique or primary key constraint on columns "id" */
  fields_id_key = 'fields_id_key',
  /** unique or primary key constraint on columns "name", "parent_id" */
  fields_parent_id_name_key = 'fields_parent_id_name_key',
  /** unique or primary key constraint on columns "id" */
  fields_pkey = 'fields_pkey',
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export interface fields_delete_at_path_input {
  data?: InputMaybe<Array<Scalars['String']>>;
}

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export interface fields_delete_elem_input {
  data?: InputMaybe<Scalars['Int']>;
}

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export interface fields_delete_key_input {
  data?: InputMaybe<Scalars['String']>;
}

/** input type for inserting data into table "fields" */
export interface fields_insert_input {
  data?: InputMaybe<Scalars['jsonb']>;
  id?: InputMaybe<Scalars['uuid']>;
  mime?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  parent?: InputMaybe<nodes_obj_rel_insert_input>;
  parentId?: InputMaybe<Scalars['uuid']>;
}

/** order by max() on columns of table "fields" */
export interface fields_max_order_by {
  id?: InputMaybe<order_by>;
  mime?: InputMaybe<order_by>;
  name?: InputMaybe<order_by>;
  parentId?: InputMaybe<order_by>;
}

/** order by min() on columns of table "fields" */
export interface fields_min_order_by {
  id?: InputMaybe<order_by>;
  mime?: InputMaybe<order_by>;
  name?: InputMaybe<order_by>;
  parentId?: InputMaybe<order_by>;
}

/** on_conflict condition type for table "fields" */
export interface fields_on_conflict {
  constraint: fields_constraint;
  update_columns?: Array<fields_update_column>;
  where?: InputMaybe<fields_bool_exp>;
}

/** Ordering options when selecting data from "fields". */
export interface fields_order_by {
  data?: InputMaybe<order_by>;
  dataId?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  mime?: InputMaybe<order_by>;
  name?: InputMaybe<order_by>;
  parent?: InputMaybe<nodes_order_by>;
  parentId?: InputMaybe<order_by>;
}

/** primary key columns input for table: fields */
export interface fields_pk_columns_input {
  id: Scalars['uuid'];
}

/** prepend existing jsonb value of filtered columns with new jsonb value */
export interface fields_prepend_input {
  data?: InputMaybe<Scalars['jsonb']>;
}

/** select columns of table "fields" */
export enum fields_select_column {
  /** column name */
  data = 'data',
  /** column name */
  id = 'id',
  /** column name */
  mime = 'mime',
  /** column name */
  name = 'name',
  /** column name */
  parentId = 'parentId',
}

/** input type for updating data in table "fields" */
export interface fields_set_input {
  data?: InputMaybe<Scalars['jsonb']>;
  id?: InputMaybe<Scalars['uuid']>;
  mime?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  parentId?: InputMaybe<Scalars['uuid']>;
}

/** Streaming cursor of the table "fields" */
export interface fields_stream_cursor_input {
  /** Stream column input with initial value */
  initial_value: fields_stream_cursor_value_input;
  /** cursor ordering */
  ordering?: InputMaybe<cursor_ordering>;
}

/** Initial value of the column from where the streaming should start */
export interface fields_stream_cursor_value_input {
  data?: InputMaybe<Scalars['jsonb']>;
  id?: InputMaybe<Scalars['uuid']>;
  mime?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  parentId?: InputMaybe<Scalars['uuid']>;
}

/** update columns of table "fields" */
export enum fields_update_column {
  /** column name */
  data = 'data',
  /** column name */
  id = 'id',
  /** column name */
  mime = 'mime',
  /** column name */
  name = 'name',
  /** column name */
  parentId = 'parentId',
}

export interface fields_updates {
  /** append existing jsonb value of filtered columns with new jsonb value */
  _append?: InputMaybe<fields_append_input>;
  /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
  _delete_at_path?: InputMaybe<fields_delete_at_path_input>;
  /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
  _delete_elem?: InputMaybe<fields_delete_elem_input>;
  /** delete key/value pair or string element. key/value pairs are matched based on their key value */
  _delete_key?: InputMaybe<fields_delete_key_input>;
  /** prepend existing jsonb value of filtered columns with new jsonb value */
  _prepend?: InputMaybe<fields_prepend_input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<fields_set_input>;
  where: fields_bool_exp;
}

export interface files_aggregate_bool_exp {
  bool_and?: InputMaybe<files_aggregate_bool_exp_bool_and>;
  bool_or?: InputMaybe<files_aggregate_bool_exp_bool_or>;
  count?: InputMaybe<files_aggregate_bool_exp_count>;
}

export interface files_aggregate_bool_exp_bool_and {
  arguments: files_select_column_files_aggregate_bool_exp_bool_and_arguments_columns;
  distinct?: InputMaybe<Scalars['Boolean']>;
  filter?: InputMaybe<files_bool_exp>;
  predicate: Boolean_comparison_exp;
}

export interface files_aggregate_bool_exp_bool_or {
  arguments: files_select_column_files_aggregate_bool_exp_bool_or_arguments_columns;
  distinct?: InputMaybe<Scalars['Boolean']>;
  filter?: InputMaybe<files_bool_exp>;
  predicate: Boolean_comparison_exp;
}

export interface files_aggregate_bool_exp_count {
  arguments?: InputMaybe<Array<files_select_column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
  filter?: InputMaybe<files_bool_exp>;
  predicate: Int_comparison_exp;
}

/** order by aggregate values of table "storage.files" */
export interface files_aggregate_order_by {
  avg?: InputMaybe<files_avg_order_by>;
  count?: InputMaybe<order_by>;
  max?: InputMaybe<files_max_order_by>;
  min?: InputMaybe<files_min_order_by>;
  stddev?: InputMaybe<files_stddev_order_by>;
  stddev_pop?: InputMaybe<files_stddev_pop_order_by>;
  stddev_samp?: InputMaybe<files_stddev_samp_order_by>;
  sum?: InputMaybe<files_sum_order_by>;
  var_pop?: InputMaybe<files_var_pop_order_by>;
  var_samp?: InputMaybe<files_var_samp_order_by>;
  variance?: InputMaybe<files_variance_order_by>;
}

/** input type for inserting array relation for remote table "storage.files" */
export interface files_arr_rel_insert_input {
  data: Array<files_insert_input>;
  /** upsert condition */
  on_conflict?: InputMaybe<files_on_conflict>;
}

/** order by avg() on columns of table "storage.files" */
export interface files_avg_order_by {
  size?: InputMaybe<order_by>;
}

/** Boolean expression to filter rows from the table "storage.files". All fields are combined with a logical 'AND'. */
export interface files_bool_exp {
  _and?: InputMaybe<Array<files_bool_exp>>;
  _not?: InputMaybe<files_bool_exp>;
  _or?: InputMaybe<Array<files_bool_exp>>;
  bucket?: InputMaybe<buckets_bool_exp>;
  bucketId?: InputMaybe<String_comparison_exp>;
  createdAt?: InputMaybe<timestamptz_comparison_exp>;
  etag?: InputMaybe<String_comparison_exp>;
  id?: InputMaybe<uuid_comparison_exp>;
  isUploaded?: InputMaybe<Boolean_comparison_exp>;
  mimeType?: InputMaybe<String_comparison_exp>;
  name?: InputMaybe<String_comparison_exp>;
  size?: InputMaybe<Int_comparison_exp>;
  updatedAt?: InputMaybe<timestamptz_comparison_exp>;
  uploadedByUserId?: InputMaybe<uuid_comparison_exp>;
}

/** unique or primary key constraints on table "storage.files" */
export enum files_constraint {
  /** unique or primary key constraint on columns "id" */
  files_pkey = 'files_pkey',
}

/** input type for incrementing numeric columns in table "storage.files" */
export interface files_inc_input {
  size?: InputMaybe<Scalars['Int']>;
}

/** input type for inserting data into table "storage.files" */
export interface files_insert_input {
  bucket?: InputMaybe<buckets_obj_rel_insert_input>;
  bucketId?: InputMaybe<Scalars['String']>;
  createdAt?: InputMaybe<Scalars['timestamptz']>;
  etag?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['uuid']>;
  isUploaded?: InputMaybe<Scalars['Boolean']>;
  mimeType?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  size?: InputMaybe<Scalars['Int']>;
  updatedAt?: InputMaybe<Scalars['timestamptz']>;
  uploadedByUserId?: InputMaybe<Scalars['uuid']>;
}

/** order by max() on columns of table "storage.files" */
export interface files_max_order_by {
  bucketId?: InputMaybe<order_by>;
  createdAt?: InputMaybe<order_by>;
  etag?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  mimeType?: InputMaybe<order_by>;
  name?: InputMaybe<order_by>;
  size?: InputMaybe<order_by>;
  updatedAt?: InputMaybe<order_by>;
  uploadedByUserId?: InputMaybe<order_by>;
}

/** order by min() on columns of table "storage.files" */
export interface files_min_order_by {
  bucketId?: InputMaybe<order_by>;
  createdAt?: InputMaybe<order_by>;
  etag?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  mimeType?: InputMaybe<order_by>;
  name?: InputMaybe<order_by>;
  size?: InputMaybe<order_by>;
  updatedAt?: InputMaybe<order_by>;
  uploadedByUserId?: InputMaybe<order_by>;
}

/** on_conflict condition type for table "storage.files" */
export interface files_on_conflict {
  constraint: files_constraint;
  update_columns?: Array<files_update_column>;
  where?: InputMaybe<files_bool_exp>;
}

/** Ordering options when selecting data from "storage.files". */
export interface files_order_by {
  bucket?: InputMaybe<buckets_order_by>;
  bucketId?: InputMaybe<order_by>;
  createdAt?: InputMaybe<order_by>;
  etag?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  isUploaded?: InputMaybe<order_by>;
  mimeType?: InputMaybe<order_by>;
  name?: InputMaybe<order_by>;
  size?: InputMaybe<order_by>;
  updatedAt?: InputMaybe<order_by>;
  uploadedByUserId?: InputMaybe<order_by>;
}

/** primary key columns input for table: storage.files */
export interface files_pk_columns_input {
  id: Scalars['uuid'];
}

/** select columns of table "storage.files" */
export enum files_select_column {
  /** column name */
  bucketId = 'bucketId',
  /** column name */
  createdAt = 'createdAt',
  /** column name */
  etag = 'etag',
  /** column name */
  id = 'id',
  /** column name */
  isUploaded = 'isUploaded',
  /** column name */
  mimeType = 'mimeType',
  /** column name */
  name = 'name',
  /** column name */
  size = 'size',
  /** column name */
  updatedAt = 'updatedAt',
  /** column name */
  uploadedByUserId = 'uploadedByUserId',
}

/** select "files_aggregate_bool_exp_bool_and_arguments_columns" columns of table "storage.files" */
export enum files_select_column_files_aggregate_bool_exp_bool_and_arguments_columns {
  /** column name */
  isUploaded = 'isUploaded',
}

/** select "files_aggregate_bool_exp_bool_or_arguments_columns" columns of table "storage.files" */
export enum files_select_column_files_aggregate_bool_exp_bool_or_arguments_columns {
  /** column name */
  isUploaded = 'isUploaded',
}

/** input type for updating data in table "storage.files" */
export interface files_set_input {
  bucketId?: InputMaybe<Scalars['String']>;
  createdAt?: InputMaybe<Scalars['timestamptz']>;
  etag?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['uuid']>;
  isUploaded?: InputMaybe<Scalars['Boolean']>;
  mimeType?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  size?: InputMaybe<Scalars['Int']>;
  updatedAt?: InputMaybe<Scalars['timestamptz']>;
  uploadedByUserId?: InputMaybe<Scalars['uuid']>;
}

/** order by stddev() on columns of table "storage.files" */
export interface files_stddev_order_by {
  size?: InputMaybe<order_by>;
}

/** order by stddev_pop() on columns of table "storage.files" */
export interface files_stddev_pop_order_by {
  size?: InputMaybe<order_by>;
}

/** order by stddev_samp() on columns of table "storage.files" */
export interface files_stddev_samp_order_by {
  size?: InputMaybe<order_by>;
}

/** Streaming cursor of the table "files" */
export interface files_stream_cursor_input {
  /** Stream column input with initial value */
  initial_value: files_stream_cursor_value_input;
  /** cursor ordering */
  ordering?: InputMaybe<cursor_ordering>;
}

/** Initial value of the column from where the streaming should start */
export interface files_stream_cursor_value_input {
  bucketId?: InputMaybe<Scalars['String']>;
  createdAt?: InputMaybe<Scalars['timestamptz']>;
  etag?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['uuid']>;
  isUploaded?: InputMaybe<Scalars['Boolean']>;
  mimeType?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  size?: InputMaybe<Scalars['Int']>;
  updatedAt?: InputMaybe<Scalars['timestamptz']>;
  uploadedByUserId?: InputMaybe<Scalars['uuid']>;
}

/** order by sum() on columns of table "storage.files" */
export interface files_sum_order_by {
  size?: InputMaybe<order_by>;
}

/** update columns of table "storage.files" */
export enum files_update_column {
  /** column name */
  bucketId = 'bucketId',
  /** column name */
  createdAt = 'createdAt',
  /** column name */
  etag = 'etag',
  /** column name */
  id = 'id',
  /** column name */
  isUploaded = 'isUploaded',
  /** column name */
  mimeType = 'mimeType',
  /** column name */
  name = 'name',
  /** column name */
  size = 'size',
  /** column name */
  updatedAt = 'updatedAt',
  /** column name */
  uploadedByUserId = 'uploadedByUserId',
}

export interface files_updates {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<files_inc_input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<files_set_input>;
  where: files_bool_exp;
}

/** order by var_pop() on columns of table "storage.files" */
export interface files_var_pop_order_by {
  size?: InputMaybe<order_by>;
}

/** order by var_samp() on columns of table "storage.files" */
export interface files_var_samp_order_by {
  size?: InputMaybe<order_by>;
}

/** order by variance() on columns of table "storage.files" */
export interface files_variance_order_by {
  size?: InputMaybe<order_by>;
}

export interface jsonb_cast_exp {
  String?: InputMaybe<String_comparison_exp>;
}

/** Boolean expression to compare columns of type "jsonb". All fields are combined with logical 'AND'. */
export interface jsonb_comparison_exp {
  _cast?: InputMaybe<jsonb_cast_exp>;
  /** is the column contained in the given json value */
  _contained_in?: InputMaybe<Scalars['jsonb']>;
  /** does the column contain the given json value at the top level */
  _contains?: InputMaybe<Scalars['jsonb']>;
  _eq?: InputMaybe<Scalars['jsonb']>;
  _gt?: InputMaybe<Scalars['jsonb']>;
  _gte?: InputMaybe<Scalars['jsonb']>;
  /** does the string exist as a top-level key in the column */
  _has_key?: InputMaybe<Scalars['String']>;
  /** do all of these strings exist as top-level keys in the column */
  _has_keys_all?: InputMaybe<Array<Scalars['String']>>;
  /** do any of these strings exist as top-level keys in the column */
  _has_keys_any?: InputMaybe<Array<Scalars['String']>>;
  _in?: InputMaybe<Array<Scalars['jsonb']>>;
  _is_null?: InputMaybe<Scalars['Boolean']>;
  _lt?: InputMaybe<Scalars['jsonb']>;
  _lte?: InputMaybe<Scalars['jsonb']>;
  _neq?: InputMaybe<Scalars['jsonb']>;
  _nin?: InputMaybe<Array<Scalars['jsonb']>>;
}

export interface members_aggregate_bool_exp {
  bool_and?: InputMaybe<members_aggregate_bool_exp_bool_and>;
  bool_or?: InputMaybe<members_aggregate_bool_exp_bool_or>;
  count?: InputMaybe<members_aggregate_bool_exp_count>;
}

export interface members_aggregate_bool_exp_bool_and {
  arguments: members_select_column_members_aggregate_bool_exp_bool_and_arguments_columns;
  distinct?: InputMaybe<Scalars['Boolean']>;
  filter?: InputMaybe<members_bool_exp>;
  predicate: Boolean_comparison_exp;
}

export interface members_aggregate_bool_exp_bool_or {
  arguments: members_select_column_members_aggregate_bool_exp_bool_or_arguments_columns;
  distinct?: InputMaybe<Scalars['Boolean']>;
  filter?: InputMaybe<members_bool_exp>;
  predicate: Boolean_comparison_exp;
}

export interface members_aggregate_bool_exp_count {
  arguments?: InputMaybe<Array<members_select_column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
  filter?: InputMaybe<members_bool_exp>;
  predicate: Int_comparison_exp;
}

/** order by aggregate values of table "members" */
export interface members_aggregate_order_by {
  count?: InputMaybe<order_by>;
  max?: InputMaybe<members_max_order_by>;
  min?: InputMaybe<members_min_order_by>;
}

/** input type for inserting array relation for remote table "members" */
export interface members_arr_rel_insert_input {
  data: Array<members_insert_input>;
  /** upsert condition */
  on_conflict?: InputMaybe<members_on_conflict>;
}

/** Boolean expression to filter rows from the table "members". All fields are combined with a logical 'AND'. */
export interface members_bool_exp {
  _and?: InputMaybe<Array<members_bool_exp>>;
  _not?: InputMaybe<members_bool_exp>;
  _or?: InputMaybe<Array<members_bool_exp>>;
  accepted?: InputMaybe<Boolean_comparison_exp>;
  active?: InputMaybe<Boolean_comparison_exp>;
  email?: InputMaybe<String_comparison_exp>;
  emailUser?: InputMaybe<users_bool_exp>;
  hidden?: InputMaybe<Boolean_comparison_exp>;
  id?: InputMaybe<uuid_comparison_exp>;
  name?: InputMaybe<String_comparison_exp>;
  node?: InputMaybe<nodes_bool_exp>;
  nodeId?: InputMaybe<uuid_comparison_exp>;
  owner?: InputMaybe<Boolean_comparison_exp>;
  parent?: InputMaybe<nodes_bool_exp>;
  parentId?: InputMaybe<uuid_comparison_exp>;
  user?: InputMaybe<users_bool_exp>;
}

/** unique or primary key constraints on table "members" */
export enum members_constraint {
  /** unique or primary key constraint on columns "email", "parent_id" */
  members_parent_id_email_key = 'members_parent_id_email_key',
  /** unique or primary key constraint on columns "name", "email", "node_id", "parent_id" */
  members_parent_id_name_email_node_id_key = 'members_parent_id_name_email_node_id_key',
  /** unique or primary key constraint on columns "node_id", "parent_id" */
  members_parent_id_node_id_key = 'members_parent_id_node_id_key',
  /** unique or primary key constraint on columns "id" */
  members_pkey = 'members_pkey',
}

/** input type for inserting data into table "members" */
export interface members_insert_input {
  accepted?: InputMaybe<Scalars['Boolean']>;
  active?: InputMaybe<Scalars['Boolean']>;
  email?: InputMaybe<Scalars['String']>;
  emailUser?: InputMaybe<users_obj_rel_insert_input>;
  hidden?: InputMaybe<Scalars['Boolean']>;
  id?: InputMaybe<Scalars['uuid']>;
  name?: InputMaybe<Scalars['String']>;
  node?: InputMaybe<nodes_obj_rel_insert_input>;
  nodeId?: InputMaybe<Scalars['uuid']>;
  owner?: InputMaybe<Scalars['Boolean']>;
  parent?: InputMaybe<nodes_obj_rel_insert_input>;
  parentId?: InputMaybe<Scalars['uuid']>;
  user?: InputMaybe<users_obj_rel_insert_input>;
}

/** order by max() on columns of table "members" */
export interface members_max_order_by {
  email?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  name?: InputMaybe<order_by>;
  nodeId?: InputMaybe<order_by>;
  parentId?: InputMaybe<order_by>;
}

/** order by min() on columns of table "members" */
export interface members_min_order_by {
  email?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  name?: InputMaybe<order_by>;
  nodeId?: InputMaybe<order_by>;
  parentId?: InputMaybe<order_by>;
}

/** on_conflict condition type for table "members" */
export interface members_on_conflict {
  constraint: members_constraint;
  update_columns?: Array<members_update_column>;
  where?: InputMaybe<members_bool_exp>;
}

/** Ordering options when selecting data from "members". */
export interface members_order_by {
  accepted?: InputMaybe<order_by>;
  active?: InputMaybe<order_by>;
  email?: InputMaybe<order_by>;
  emailUser?: InputMaybe<users_order_by>;
  hidden?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  name?: InputMaybe<order_by>;
  node?: InputMaybe<nodes_order_by>;
  nodeId?: InputMaybe<order_by>;
  owner?: InputMaybe<order_by>;
  parent?: InputMaybe<nodes_order_by>;
  parentId?: InputMaybe<order_by>;
  user?: InputMaybe<users_order_by>;
}

/** primary key columns input for table: members */
export interface members_pk_columns_input {
  id: Scalars['uuid'];
}

/** select columns of table "members" */
export enum members_select_column {
  /** column name */
  accepted = 'accepted',
  /** column name */
  active = 'active',
  /** column name */
  email = 'email',
  /** column name */
  hidden = 'hidden',
  /** column name */
  id = 'id',
  /** column name */
  name = 'name',
  /** column name */
  nodeId = 'nodeId',
  /** column name */
  owner = 'owner',
  /** column name */
  parentId = 'parentId',
}

/** select "members_aggregate_bool_exp_bool_and_arguments_columns" columns of table "members" */
export enum members_select_column_members_aggregate_bool_exp_bool_and_arguments_columns {
  /** column name */
  accepted = 'accepted',
  /** column name */
  active = 'active',
  /** column name */
  hidden = 'hidden',
  /** column name */
  owner = 'owner',
}

/** select "members_aggregate_bool_exp_bool_or_arguments_columns" columns of table "members" */
export enum members_select_column_members_aggregate_bool_exp_bool_or_arguments_columns {
  /** column name */
  accepted = 'accepted',
  /** column name */
  active = 'active',
  /** column name */
  hidden = 'hidden',
  /** column name */
  owner = 'owner',
}

/** input type for updating data in table "members" */
export interface members_set_input {
  accepted?: InputMaybe<Scalars['Boolean']>;
  active?: InputMaybe<Scalars['Boolean']>;
  email?: InputMaybe<Scalars['String']>;
  hidden?: InputMaybe<Scalars['Boolean']>;
  id?: InputMaybe<Scalars['uuid']>;
  name?: InputMaybe<Scalars['String']>;
  nodeId?: InputMaybe<Scalars['uuid']>;
  owner?: InputMaybe<Scalars['Boolean']>;
  parentId?: InputMaybe<Scalars['uuid']>;
}

/** Streaming cursor of the table "members" */
export interface members_stream_cursor_input {
  /** Stream column input with initial value */
  initial_value: members_stream_cursor_value_input;
  /** cursor ordering */
  ordering?: InputMaybe<cursor_ordering>;
}

/** Initial value of the column from where the streaming should start */
export interface members_stream_cursor_value_input {
  accepted?: InputMaybe<Scalars['Boolean']>;
  active?: InputMaybe<Scalars['Boolean']>;
  email?: InputMaybe<Scalars['String']>;
  hidden?: InputMaybe<Scalars['Boolean']>;
  id?: InputMaybe<Scalars['uuid']>;
  name?: InputMaybe<Scalars['String']>;
  nodeId?: InputMaybe<Scalars['uuid']>;
  owner?: InputMaybe<Scalars['Boolean']>;
  parentId?: InputMaybe<Scalars['uuid']>;
}

/** update columns of table "members" */
export enum members_update_column {
  /** column name */
  accepted = 'accepted',
  /** column name */
  active = 'active',
  /** column name */
  email = 'email',
  /** column name */
  hidden = 'hidden',
  /** column name */
  id = 'id',
  /** column name */
  name = 'name',
  /** column name */
  nodeId = 'nodeId',
  /** column name */
  owner = 'owner',
  /** column name */
  parentId = 'parentId',
}

export interface members_updates {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<members_set_input>;
  where: members_bool_exp;
}

/** order by aggregate values of table "mimes" */
export interface mimes_aggregate_order_by {
  count?: InputMaybe<order_by>;
  max?: InputMaybe<mimes_max_order_by>;
  min?: InputMaybe<mimes_min_order_by>;
}

/** append existing jsonb value of filtered columns with new jsonb value */
export interface mimes_append_input {
  traits?: InputMaybe<Scalars['jsonb']>;
}

/** Boolean expression to filter rows from the table "mimes". All fields are combined with a logical 'AND'. */
export interface mimes_bool_exp {
  _and?: InputMaybe<Array<mimes_bool_exp>>;
  _not?: InputMaybe<mimes_bool_exp>;
  _or?: InputMaybe<Array<mimes_bool_exp>>;
  children?: InputMaybe<mimes_bool_exp>;
  context?: InputMaybe<Boolean_comparison_exp>;
  hidden?: InputMaybe<Boolean_comparison_exp>;
  icon?: InputMaybe<String_comparison_exp>;
  id?: InputMaybe<String_comparison_exp>;
  parents?: InputMaybe<mimes_bool_exp>;
  traits?: InputMaybe<jsonb_comparison_exp>;
  unique?: InputMaybe<Boolean_comparison_exp>;
}

/** unique or primary key constraints on table "mimes" */
export enum mimes_constraint {
  /** unique or primary key constraint on columns "id" */
  mimes_pkey = 'mimes_pkey',
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export interface mimes_delete_at_path_input {
  traits?: InputMaybe<Array<Scalars['String']>>;
}

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export interface mimes_delete_elem_input {
  traits?: InputMaybe<Scalars['Int']>;
}

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export interface mimes_delete_key_input {
  traits?: InputMaybe<Scalars['String']>;
}

/** input type for inserting data into table "mimes" */
export interface mimes_insert_input {
  context?: InputMaybe<Scalars['Boolean']>;
  hidden?: InputMaybe<Scalars['Boolean']>;
  icon?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['String']>;
  traits?: InputMaybe<Scalars['jsonb']>;
  unique?: InputMaybe<Scalars['Boolean']>;
}

/** order by max() on columns of table "mimes" */
export interface mimes_max_order_by {
  icon?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
}

/** order by min() on columns of table "mimes" */
export interface mimes_min_order_by {
  icon?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
}

/** input type for inserting object relation for remote table "mimes" */
export interface mimes_obj_rel_insert_input {
  data: mimes_insert_input;
  /** upsert condition */
  on_conflict?: InputMaybe<mimes_on_conflict>;
}

/** on_conflict condition type for table "mimes" */
export interface mimes_on_conflict {
  constraint: mimes_constraint;
  update_columns?: Array<mimes_update_column>;
  where?: InputMaybe<mimes_bool_exp>;
}

/** Ordering options when selecting data from "mimes". */
export interface mimes_order_by {
  children_aggregate?: InputMaybe<mimes_aggregate_order_by>;
  context?: InputMaybe<order_by>;
  hidden?: InputMaybe<order_by>;
  icon?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  parents_aggregate?: InputMaybe<mimes_aggregate_order_by>;
  traits?: InputMaybe<order_by>;
  unique?: InputMaybe<order_by>;
}

/** primary key columns input for table: mimes */
export interface mimes_pk_columns_input {
  id: Scalars['String'];
}

/** prepend existing jsonb value of filtered columns with new jsonb value */
export interface mimes_prepend_input {
  traits?: InputMaybe<Scalars['jsonb']>;
}

/** select columns of table "mimes" */
export enum mimes_select_column {
  /** column name */
  context = 'context',
  /** column name */
  hidden = 'hidden',
  /** column name */
  icon = 'icon',
  /** column name */
  id = 'id',
  /** column name */
  traits = 'traits',
  /** column name */
  unique = 'unique',
}

/** input type for updating data in table "mimes" */
export interface mimes_set_input {
  context?: InputMaybe<Scalars['Boolean']>;
  hidden?: InputMaybe<Scalars['Boolean']>;
  icon?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['String']>;
  traits?: InputMaybe<Scalars['jsonb']>;
  unique?: InputMaybe<Scalars['Boolean']>;
}

/** Streaming cursor of the table "mimes" */
export interface mimes_stream_cursor_input {
  /** Stream column input with initial value */
  initial_value: mimes_stream_cursor_value_input;
  /** cursor ordering */
  ordering?: InputMaybe<cursor_ordering>;
}

/** Initial value of the column from where the streaming should start */
export interface mimes_stream_cursor_value_input {
  context?: InputMaybe<Scalars['Boolean']>;
  hidden?: InputMaybe<Scalars['Boolean']>;
  icon?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['String']>;
  traits?: InputMaybe<Scalars['jsonb']>;
  unique?: InputMaybe<Scalars['Boolean']>;
}

/** update columns of table "mimes" */
export enum mimes_update_column {
  /** column name */
  context = 'context',
  /** column name */
  hidden = 'hidden',
  /** column name */
  icon = 'icon',
  /** column name */
  id = 'id',
  /** column name */
  traits = 'traits',
  /** column name */
  unique = 'unique',
}

export interface mimes_updates {
  /** append existing jsonb value of filtered columns with new jsonb value */
  _append?: InputMaybe<mimes_append_input>;
  /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
  _delete_at_path?: InputMaybe<mimes_delete_at_path_input>;
  /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
  _delete_elem?: InputMaybe<mimes_delete_elem_input>;
  /** delete key/value pair or string element. key/value pairs are matched based on their key value */
  _delete_key?: InputMaybe<mimes_delete_key_input>;
  /** prepend existing jsonb value of filtered columns with new jsonb value */
  _prepend?: InputMaybe<mimes_prepend_input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<mimes_set_input>;
  where: mimes_bool_exp;
}

export interface nodes_aggregate_bool_exp {
  bool_and?: InputMaybe<nodes_aggregate_bool_exp_bool_and>;
  bool_or?: InputMaybe<nodes_aggregate_bool_exp_bool_or>;
  count?: InputMaybe<nodes_aggregate_bool_exp_count>;
}

export interface nodes_aggregate_bool_exp_bool_and {
  arguments: nodes_select_column_nodes_aggregate_bool_exp_bool_and_arguments_columns;
  distinct?: InputMaybe<Scalars['Boolean']>;
  filter?: InputMaybe<nodes_bool_exp>;
  predicate: Boolean_comparison_exp;
}

export interface nodes_aggregate_bool_exp_bool_or {
  arguments: nodes_select_column_nodes_aggregate_bool_exp_bool_or_arguments_columns;
  distinct?: InputMaybe<Scalars['Boolean']>;
  filter?: InputMaybe<nodes_bool_exp>;
  predicate: Boolean_comparison_exp;
}

export interface nodes_aggregate_bool_exp_count {
  arguments?: InputMaybe<Array<nodes_select_column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
  filter?: InputMaybe<nodes_bool_exp>;
  predicate: Int_comparison_exp;
}

/** order by aggregate values of table "nodes" */
export interface nodes_aggregate_order_by {
  avg?: InputMaybe<nodes_avg_order_by>;
  count?: InputMaybe<order_by>;
  max?: InputMaybe<nodes_max_order_by>;
  min?: InputMaybe<nodes_min_order_by>;
  stddev?: InputMaybe<nodes_stddev_order_by>;
  stddev_pop?: InputMaybe<nodes_stddev_pop_order_by>;
  stddev_samp?: InputMaybe<nodes_stddev_samp_order_by>;
  sum?: InputMaybe<nodes_sum_order_by>;
  var_pop?: InputMaybe<nodes_var_pop_order_by>;
  var_samp?: InputMaybe<nodes_var_samp_order_by>;
  variance?: InputMaybe<nodes_variance_order_by>;
}

/** append existing jsonb value of filtered columns with new jsonb value */
export interface nodes_append_input {
  data?: InputMaybe<Scalars['jsonb']>;
}

/** input type for inserting array relation for remote table "nodes" */
export interface nodes_arr_rel_insert_input {
  data: Array<nodes_insert_input>;
  /** upsert condition */
  on_conflict?: InputMaybe<nodes_on_conflict>;
}

/** order by avg() on columns of table "nodes" */
export interface nodes_avg_order_by {
  index?: InputMaybe<order_by>;
}

/** Boolean expression to filter rows from the table "nodes". All fields are combined with a logical 'AND'. */
export interface nodes_bool_exp {
  _and?: InputMaybe<Array<nodes_bool_exp>>;
  _not?: InputMaybe<nodes_bool_exp>;
  _or?: InputMaybe<Array<nodes_bool_exp>>;
  attachable?: InputMaybe<Boolean_comparison_exp>;
  children?: InputMaybe<nodes_bool_exp>;
  children_aggregate?: InputMaybe<nodes_aggregate_bool_exp>;
  context?: InputMaybe<nodes_bool_exp>;
  contextId?: InputMaybe<uuid_comparison_exp>;
  contextOwners?: InputMaybe<users_bool_exp>;
  createdAt?: InputMaybe<timestamptz_comparison_exp>;
  data?: InputMaybe<jsonb_comparison_exp>;
  delete?: InputMaybe<Boolean_comparison_exp>;
  fields?: InputMaybe<fields_bool_exp>;
  fields_aggregate?: InputMaybe<fields_aggregate_bool_exp>;
  getIndex?: InputMaybe<Int_comparison_exp>;
  id?: InputMaybe<uuid_comparison_exp>;
  index?: InputMaybe<Int_comparison_exp>;
  insert?: InputMaybe<Boolean_comparison_exp>;
  inserts?: InputMaybe<mimes_bool_exp>;
  isContextOwner?: InputMaybe<Boolean_comparison_exp>;
  isOwner?: InputMaybe<Boolean_comparison_exp>;
  key?: InputMaybe<String_comparison_exp>;
  members?: InputMaybe<members_bool_exp>;
  members_aggregate?: InputMaybe<members_aggregate_bool_exp>;
  mime?: InputMaybe<mimes_bool_exp>;
  mimeId?: InputMaybe<String_comparison_exp>;
  mutable?: InputMaybe<Boolean_comparison_exp>;
  name?: InputMaybe<String_comparison_exp>;
  owner?: InputMaybe<users_bool_exp>;
  ownerId?: InputMaybe<uuid_comparison_exp>;
  owners?: InputMaybe<users_bool_exp>;
  parent?: InputMaybe<nodes_bool_exp>;
  parentId?: InputMaybe<uuid_comparison_exp>;
  permissions?: InputMaybe<permissions_bool_exp>;
  permissions_aggregate?: InputMaybe<permissions_aggregate_bool_exp>;
  relations?: InputMaybe<relations_bool_exp>;
  relations_aggregate?: InputMaybe<relations_aggregate_bool_exp>;
  select?: InputMaybe<Boolean_comparison_exp>;
  unique?: InputMaybe<String_comparison_exp>;
  update?: InputMaybe<Boolean_comparison_exp>;
  updatedAt?: InputMaybe<timestamptz_comparison_exp>;
}

/** unique or primary key constraints on table "nodes" */
export enum nodes_constraint {
  /** unique or primary key constraint on columns "key", "parent_id" */
  nodes_parent_id_namespace_key = 'nodes_parent_id_namespace_key',
  /** unique or primary key constraint on columns "id" */
  nodes_pkey = 'nodes_pkey',
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export interface nodes_delete_at_path_input {
  data?: InputMaybe<Array<Scalars['String']>>;
}

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export interface nodes_delete_elem_input {
  data?: InputMaybe<Scalars['Int']>;
}

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export interface nodes_delete_key_input {
  data?: InputMaybe<Scalars['String']>;
}

/** input type for incrementing numeric columns in table "nodes" */
export interface nodes_inc_input {
  index?: InputMaybe<Scalars['Int']>;
}

/** input type for inserting data into table "nodes" */
export interface nodes_insert_input {
  attachable?: InputMaybe<Scalars['Boolean']>;
  children?: InputMaybe<nodes_arr_rel_insert_input>;
  context?: InputMaybe<nodes_obj_rel_insert_input>;
  contextId?: InputMaybe<Scalars['uuid']>;
  createdAt?: InputMaybe<Scalars['timestamptz']>;
  data?: InputMaybe<Scalars['jsonb']>;
  fields?: InputMaybe<fields_arr_rel_insert_input>;
  id?: InputMaybe<Scalars['uuid']>;
  index?: InputMaybe<Scalars['Int']>;
  key?: InputMaybe<Scalars['String']>;
  members?: InputMaybe<members_arr_rel_insert_input>;
  mime?: InputMaybe<mimes_obj_rel_insert_input>;
  mimeId?: InputMaybe<Scalars['String']>;
  mutable?: InputMaybe<Scalars['Boolean']>;
  name?: InputMaybe<Scalars['String']>;
  owner?: InputMaybe<users_obj_rel_insert_input>;
  ownerId?: InputMaybe<Scalars['uuid']>;
  parent?: InputMaybe<nodes_obj_rel_insert_input>;
  parentId?: InputMaybe<Scalars['uuid']>;
  permissions?: InputMaybe<permissions_arr_rel_insert_input>;
  relations?: InputMaybe<relations_arr_rel_insert_input>;
  updatedAt?: InputMaybe<Scalars['timestamptz']>;
}

/** order by max() on columns of table "nodes" */
export interface nodes_max_order_by {
  contextId?: InputMaybe<order_by>;
  createdAt?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  index?: InputMaybe<order_by>;
  key?: InputMaybe<order_by>;
  mimeId?: InputMaybe<order_by>;
  name?: InputMaybe<order_by>;
  ownerId?: InputMaybe<order_by>;
  parentId?: InputMaybe<order_by>;
  updatedAt?: InputMaybe<order_by>;
}

/** order by min() on columns of table "nodes" */
export interface nodes_min_order_by {
  contextId?: InputMaybe<order_by>;
  createdAt?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  index?: InputMaybe<order_by>;
  key?: InputMaybe<order_by>;
  mimeId?: InputMaybe<order_by>;
  name?: InputMaybe<order_by>;
  ownerId?: InputMaybe<order_by>;
  parentId?: InputMaybe<order_by>;
  updatedAt?: InputMaybe<order_by>;
}

/** input type for inserting object relation for remote table "nodes" */
export interface nodes_obj_rel_insert_input {
  data: nodes_insert_input;
  /** upsert condition */
  on_conflict?: InputMaybe<nodes_on_conflict>;
}

/** on_conflict condition type for table "nodes" */
export interface nodes_on_conflict {
  constraint: nodes_constraint;
  update_columns?: Array<nodes_update_column>;
  where?: InputMaybe<nodes_bool_exp>;
}

/** Ordering options when selecting data from "nodes". */
export interface nodes_order_by {
  attachable?: InputMaybe<order_by>;
  children_aggregate?: InputMaybe<nodes_aggregate_order_by>;
  context?: InputMaybe<nodes_order_by>;
  contextId?: InputMaybe<order_by>;
  contextOwners_aggregate?: InputMaybe<users_aggregate_order_by>;
  createdAt?: InputMaybe<order_by>;
  data?: InputMaybe<order_by>;
  delete?: InputMaybe<order_by>;
  fields_aggregate?: InputMaybe<fields_aggregate_order_by>;
  getIndex?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  index?: InputMaybe<order_by>;
  insert?: InputMaybe<order_by>;
  inserts_aggregate?: InputMaybe<mimes_aggregate_order_by>;
  isContextOwner?: InputMaybe<order_by>;
  isOwner?: InputMaybe<order_by>;
  key?: InputMaybe<order_by>;
  members_aggregate?: InputMaybe<members_aggregate_order_by>;
  mime?: InputMaybe<mimes_order_by>;
  mimeId?: InputMaybe<order_by>;
  mutable?: InputMaybe<order_by>;
  name?: InputMaybe<order_by>;
  owner?: InputMaybe<users_order_by>;
  ownerId?: InputMaybe<order_by>;
  owners_aggregate?: InputMaybe<users_aggregate_order_by>;
  parent?: InputMaybe<nodes_order_by>;
  parentId?: InputMaybe<order_by>;
  permissions_aggregate?: InputMaybe<permissions_aggregate_order_by>;
  relations_aggregate?: InputMaybe<relations_aggregate_order_by>;
  select?: InputMaybe<order_by>;
  unique?: InputMaybe<order_by>;
  update?: InputMaybe<order_by>;
  updatedAt?: InputMaybe<order_by>;
}

/** primary key columns input for table: nodes */
export interface nodes_pk_columns_input {
  id: Scalars['uuid'];
}

/** prepend existing jsonb value of filtered columns with new jsonb value */
export interface nodes_prepend_input {
  data?: InputMaybe<Scalars['jsonb']>;
}

/** select columns of table "nodes" */
export enum nodes_select_column {
  /** column name */
  attachable = 'attachable',
  /** column name */
  contextId = 'contextId',
  /** column name */
  createdAt = 'createdAt',
  /** column name */
  data = 'data',
  /** column name */
  id = 'id',
  /** column name */
  index = 'index',
  /** column name */
  key = 'key',
  /** column name */
  mimeId = 'mimeId',
  /** column name */
  mutable = 'mutable',
  /** column name */
  name = 'name',
  /** column name */
  ownerId = 'ownerId',
  /** column name */
  parentId = 'parentId',
  /** column name */
  updatedAt = 'updatedAt',
}

/** select "nodes_aggregate_bool_exp_bool_and_arguments_columns" columns of table "nodes" */
export enum nodes_select_column_nodes_aggregate_bool_exp_bool_and_arguments_columns {
  /** column name */
  attachable = 'attachable',
  /** column name */
  mutable = 'mutable',
}

/** select "nodes_aggregate_bool_exp_bool_or_arguments_columns" columns of table "nodes" */
export enum nodes_select_column_nodes_aggregate_bool_exp_bool_or_arguments_columns {
  /** column name */
  attachable = 'attachable',
  /** column name */
  mutable = 'mutable',
}

/** input type for updating data in table "nodes" */
export interface nodes_set_input {
  attachable?: InputMaybe<Scalars['Boolean']>;
  contextId?: InputMaybe<Scalars['uuid']>;
  createdAt?: InputMaybe<Scalars['timestamptz']>;
  data?: InputMaybe<Scalars['jsonb']>;
  id?: InputMaybe<Scalars['uuid']>;
  index?: InputMaybe<Scalars['Int']>;
  key?: InputMaybe<Scalars['String']>;
  mimeId?: InputMaybe<Scalars['String']>;
  mutable?: InputMaybe<Scalars['Boolean']>;
  name?: InputMaybe<Scalars['String']>;
  ownerId?: InputMaybe<Scalars['uuid']>;
  parentId?: InputMaybe<Scalars['uuid']>;
  updatedAt?: InputMaybe<Scalars['timestamptz']>;
}

/** order by stddev() on columns of table "nodes" */
export interface nodes_stddev_order_by {
  index?: InputMaybe<order_by>;
}

/** order by stddev_pop() on columns of table "nodes" */
export interface nodes_stddev_pop_order_by {
  index?: InputMaybe<order_by>;
}

/** order by stddev_samp() on columns of table "nodes" */
export interface nodes_stddev_samp_order_by {
  index?: InputMaybe<order_by>;
}

/** Streaming cursor of the table "nodes" */
export interface nodes_stream_cursor_input {
  /** Stream column input with initial value */
  initial_value: nodes_stream_cursor_value_input;
  /** cursor ordering */
  ordering?: InputMaybe<cursor_ordering>;
}

/** Initial value of the column from where the streaming should start */
export interface nodes_stream_cursor_value_input {
  attachable?: InputMaybe<Scalars['Boolean']>;
  contextId?: InputMaybe<Scalars['uuid']>;
  createdAt?: InputMaybe<Scalars['timestamptz']>;
  data?: InputMaybe<Scalars['jsonb']>;
  id?: InputMaybe<Scalars['uuid']>;
  index?: InputMaybe<Scalars['Int']>;
  key?: InputMaybe<Scalars['String']>;
  mimeId?: InputMaybe<Scalars['String']>;
  mutable?: InputMaybe<Scalars['Boolean']>;
  name?: InputMaybe<Scalars['String']>;
  ownerId?: InputMaybe<Scalars['uuid']>;
  parentId?: InputMaybe<Scalars['uuid']>;
  updatedAt?: InputMaybe<Scalars['timestamptz']>;
}

/** order by sum() on columns of table "nodes" */
export interface nodes_sum_order_by {
  index?: InputMaybe<order_by>;
}

/** update columns of table "nodes" */
export enum nodes_update_column {
  /** column name */
  attachable = 'attachable',
  /** column name */
  contextId = 'contextId',
  /** column name */
  createdAt = 'createdAt',
  /** column name */
  data = 'data',
  /** column name */
  id = 'id',
  /** column name */
  index = 'index',
  /** column name */
  key = 'key',
  /** column name */
  mimeId = 'mimeId',
  /** column name */
  mutable = 'mutable',
  /** column name */
  name = 'name',
  /** column name */
  ownerId = 'ownerId',
  /** column name */
  parentId = 'parentId',
  /** column name */
  updatedAt = 'updatedAt',
}

export interface nodes_updates {
  /** append existing jsonb value of filtered columns with new jsonb value */
  _append?: InputMaybe<nodes_append_input>;
  /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
  _delete_at_path?: InputMaybe<nodes_delete_at_path_input>;
  /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
  _delete_elem?: InputMaybe<nodes_delete_elem_input>;
  /** delete key/value pair or string element. key/value pairs are matched based on their key value */
  _delete_key?: InputMaybe<nodes_delete_key_input>;
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<nodes_inc_input>;
  /** prepend existing jsonb value of filtered columns with new jsonb value */
  _prepend?: InputMaybe<nodes_prepend_input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<nodes_set_input>;
  where: nodes_bool_exp;
}

/** order by var_pop() on columns of table "nodes" */
export interface nodes_var_pop_order_by {
  index?: InputMaybe<order_by>;
}

/** order by var_samp() on columns of table "nodes" */
export interface nodes_var_samp_order_by {
  index?: InputMaybe<order_by>;
}

/** order by variance() on columns of table "nodes" */
export interface nodes_variance_order_by {
  index?: InputMaybe<order_by>;
}

/** column ordering options */
export enum order_by {
  /** in ascending order, nulls last */
  asc = 'asc',
  /** in ascending order, nulls first */
  asc_nulls_first = 'asc_nulls_first',
  /** in ascending order, nulls last */
  asc_nulls_last = 'asc_nulls_last',
  /** in descending order, nulls first */
  desc = 'desc',
  /** in descending order, nulls first */
  desc_nulls_first = 'desc_nulls_first',
  /** in descending order, nulls last */
  desc_nulls_last = 'desc_nulls_last',
}

export interface permissions_aggregate_bool_exp {
  bool_and?: InputMaybe<permissions_aggregate_bool_exp_bool_and>;
  bool_or?: InputMaybe<permissions_aggregate_bool_exp_bool_or>;
  count?: InputMaybe<permissions_aggregate_bool_exp_count>;
}

export interface permissions_aggregate_bool_exp_bool_and {
  arguments: permissions_select_column_permissions_aggregate_bool_exp_bool_and_arguments_columns;
  distinct?: InputMaybe<Scalars['Boolean']>;
  filter?: InputMaybe<permissions_bool_exp>;
  predicate: Boolean_comparison_exp;
}

export interface permissions_aggregate_bool_exp_bool_or {
  arguments: permissions_select_column_permissions_aggregate_bool_exp_bool_or_arguments_columns;
  distinct?: InputMaybe<Scalars['Boolean']>;
  filter?: InputMaybe<permissions_bool_exp>;
  predicate: Boolean_comparison_exp;
}

export interface permissions_aggregate_bool_exp_count {
  arguments?: InputMaybe<Array<permissions_select_column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
  filter?: InputMaybe<permissions_bool_exp>;
  predicate: Int_comparison_exp;
}

/** order by aggregate values of table "permissions" */
export interface permissions_aggregate_order_by {
  count?: InputMaybe<order_by>;
  max?: InputMaybe<permissions_max_order_by>;
  min?: InputMaybe<permissions_min_order_by>;
}

/** input type for inserting array relation for remote table "permissions" */
export interface permissions_arr_rel_insert_input {
  data: Array<permissions_insert_input>;
  /** upsert condition */
  on_conflict?: InputMaybe<permissions_on_conflict>;
}

/** Boolean expression to filter rows from the table "permissions". All fields are combined with a logical 'AND'. */
export interface permissions_bool_exp {
  _and?: InputMaybe<Array<permissions_bool_exp>>;
  _not?: InputMaybe<permissions_bool_exp>;
  _or?: InputMaybe<Array<permissions_bool_exp>>;
  active?: InputMaybe<Boolean_comparison_exp>;
  context?: InputMaybe<nodes_bool_exp>;
  contextId?: InputMaybe<uuid_comparison_exp>;
  delete?: InputMaybe<Boolean_comparison_exp>;
  id?: InputMaybe<uuid_comparison_exp>;
  insert?: InputMaybe<Boolean_comparison_exp>;
  mimeId?: InputMaybe<String_comparison_exp>;
  node?: InputMaybe<nodes_bool_exp>;
  nodeId?: InputMaybe<uuid_comparison_exp>;
  parents?: InputMaybe<_text_comparison_exp>;
  role?: InputMaybe<String_comparison_exp>;
  select?: InputMaybe<Boolean_comparison_exp>;
  update?: InputMaybe<Boolean_comparison_exp>;
}

/** unique or primary key constraints on table "permissions" */
export enum permissions_constraint {
  /** unique or primary key constraint on columns "id" */
  permissions_pkey = 'permissions_pkey',
}

/** input type for inserting data into table "permissions" */
export interface permissions_insert_input {
  active?: InputMaybe<Scalars['Boolean']>;
  context?: InputMaybe<nodes_obj_rel_insert_input>;
  contextId?: InputMaybe<Scalars['uuid']>;
  delete?: InputMaybe<Scalars['Boolean']>;
  id?: InputMaybe<Scalars['uuid']>;
  insert?: InputMaybe<Scalars['Boolean']>;
  mimeId?: InputMaybe<Scalars['String']>;
  node?: InputMaybe<nodes_obj_rel_insert_input>;
  nodeId?: InputMaybe<Scalars['uuid']>;
  parents?: InputMaybe<Scalars['_text']>;
  role?: InputMaybe<Scalars['String']>;
  select?: InputMaybe<Scalars['Boolean']>;
  update?: InputMaybe<Scalars['Boolean']>;
}

/** order by max() on columns of table "permissions" */
export interface permissions_max_order_by {
  contextId?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  mimeId?: InputMaybe<order_by>;
  nodeId?: InputMaybe<order_by>;
  role?: InputMaybe<order_by>;
}

/** order by min() on columns of table "permissions" */
export interface permissions_min_order_by {
  contextId?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  mimeId?: InputMaybe<order_by>;
  nodeId?: InputMaybe<order_by>;
  role?: InputMaybe<order_by>;
}

/** on_conflict condition type for table "permissions" */
export interface permissions_on_conflict {
  constraint: permissions_constraint;
  update_columns?: Array<permissions_update_column>;
  where?: InputMaybe<permissions_bool_exp>;
}

/** Ordering options when selecting data from "permissions". */
export interface permissions_order_by {
  active?: InputMaybe<order_by>;
  context?: InputMaybe<nodes_order_by>;
  contextId?: InputMaybe<order_by>;
  delete?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  insert?: InputMaybe<order_by>;
  mimeId?: InputMaybe<order_by>;
  node?: InputMaybe<nodes_order_by>;
  nodeId?: InputMaybe<order_by>;
  parents?: InputMaybe<order_by>;
  role?: InputMaybe<order_by>;
  select?: InputMaybe<order_by>;
  update?: InputMaybe<order_by>;
}

/** primary key columns input for table: permissions */
export interface permissions_pk_columns_input {
  id: Scalars['uuid'];
}

/** select columns of table "permissions" */
export enum permissions_select_column {
  /** column name */
  active = 'active',
  /** column name */
  contextId = 'contextId',
  /** column name */
  delete = 'delete',
  /** column name */
  id = 'id',
  /** column name */
  insert = 'insert',
  /** column name */
  mimeId = 'mimeId',
  /** column name */
  nodeId = 'nodeId',
  /** column name */
  parents = 'parents',
  /** column name */
  role = 'role',
  /** column name */
  select = 'select',
  /** column name */
  update = 'update',
}

/** select "permissions_aggregate_bool_exp_bool_and_arguments_columns" columns of table "permissions" */
export enum permissions_select_column_permissions_aggregate_bool_exp_bool_and_arguments_columns {
  /** column name */
  active = 'active',
  /** column name */
  delete = 'delete',
  /** column name */
  insert = 'insert',
  /** column name */
  select = 'select',
  /** column name */
  update = 'update',
}

/** select "permissions_aggregate_bool_exp_bool_or_arguments_columns" columns of table "permissions" */
export enum permissions_select_column_permissions_aggregate_bool_exp_bool_or_arguments_columns {
  /** column name */
  active = 'active',
  /** column name */
  delete = 'delete',
  /** column name */
  insert = 'insert',
  /** column name */
  select = 'select',
  /** column name */
  update = 'update',
}

/** input type for updating data in table "permissions" */
export interface permissions_set_input {
  active?: InputMaybe<Scalars['Boolean']>;
  contextId?: InputMaybe<Scalars['uuid']>;
  delete?: InputMaybe<Scalars['Boolean']>;
  id?: InputMaybe<Scalars['uuid']>;
  insert?: InputMaybe<Scalars['Boolean']>;
  mimeId?: InputMaybe<Scalars['String']>;
  nodeId?: InputMaybe<Scalars['uuid']>;
  parents?: InputMaybe<Scalars['_text']>;
  role?: InputMaybe<Scalars['String']>;
  select?: InputMaybe<Scalars['Boolean']>;
  update?: InputMaybe<Scalars['Boolean']>;
}

/** Streaming cursor of the table "permissions" */
export interface permissions_stream_cursor_input {
  /** Stream column input with initial value */
  initial_value: permissions_stream_cursor_value_input;
  /** cursor ordering */
  ordering?: InputMaybe<cursor_ordering>;
}

/** Initial value of the column from where the streaming should start */
export interface permissions_stream_cursor_value_input {
  active?: InputMaybe<Scalars['Boolean']>;
  contextId?: InputMaybe<Scalars['uuid']>;
  delete?: InputMaybe<Scalars['Boolean']>;
  id?: InputMaybe<Scalars['uuid']>;
  insert?: InputMaybe<Scalars['Boolean']>;
  mimeId?: InputMaybe<Scalars['String']>;
  nodeId?: InputMaybe<Scalars['uuid']>;
  parents?: InputMaybe<Scalars['_text']>;
  role?: InputMaybe<Scalars['String']>;
  select?: InputMaybe<Scalars['Boolean']>;
  update?: InputMaybe<Scalars['Boolean']>;
}

/** update columns of table "permissions" */
export enum permissions_update_column {
  /** column name */
  active = 'active',
  /** column name */
  contextId = 'contextId',
  /** column name */
  delete = 'delete',
  /** column name */
  id = 'id',
  /** column name */
  insert = 'insert',
  /** column name */
  mimeId = 'mimeId',
  /** column name */
  nodeId = 'nodeId',
  /** column name */
  parents = 'parents',
  /** column name */
  role = 'role',
  /** column name */
  select = 'select',
  /** column name */
  update = 'update',
}

export interface permissions_updates {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<permissions_set_input>;
  where: permissions_bool_exp;
}

export interface relation_nodes_args {
  relation_name?: InputMaybe<Scalars['String']>;
}

export interface relations_aggregate_bool_exp {
  count?: InputMaybe<relations_aggregate_bool_exp_count>;
}

export interface relations_aggregate_bool_exp_count {
  arguments?: InputMaybe<Array<relations_select_column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
  filter?: InputMaybe<relations_bool_exp>;
  predicate: Int_comparison_exp;
}

/** order by aggregate values of table "relations" */
export interface relations_aggregate_order_by {
  count?: InputMaybe<order_by>;
  max?: InputMaybe<relations_max_order_by>;
  min?: InputMaybe<relations_min_order_by>;
}

/** input type for inserting array relation for remote table "relations" */
export interface relations_arr_rel_insert_input {
  data: Array<relations_insert_input>;
  /** upsert condition */
  on_conflict?: InputMaybe<relations_on_conflict>;
}

/** Boolean expression to filter rows from the table "relations". All fields are combined with a logical 'AND'. */
export interface relations_bool_exp {
  _and?: InputMaybe<Array<relations_bool_exp>>;
  _not?: InputMaybe<relations_bool_exp>;
  _or?: InputMaybe<Array<relations_bool_exp>>;
  id?: InputMaybe<uuid_comparison_exp>;
  name?: InputMaybe<String_comparison_exp>;
  node?: InputMaybe<nodes_bool_exp>;
  nodeId?: InputMaybe<uuid_comparison_exp>;
  parent?: InputMaybe<nodes_bool_exp>;
  parentId?: InputMaybe<uuid_comparison_exp>;
}

/** unique or primary key constraints on table "relations" */
export enum relations_constraint {
  /** unique or primary key constraint on columns "name", "parent_id" */
  relations_parent_id_name_key = 'relations_parent_id_name_key',
  /** unique or primary key constraint on columns "id" */
  relations_pkey = 'relations_pkey',
}

/** input type for inserting data into table "relations" */
export interface relations_insert_input {
  id?: InputMaybe<Scalars['uuid']>;
  name?: InputMaybe<Scalars['String']>;
  node?: InputMaybe<nodes_obj_rel_insert_input>;
  nodeId?: InputMaybe<Scalars['uuid']>;
  parent?: InputMaybe<nodes_obj_rel_insert_input>;
  parentId?: InputMaybe<Scalars['uuid']>;
}

/** order by max() on columns of table "relations" */
export interface relations_max_order_by {
  id?: InputMaybe<order_by>;
  name?: InputMaybe<order_by>;
  nodeId?: InputMaybe<order_by>;
  parentId?: InputMaybe<order_by>;
}

/** order by min() on columns of table "relations" */
export interface relations_min_order_by {
  id?: InputMaybe<order_by>;
  name?: InputMaybe<order_by>;
  nodeId?: InputMaybe<order_by>;
  parentId?: InputMaybe<order_by>;
}

/** on_conflict condition type for table "relations" */
export interface relations_on_conflict {
  constraint: relations_constraint;
  update_columns?: Array<relations_update_column>;
  where?: InputMaybe<relations_bool_exp>;
}

/** Ordering options when selecting data from "relations". */
export interface relations_order_by {
  id?: InputMaybe<order_by>;
  name?: InputMaybe<order_by>;
  node?: InputMaybe<nodes_order_by>;
  nodeId?: InputMaybe<order_by>;
  parent?: InputMaybe<nodes_order_by>;
  parentId?: InputMaybe<order_by>;
}

/** primary key columns input for table: relations */
export interface relations_pk_columns_input {
  id: Scalars['uuid'];
}

/** select columns of table "relations" */
export enum relations_select_column {
  /** column name */
  id = 'id',
  /** column name */
  name = 'name',
  /** column name */
  nodeId = 'nodeId',
  /** column name */
  parentId = 'parentId',
}

/** input type for updating data in table "relations" */
export interface relations_set_input {
  id?: InputMaybe<Scalars['uuid']>;
  name?: InputMaybe<Scalars['String']>;
  nodeId?: InputMaybe<Scalars['uuid']>;
  parentId?: InputMaybe<Scalars['uuid']>;
}

/** Streaming cursor of the table "relations" */
export interface relations_stream_cursor_input {
  /** Stream column input with initial value */
  initial_value: relations_stream_cursor_value_input;
  /** cursor ordering */
  ordering?: InputMaybe<cursor_ordering>;
}

/** Initial value of the column from where the streaming should start */
export interface relations_stream_cursor_value_input {
  id?: InputMaybe<Scalars['uuid']>;
  name?: InputMaybe<Scalars['String']>;
  nodeId?: InputMaybe<Scalars['uuid']>;
  parentId?: InputMaybe<Scalars['uuid']>;
}

/** update columns of table "relations" */
export enum relations_update_column {
  /** column name */
  id = 'id',
  /** column name */
  name = 'name',
  /** column name */
  nodeId = 'nodeId',
  /** column name */
  parentId = 'parentId',
}

export interface relations_updates {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<relations_set_input>;
  where: relations_bool_exp;
}

/** Boolean expression to compare columns of type "timestamptz". All fields are combined with logical 'AND'. */
export interface timestamptz_comparison_exp {
  _eq?: InputMaybe<Scalars['timestamptz']>;
  _gt?: InputMaybe<Scalars['timestamptz']>;
  _gte?: InputMaybe<Scalars['timestamptz']>;
  _in?: InputMaybe<Array<Scalars['timestamptz']>>;
  _is_null?: InputMaybe<Scalars['Boolean']>;
  _lt?: InputMaybe<Scalars['timestamptz']>;
  _lte?: InputMaybe<Scalars['timestamptz']>;
  _neq?: InputMaybe<Scalars['timestamptz']>;
  _nin?: InputMaybe<Array<Scalars['timestamptz']>>;
}

export interface users_aggregate_bool_exp {
  bool_and?: InputMaybe<users_aggregate_bool_exp_bool_and>;
  bool_or?: InputMaybe<users_aggregate_bool_exp_bool_or>;
  count?: InputMaybe<users_aggregate_bool_exp_count>;
}

export interface users_aggregate_bool_exp_bool_and {
  arguments: users_select_column_users_aggregate_bool_exp_bool_and_arguments_columns;
  distinct?: InputMaybe<Scalars['Boolean']>;
  filter?: InputMaybe<users_bool_exp>;
  predicate: Boolean_comparison_exp;
}

export interface users_aggregate_bool_exp_bool_or {
  arguments: users_select_column_users_aggregate_bool_exp_bool_or_arguments_columns;
  distinct?: InputMaybe<Scalars['Boolean']>;
  filter?: InputMaybe<users_bool_exp>;
  predicate: Boolean_comparison_exp;
}

export interface users_aggregate_bool_exp_count {
  arguments?: InputMaybe<Array<users_select_column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
  filter?: InputMaybe<users_bool_exp>;
  predicate: Int_comparison_exp;
}

/** order by aggregate values of table "auth.users" */
export interface users_aggregate_order_by {
  count?: InputMaybe<order_by>;
  max?: InputMaybe<users_max_order_by>;
  min?: InputMaybe<users_min_order_by>;
}

/** append existing jsonb value of filtered columns with new jsonb value */
export interface users_append_input {
  metadata?: InputMaybe<Scalars['jsonb']>;
}

/** input type for inserting array relation for remote table "auth.users" */
export interface users_arr_rel_insert_input {
  data: Array<users_insert_input>;
  /** upsert condition */
  on_conflict?: InputMaybe<users_on_conflict>;
}

/** Boolean expression to filter rows from the table "auth.users". All fields are combined with a logical 'AND'. */
export interface users_bool_exp {
  _and?: InputMaybe<Array<users_bool_exp>>;
  _not?: InputMaybe<users_bool_exp>;
  _or?: InputMaybe<Array<users_bool_exp>>;
  activeMfaType?: InputMaybe<String_comparison_exp>;
  avatarUrl?: InputMaybe<String_comparison_exp>;
  createdAt?: InputMaybe<timestamptz_comparison_exp>;
  currentChallenge?: InputMaybe<String_comparison_exp>;
  defaultRole?: InputMaybe<String_comparison_exp>;
  defaultRoleByRole?: InputMaybe<authRoles_bool_exp>;
  disabled?: InputMaybe<Boolean_comparison_exp>;
  displayName?: InputMaybe<String_comparison_exp>;
  email?: InputMaybe<citext_comparison_exp>;
  emailVerified?: InputMaybe<Boolean_comparison_exp>;
  id?: InputMaybe<uuid_comparison_exp>;
  isAnonymous?: InputMaybe<Boolean_comparison_exp>;
  lastSeen?: InputMaybe<timestamptz_comparison_exp>;
  locale?: InputMaybe<String_comparison_exp>;
  memberships?: InputMaybe<members_bool_exp>;
  memberships_aggregate?: InputMaybe<members_aggregate_bool_exp>;
  metadata?: InputMaybe<jsonb_comparison_exp>;
  newEmail?: InputMaybe<citext_comparison_exp>;
  otpHash?: InputMaybe<String_comparison_exp>;
  otpHashExpiresAt?: InputMaybe<timestamptz_comparison_exp>;
  otpMethodLastUsed?: InputMaybe<String_comparison_exp>;
  passwordHash?: InputMaybe<String_comparison_exp>;
  phoneNumber?: InputMaybe<String_comparison_exp>;
  phoneNumberVerified?: InputMaybe<Boolean_comparison_exp>;
  refreshTokens?: InputMaybe<authRefreshTokens_bool_exp>;
  refreshTokens_aggregate?: InputMaybe<authRefreshTokens_aggregate_bool_exp>;
  roles?: InputMaybe<authUserRoles_bool_exp>;
  roles_aggregate?: InputMaybe<authUserRoles_aggregate_bool_exp>;
  securityKeys?: InputMaybe<authUserSecurityKeys_bool_exp>;
  securityKeys_aggregate?: InputMaybe<authUserSecurityKeys_aggregate_bool_exp>;
  ticket?: InputMaybe<String_comparison_exp>;
  ticketExpiresAt?: InputMaybe<timestamptz_comparison_exp>;
  totpSecret?: InputMaybe<String_comparison_exp>;
  updatedAt?: InputMaybe<timestamptz_comparison_exp>;
  userProviders?: InputMaybe<authUserProviders_bool_exp>;
  userProviders_aggregate?: InputMaybe<authUserProviders_aggregate_bool_exp>;
}

/** unique or primary key constraints on table "auth.users" */
export enum users_constraint {
  /** unique or primary key constraint on columns "email" */
  users_email_key = 'users_email_key',
  /** unique or primary key constraint on columns "phone_number" */
  users_phone_number_key = 'users_phone_number_key',
  /** unique or primary key constraint on columns "id" */
  users_pkey = 'users_pkey',
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export interface users_delete_at_path_input {
  metadata?: InputMaybe<Array<Scalars['String']>>;
}

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export interface users_delete_elem_input {
  metadata?: InputMaybe<Scalars['Int']>;
}

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export interface users_delete_key_input {
  metadata?: InputMaybe<Scalars['String']>;
}

/** input type for inserting data into table "auth.users" */
export interface users_insert_input {
  activeMfaType?: InputMaybe<Scalars['String']>;
  avatarUrl?: InputMaybe<Scalars['String']>;
  createdAt?: InputMaybe<Scalars['timestamptz']>;
  currentChallenge?: InputMaybe<Scalars['String']>;
  defaultRole?: InputMaybe<Scalars['String']>;
  defaultRoleByRole?: InputMaybe<authRoles_obj_rel_insert_input>;
  disabled?: InputMaybe<Scalars['Boolean']>;
  displayName?: InputMaybe<Scalars['String']>;
  email?: InputMaybe<Scalars['citext']>;
  emailVerified?: InputMaybe<Scalars['Boolean']>;
  id?: InputMaybe<Scalars['uuid']>;
  isAnonymous?: InputMaybe<Scalars['Boolean']>;
  lastSeen?: InputMaybe<Scalars['timestamptz']>;
  locale?: InputMaybe<Scalars['String']>;
  memberships?: InputMaybe<members_arr_rel_insert_input>;
  metadata?: InputMaybe<Scalars['jsonb']>;
  newEmail?: InputMaybe<Scalars['citext']>;
  otpHash?: InputMaybe<Scalars['String']>;
  otpHashExpiresAt?: InputMaybe<Scalars['timestamptz']>;
  otpMethodLastUsed?: InputMaybe<Scalars['String']>;
  passwordHash?: InputMaybe<Scalars['String']>;
  phoneNumber?: InputMaybe<Scalars['String']>;
  phoneNumberVerified?: InputMaybe<Scalars['Boolean']>;
  refreshTokens?: InputMaybe<authRefreshTokens_arr_rel_insert_input>;
  roles?: InputMaybe<authUserRoles_arr_rel_insert_input>;
  securityKeys?: InputMaybe<authUserSecurityKeys_arr_rel_insert_input>;
  ticket?: InputMaybe<Scalars['String']>;
  ticketExpiresAt?: InputMaybe<Scalars['timestamptz']>;
  totpSecret?: InputMaybe<Scalars['String']>;
  updatedAt?: InputMaybe<Scalars['timestamptz']>;
  userProviders?: InputMaybe<authUserProviders_arr_rel_insert_input>;
}

/** order by max() on columns of table "auth.users" */
export interface users_max_order_by {
  activeMfaType?: InputMaybe<order_by>;
  avatarUrl?: InputMaybe<order_by>;
  createdAt?: InputMaybe<order_by>;
  currentChallenge?: InputMaybe<order_by>;
  defaultRole?: InputMaybe<order_by>;
  displayName?: InputMaybe<order_by>;
  email?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  lastSeen?: InputMaybe<order_by>;
  locale?: InputMaybe<order_by>;
  newEmail?: InputMaybe<order_by>;
  otpHash?: InputMaybe<order_by>;
  otpHashExpiresAt?: InputMaybe<order_by>;
  otpMethodLastUsed?: InputMaybe<order_by>;
  passwordHash?: InputMaybe<order_by>;
  phoneNumber?: InputMaybe<order_by>;
  ticket?: InputMaybe<order_by>;
  ticketExpiresAt?: InputMaybe<order_by>;
  totpSecret?: InputMaybe<order_by>;
  updatedAt?: InputMaybe<order_by>;
}

/** order by min() on columns of table "auth.users" */
export interface users_min_order_by {
  activeMfaType?: InputMaybe<order_by>;
  avatarUrl?: InputMaybe<order_by>;
  createdAt?: InputMaybe<order_by>;
  currentChallenge?: InputMaybe<order_by>;
  defaultRole?: InputMaybe<order_by>;
  displayName?: InputMaybe<order_by>;
  email?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  lastSeen?: InputMaybe<order_by>;
  locale?: InputMaybe<order_by>;
  newEmail?: InputMaybe<order_by>;
  otpHash?: InputMaybe<order_by>;
  otpHashExpiresAt?: InputMaybe<order_by>;
  otpMethodLastUsed?: InputMaybe<order_by>;
  passwordHash?: InputMaybe<order_by>;
  phoneNumber?: InputMaybe<order_by>;
  ticket?: InputMaybe<order_by>;
  ticketExpiresAt?: InputMaybe<order_by>;
  totpSecret?: InputMaybe<order_by>;
  updatedAt?: InputMaybe<order_by>;
}

/** input type for inserting object relation for remote table "auth.users" */
export interface users_obj_rel_insert_input {
  data: users_insert_input;
  /** upsert condition */
  on_conflict?: InputMaybe<users_on_conflict>;
}

/** on_conflict condition type for table "auth.users" */
export interface users_on_conflict {
  constraint: users_constraint;
  update_columns?: Array<users_update_column>;
  where?: InputMaybe<users_bool_exp>;
}

/** Ordering options when selecting data from "auth.users". */
export interface users_order_by {
  activeMfaType?: InputMaybe<order_by>;
  avatarUrl?: InputMaybe<order_by>;
  createdAt?: InputMaybe<order_by>;
  currentChallenge?: InputMaybe<order_by>;
  defaultRole?: InputMaybe<order_by>;
  defaultRoleByRole?: InputMaybe<authRoles_order_by>;
  disabled?: InputMaybe<order_by>;
  displayName?: InputMaybe<order_by>;
  email?: InputMaybe<order_by>;
  emailVerified?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  isAnonymous?: InputMaybe<order_by>;
  lastSeen?: InputMaybe<order_by>;
  locale?: InputMaybe<order_by>;
  memberships_aggregate?: InputMaybe<members_aggregate_order_by>;
  metadata?: InputMaybe<order_by>;
  newEmail?: InputMaybe<order_by>;
  otpHash?: InputMaybe<order_by>;
  otpHashExpiresAt?: InputMaybe<order_by>;
  otpMethodLastUsed?: InputMaybe<order_by>;
  passwordHash?: InputMaybe<order_by>;
  phoneNumber?: InputMaybe<order_by>;
  phoneNumberVerified?: InputMaybe<order_by>;
  refreshTokens_aggregate?: InputMaybe<authRefreshTokens_aggregate_order_by>;
  roles_aggregate?: InputMaybe<authUserRoles_aggregate_order_by>;
  securityKeys_aggregate?: InputMaybe<authUserSecurityKeys_aggregate_order_by>;
  ticket?: InputMaybe<order_by>;
  ticketExpiresAt?: InputMaybe<order_by>;
  totpSecret?: InputMaybe<order_by>;
  updatedAt?: InputMaybe<order_by>;
  userProviders_aggregate?: InputMaybe<authUserProviders_aggregate_order_by>;
}

/** primary key columns input for table: auth.users */
export interface users_pk_columns_input {
  id: Scalars['uuid'];
}

/** prepend existing jsonb value of filtered columns with new jsonb value */
export interface users_prepend_input {
  metadata?: InputMaybe<Scalars['jsonb']>;
}

/** select columns of table "auth.users" */
export enum users_select_column {
  /** column name */
  activeMfaType = 'activeMfaType',
  /** column name */
  avatarUrl = 'avatarUrl',
  /** column name */
  createdAt = 'createdAt',
  /** column name */
  currentChallenge = 'currentChallenge',
  /** column name */
  defaultRole = 'defaultRole',
  /** column name */
  disabled = 'disabled',
  /** column name */
  displayName = 'displayName',
  /** column name */
  email = 'email',
  /** column name */
  emailVerified = 'emailVerified',
  /** column name */
  id = 'id',
  /** column name */
  isAnonymous = 'isAnonymous',
  /** column name */
  lastSeen = 'lastSeen',
  /** column name */
  locale = 'locale',
  /** column name */
  metadata = 'metadata',
  /** column name */
  newEmail = 'newEmail',
  /** column name */
  otpHash = 'otpHash',
  /** column name */
  otpHashExpiresAt = 'otpHashExpiresAt',
  /** column name */
  otpMethodLastUsed = 'otpMethodLastUsed',
  /** column name */
  passwordHash = 'passwordHash',
  /** column name */
  phoneNumber = 'phoneNumber',
  /** column name */
  phoneNumberVerified = 'phoneNumberVerified',
  /** column name */
  ticket = 'ticket',
  /** column name */
  ticketExpiresAt = 'ticketExpiresAt',
  /** column name */
  totpSecret = 'totpSecret',
  /** column name */
  updatedAt = 'updatedAt',
}

/** select "users_aggregate_bool_exp_bool_and_arguments_columns" columns of table "auth.users" */
export enum users_select_column_users_aggregate_bool_exp_bool_and_arguments_columns {
  /** column name */
  disabled = 'disabled',
  /** column name */
  emailVerified = 'emailVerified',
  /** column name */
  isAnonymous = 'isAnonymous',
  /** column name */
  phoneNumberVerified = 'phoneNumberVerified',
}

/** select "users_aggregate_bool_exp_bool_or_arguments_columns" columns of table "auth.users" */
export enum users_select_column_users_aggregate_bool_exp_bool_or_arguments_columns {
  /** column name */
  disabled = 'disabled',
  /** column name */
  emailVerified = 'emailVerified',
  /** column name */
  isAnonymous = 'isAnonymous',
  /** column name */
  phoneNumberVerified = 'phoneNumberVerified',
}

/** input type for updating data in table "auth.users" */
export interface users_set_input {
  activeMfaType?: InputMaybe<Scalars['String']>;
  avatarUrl?: InputMaybe<Scalars['String']>;
  createdAt?: InputMaybe<Scalars['timestamptz']>;
  currentChallenge?: InputMaybe<Scalars['String']>;
  defaultRole?: InputMaybe<Scalars['String']>;
  disabled?: InputMaybe<Scalars['Boolean']>;
  displayName?: InputMaybe<Scalars['String']>;
  email?: InputMaybe<Scalars['citext']>;
  emailVerified?: InputMaybe<Scalars['Boolean']>;
  id?: InputMaybe<Scalars['uuid']>;
  isAnonymous?: InputMaybe<Scalars['Boolean']>;
  lastSeen?: InputMaybe<Scalars['timestamptz']>;
  locale?: InputMaybe<Scalars['String']>;
  metadata?: InputMaybe<Scalars['jsonb']>;
  newEmail?: InputMaybe<Scalars['citext']>;
  otpHash?: InputMaybe<Scalars['String']>;
  otpHashExpiresAt?: InputMaybe<Scalars['timestamptz']>;
  otpMethodLastUsed?: InputMaybe<Scalars['String']>;
  passwordHash?: InputMaybe<Scalars['String']>;
  phoneNumber?: InputMaybe<Scalars['String']>;
  phoneNumberVerified?: InputMaybe<Scalars['Boolean']>;
  ticket?: InputMaybe<Scalars['String']>;
  ticketExpiresAt?: InputMaybe<Scalars['timestamptz']>;
  totpSecret?: InputMaybe<Scalars['String']>;
  updatedAt?: InputMaybe<Scalars['timestamptz']>;
}

/** Streaming cursor of the table "users" */
export interface users_stream_cursor_input {
  /** Stream column input with initial value */
  initial_value: users_stream_cursor_value_input;
  /** cursor ordering */
  ordering?: InputMaybe<cursor_ordering>;
}

/** Initial value of the column from where the streaming should start */
export interface users_stream_cursor_value_input {
  activeMfaType?: InputMaybe<Scalars['String']>;
  avatarUrl?: InputMaybe<Scalars['String']>;
  createdAt?: InputMaybe<Scalars['timestamptz']>;
  currentChallenge?: InputMaybe<Scalars['String']>;
  defaultRole?: InputMaybe<Scalars['String']>;
  disabled?: InputMaybe<Scalars['Boolean']>;
  displayName?: InputMaybe<Scalars['String']>;
  email?: InputMaybe<Scalars['citext']>;
  emailVerified?: InputMaybe<Scalars['Boolean']>;
  id?: InputMaybe<Scalars['uuid']>;
  isAnonymous?: InputMaybe<Scalars['Boolean']>;
  lastSeen?: InputMaybe<Scalars['timestamptz']>;
  locale?: InputMaybe<Scalars['String']>;
  metadata?: InputMaybe<Scalars['jsonb']>;
  newEmail?: InputMaybe<Scalars['citext']>;
  otpHash?: InputMaybe<Scalars['String']>;
  otpHashExpiresAt?: InputMaybe<Scalars['timestamptz']>;
  otpMethodLastUsed?: InputMaybe<Scalars['String']>;
  passwordHash?: InputMaybe<Scalars['String']>;
  phoneNumber?: InputMaybe<Scalars['String']>;
  phoneNumberVerified?: InputMaybe<Scalars['Boolean']>;
  ticket?: InputMaybe<Scalars['String']>;
  ticketExpiresAt?: InputMaybe<Scalars['timestamptz']>;
  totpSecret?: InputMaybe<Scalars['String']>;
  updatedAt?: InputMaybe<Scalars['timestamptz']>;
}

/** update columns of table "auth.users" */
export enum users_update_column {
  /** column name */
  activeMfaType = 'activeMfaType',
  /** column name */
  avatarUrl = 'avatarUrl',
  /** column name */
  createdAt = 'createdAt',
  /** column name */
  currentChallenge = 'currentChallenge',
  /** column name */
  defaultRole = 'defaultRole',
  /** column name */
  disabled = 'disabled',
  /** column name */
  displayName = 'displayName',
  /** column name */
  email = 'email',
  /** column name */
  emailVerified = 'emailVerified',
  /** column name */
  id = 'id',
  /** column name */
  isAnonymous = 'isAnonymous',
  /** column name */
  lastSeen = 'lastSeen',
  /** column name */
  locale = 'locale',
  /** column name */
  metadata = 'metadata',
  /** column name */
  newEmail = 'newEmail',
  /** column name */
  otpHash = 'otpHash',
  /** column name */
  otpHashExpiresAt = 'otpHashExpiresAt',
  /** column name */
  otpMethodLastUsed = 'otpMethodLastUsed',
  /** column name */
  passwordHash = 'passwordHash',
  /** column name */
  phoneNumber = 'phoneNumber',
  /** column name */
  phoneNumberVerified = 'phoneNumberVerified',
  /** column name */
  ticket = 'ticket',
  /** column name */
  ticketExpiresAt = 'ticketExpiresAt',
  /** column name */
  totpSecret = 'totpSecret',
  /** column name */
  updatedAt = 'updatedAt',
}

export interface users_updates {
  /** append existing jsonb value of filtered columns with new jsonb value */
  _append?: InputMaybe<users_append_input>;
  /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
  _delete_at_path?: InputMaybe<users_delete_at_path_input>;
  /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
  _delete_elem?: InputMaybe<users_delete_elem_input>;
  /** delete key/value pair or string element. key/value pairs are matched based on their key value */
  _delete_key?: InputMaybe<users_delete_key_input>;
  /** prepend existing jsonb value of filtered columns with new jsonb value */
  _prepend?: InputMaybe<users_prepend_input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<users_set_input>;
  where: users_bool_exp;
}

/** Boolean expression to compare columns of type "uuid". All fields are combined with logical 'AND'. */
export interface uuid_comparison_exp {
  _eq?: InputMaybe<Scalars['uuid']>;
  _gt?: InputMaybe<Scalars['uuid']>;
  _gte?: InputMaybe<Scalars['uuid']>;
  _in?: InputMaybe<Array<Scalars['uuid']>>;
  _is_null?: InputMaybe<Scalars['Boolean']>;
  _lt?: InputMaybe<Scalars['uuid']>;
  _lte?: InputMaybe<Scalars['uuid']>;
  _neq?: InputMaybe<Scalars['uuid']>;
  _nin?: InputMaybe<Array<Scalars['uuid']>>;
}

export const scalarsEnumsHash: import('gqty').ScalarsEnumsHash = {
  Boolean: true,
  Float: true,
  Int: true,
  String: true,
  _text: true,
  authProviderRequests_constraint: true,
  authProviderRequests_select_column: true,
  authProviderRequests_update_column: true,
  authProviders_constraint: true,
  authProviders_select_column: true,
  authProviders_update_column: true,
  authRefreshTokens_constraint: true,
  authRefreshTokens_select_column: true,
  authRefreshTokens_update_column: true,
  authRoles_constraint: true,
  authRoles_select_column: true,
  authRoles_update_column: true,
  authUserProviders_constraint: true,
  authUserProviders_select_column: true,
  authUserProviders_update_column: true,
  authUserRoles_constraint: true,
  authUserRoles_select_column: true,
  authUserRoles_update_column: true,
  authUserSecurityKeys_constraint: true,
  authUserSecurityKeys_select_column: true,
  authUserSecurityKeys_update_column: true,
  bigint: true,
  buckets_constraint: true,
  buckets_select_column: true,
  buckets_update_column: true,
  bytea: true,
  citext: true,
  cursor_ordering: true,
  fields_constraint: true,
  fields_select_column: true,
  fields_update_column: true,
  files_constraint: true,
  files_select_column: true,
  files_select_column_files_aggregate_bool_exp_bool_and_arguments_columns: true,
  files_select_column_files_aggregate_bool_exp_bool_or_arguments_columns: true,
  files_update_column: true,
  jsonb: true,
  members_constraint: true,
  members_select_column: true,
  members_select_column_members_aggregate_bool_exp_bool_and_arguments_columns:
    true,
  members_select_column_members_aggregate_bool_exp_bool_or_arguments_columns:
    true,
  members_update_column: true,
  mimes_constraint: true,
  mimes_select_column: true,
  mimes_update_column: true,
  nodes_constraint: true,
  nodes_select_column: true,
  nodes_select_column_nodes_aggregate_bool_exp_bool_and_arguments_columns: true,
  nodes_select_column_nodes_aggregate_bool_exp_bool_or_arguments_columns: true,
  nodes_update_column: true,
  order_by: true,
  permissions_constraint: true,
  permissions_select_column: true,
  permissions_select_column_permissions_aggregate_bool_exp_bool_and_arguments_columns:
    true,
  permissions_select_column_permissions_aggregate_bool_exp_bool_or_arguments_columns:
    true,
  permissions_update_column: true,
  relations_constraint: true,
  relations_select_column: true,
  relations_update_column: true,
  timestamptz: true,
  users_constraint: true,
  users_select_column: true,
  users_select_column_users_aggregate_bool_exp_bool_and_arguments_columns: true,
  users_select_column_users_aggregate_bool_exp_bool_or_arguments_columns: true,
  users_update_column: true,
  uuid: true,
};
export const generatedSchema = {
  Boolean_comparison_exp: {
    _eq: { __type: 'Boolean' },
    _gt: { __type: 'Boolean' },
    _gte: { __type: 'Boolean' },
    _in: { __type: '[Boolean!]' },
    _is_null: { __type: 'Boolean' },
    _lt: { __type: 'Boolean' },
    _lte: { __type: 'Boolean' },
    _neq: { __type: 'Boolean' },
    _nin: { __type: '[Boolean!]' },
  },
  Int_comparison_exp: {
    _eq: { __type: 'Int' },
    _gt: { __type: 'Int' },
    _gte: { __type: 'Int' },
    _in: { __type: '[Int!]' },
    _is_null: { __type: 'Boolean' },
    _lt: { __type: 'Int' },
    _lte: { __type: 'Int' },
    _neq: { __type: 'Int' },
    _nin: { __type: '[Int!]' },
  },
  String_comparison_exp: {
    _eq: { __type: 'String' },
    _gt: { __type: 'String' },
    _gte: { __type: 'String' },
    _ilike: { __type: 'String' },
    _in: { __type: '[String!]' },
    _iregex: { __type: 'String' },
    _is_null: { __type: 'Boolean' },
    _like: { __type: 'String' },
    _lt: { __type: 'String' },
    _lte: { __type: 'String' },
    _neq: { __type: 'String' },
    _nilike: { __type: 'String' },
    _nin: { __type: '[String!]' },
    _niregex: { __type: 'String' },
    _nlike: { __type: 'String' },
    _nregex: { __type: 'String' },
    _nsimilar: { __type: 'String' },
    _regex: { __type: 'String' },
    _similar: { __type: 'String' },
  },
  _text_comparison_exp: {
    _eq: { __type: '_text' },
    _gt: { __type: '_text' },
    _gte: { __type: '_text' },
    _in: { __type: '[_text!]' },
    _is_null: { __type: 'Boolean' },
    _lt: { __type: '_text' },
    _lte: { __type: '_text' },
    _neq: { __type: '_text' },
    _nin: { __type: '[_text!]' },
  },
  authProviderRequests: {
    __typename: { __type: 'String!' },
    id: { __type: 'uuid!' },
    options: { __type: 'jsonb', __args: { path: 'String' } },
  },
  authProviderRequests_aggregate: {
    __typename: { __type: 'String!' },
    aggregate: { __type: 'authProviderRequests_aggregate_fields' },
    nodes: { __type: '[authProviderRequests!]!' },
  },
  authProviderRequests_aggregate_fields: {
    __typename: { __type: 'String!' },
    count: {
      __type: 'Int!',
      __args: {
        columns: '[authProviderRequests_select_column!]',
        distinct: 'Boolean',
      },
    },
    max: { __type: 'authProviderRequests_max_fields' },
    min: { __type: 'authProviderRequests_min_fields' },
  },
  authProviderRequests_append_input: { options: { __type: 'jsonb' } },
  authProviderRequests_bool_exp: {
    _and: { __type: '[authProviderRequests_bool_exp!]' },
    _not: { __type: 'authProviderRequests_bool_exp' },
    _or: { __type: '[authProviderRequests_bool_exp!]' },
    id: { __type: 'uuid_comparison_exp' },
    options: { __type: 'jsonb_comparison_exp' },
  },
  authProviderRequests_delete_at_path_input: {
    options: { __type: '[String!]' },
  },
  authProviderRequests_delete_elem_input: { options: { __type: 'Int' } },
  authProviderRequests_delete_key_input: { options: { __type: 'String' } },
  authProviderRequests_insert_input: {
    id: { __type: 'uuid' },
    options: { __type: 'jsonb' },
  },
  authProviderRequests_max_fields: {
    __typename: { __type: 'String!' },
    id: { __type: 'uuid' },
  },
  authProviderRequests_min_fields: {
    __typename: { __type: 'String!' },
    id: { __type: 'uuid' },
  },
  authProviderRequests_mutation_response: {
    __typename: { __type: 'String!' },
    affected_rows: { __type: 'Int!' },
    returning: { __type: '[authProviderRequests!]!' },
  },
  authProviderRequests_on_conflict: {
    constraint: { __type: 'authProviderRequests_constraint!' },
    update_columns: { __type: '[authProviderRequests_update_column!]!' },
    where: { __type: 'authProviderRequests_bool_exp' },
  },
  authProviderRequests_order_by: {
    id: { __type: 'order_by' },
    options: { __type: 'order_by' },
  },
  authProviderRequests_pk_columns_input: { id: { __type: 'uuid!' } },
  authProviderRequests_prepend_input: { options: { __type: 'jsonb' } },
  authProviderRequests_set_input: {
    id: { __type: 'uuid' },
    options: { __type: 'jsonb' },
  },
  authProviderRequests_stream_cursor_input: {
    initial_value: {
      __type: 'authProviderRequests_stream_cursor_value_input!',
    },
    ordering: { __type: 'cursor_ordering' },
  },
  authProviderRequests_stream_cursor_value_input: {
    id: { __type: 'uuid' },
    options: { __type: 'jsonb' },
  },
  authProviderRequests_updates: {
    _append: { __type: 'authProviderRequests_append_input' },
    _delete_at_path: { __type: 'authProviderRequests_delete_at_path_input' },
    _delete_elem: { __type: 'authProviderRequests_delete_elem_input' },
    _delete_key: { __type: 'authProviderRequests_delete_key_input' },
    _prepend: { __type: 'authProviderRequests_prepend_input' },
    _set: { __type: 'authProviderRequests_set_input' },
    where: { __type: 'authProviderRequests_bool_exp!' },
  },
  authProviders: {
    __typename: { __type: 'String!' },
    id: { __type: 'String!' },
    userProviders: {
      __type: '[authUserProviders!]!',
      __args: {
        distinct_on: '[authUserProviders_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[authUserProviders_order_by!]',
        where: 'authUserProviders_bool_exp',
      },
    },
    userProviders_aggregate: {
      __type: 'authUserProviders_aggregate!',
      __args: {
        distinct_on: '[authUserProviders_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[authUserProviders_order_by!]',
        where: 'authUserProviders_bool_exp',
      },
    },
  },
  authProviders_aggregate: {
    __typename: { __type: 'String!' },
    aggregate: { __type: 'authProviders_aggregate_fields' },
    nodes: { __type: '[authProviders!]!' },
  },
  authProviders_aggregate_fields: {
    __typename: { __type: 'String!' },
    count: {
      __type: 'Int!',
      __args: {
        columns: '[authProviders_select_column!]',
        distinct: 'Boolean',
      },
    },
    max: { __type: 'authProviders_max_fields' },
    min: { __type: 'authProviders_min_fields' },
  },
  authProviders_bool_exp: {
    _and: { __type: '[authProviders_bool_exp!]' },
    _not: { __type: 'authProviders_bool_exp' },
    _or: { __type: '[authProviders_bool_exp!]' },
    id: { __type: 'String_comparison_exp' },
    userProviders: { __type: 'authUserProviders_bool_exp' },
    userProviders_aggregate: { __type: 'authUserProviders_aggregate_bool_exp' },
  },
  authProviders_insert_input: {
    id: { __type: 'String' },
    userProviders: { __type: 'authUserProviders_arr_rel_insert_input' },
  },
  authProviders_max_fields: {
    __typename: { __type: 'String!' },
    id: { __type: 'String' },
  },
  authProviders_min_fields: {
    __typename: { __type: 'String!' },
    id: { __type: 'String' },
  },
  authProviders_mutation_response: {
    __typename: { __type: 'String!' },
    affected_rows: { __type: 'Int!' },
    returning: { __type: '[authProviders!]!' },
  },
  authProviders_obj_rel_insert_input: {
    data: { __type: 'authProviders_insert_input!' },
    on_conflict: { __type: 'authProviders_on_conflict' },
  },
  authProviders_on_conflict: {
    constraint: { __type: 'authProviders_constraint!' },
    update_columns: { __type: '[authProviders_update_column!]!' },
    where: { __type: 'authProviders_bool_exp' },
  },
  authProviders_order_by: {
    id: { __type: 'order_by' },
    userProviders_aggregate: { __type: 'authUserProviders_aggregate_order_by' },
  },
  authProviders_pk_columns_input: { id: { __type: 'String!' } },
  authProviders_set_input: { id: { __type: 'String' } },
  authProviders_stream_cursor_input: {
    initial_value: { __type: 'authProviders_stream_cursor_value_input!' },
    ordering: { __type: 'cursor_ordering' },
  },
  authProviders_stream_cursor_value_input: { id: { __type: 'String' } },
  authProviders_updates: {
    _set: { __type: 'authProviders_set_input' },
    where: { __type: 'authProviders_bool_exp!' },
  },
  authRefreshTokens: {
    __typename: { __type: 'String!' },
    createdAt: { __type: 'timestamptz!' },
    expiresAt: { __type: 'timestamptz!' },
    refreshToken: { __type: 'uuid!' },
    refreshTokenHash: { __type: 'String' },
    user: { __type: 'users!' },
    userId: { __type: 'uuid!' },
  },
  authRefreshTokens_aggregate: {
    __typename: { __type: 'String!' },
    aggregate: { __type: 'authRefreshTokens_aggregate_fields' },
    nodes: { __type: '[authRefreshTokens!]!' },
  },
  authRefreshTokens_aggregate_bool_exp: {
    count: { __type: 'authRefreshTokens_aggregate_bool_exp_count' },
  },
  authRefreshTokens_aggregate_bool_exp_count: {
    arguments: { __type: '[authRefreshTokens_select_column!]' },
    distinct: { __type: 'Boolean' },
    filter: { __type: 'authRefreshTokens_bool_exp' },
    predicate: { __type: 'Int_comparison_exp!' },
  },
  authRefreshTokens_aggregate_fields: {
    __typename: { __type: 'String!' },
    count: {
      __type: 'Int!',
      __args: {
        columns: '[authRefreshTokens_select_column!]',
        distinct: 'Boolean',
      },
    },
    max: { __type: 'authRefreshTokens_max_fields' },
    min: { __type: 'authRefreshTokens_min_fields' },
  },
  authRefreshTokens_aggregate_order_by: {
    count: { __type: 'order_by' },
    max: { __type: 'authRefreshTokens_max_order_by' },
    min: { __type: 'authRefreshTokens_min_order_by' },
  },
  authRefreshTokens_arr_rel_insert_input: {
    data: { __type: '[authRefreshTokens_insert_input!]!' },
    on_conflict: { __type: 'authRefreshTokens_on_conflict' },
  },
  authRefreshTokens_bool_exp: {
    _and: { __type: '[authRefreshTokens_bool_exp!]' },
    _not: { __type: 'authRefreshTokens_bool_exp' },
    _or: { __type: '[authRefreshTokens_bool_exp!]' },
    createdAt: { __type: 'timestamptz_comparison_exp' },
    expiresAt: { __type: 'timestamptz_comparison_exp' },
    refreshToken: { __type: 'uuid_comparison_exp' },
    refreshTokenHash: { __type: 'String_comparison_exp' },
    user: { __type: 'users_bool_exp' },
    userId: { __type: 'uuid_comparison_exp' },
  },
  authRefreshTokens_insert_input: {
    createdAt: { __type: 'timestamptz' },
    expiresAt: { __type: 'timestamptz' },
    refreshToken: { __type: 'uuid' },
    user: { __type: 'users_obj_rel_insert_input' },
    userId: { __type: 'uuid' },
  },
  authRefreshTokens_max_fields: {
    __typename: { __type: 'String!' },
    createdAt: { __type: 'timestamptz' },
    expiresAt: { __type: 'timestamptz' },
    refreshToken: { __type: 'uuid' },
    refreshTokenHash: { __type: 'String' },
    userId: { __type: 'uuid' },
  },
  authRefreshTokens_max_order_by: {
    createdAt: { __type: 'order_by' },
    expiresAt: { __type: 'order_by' },
    refreshToken: { __type: 'order_by' },
    refreshTokenHash: { __type: 'order_by' },
    userId: { __type: 'order_by' },
  },
  authRefreshTokens_min_fields: {
    __typename: { __type: 'String!' },
    createdAt: { __type: 'timestamptz' },
    expiresAt: { __type: 'timestamptz' },
    refreshToken: { __type: 'uuid' },
    refreshTokenHash: { __type: 'String' },
    userId: { __type: 'uuid' },
  },
  authRefreshTokens_min_order_by: {
    createdAt: { __type: 'order_by' },
    expiresAt: { __type: 'order_by' },
    refreshToken: { __type: 'order_by' },
    refreshTokenHash: { __type: 'order_by' },
    userId: { __type: 'order_by' },
  },
  authRefreshTokens_mutation_response: {
    __typename: { __type: 'String!' },
    affected_rows: { __type: 'Int!' },
    returning: { __type: '[authRefreshTokens!]!' },
  },
  authRefreshTokens_on_conflict: {
    constraint: { __type: 'authRefreshTokens_constraint!' },
    update_columns: { __type: '[authRefreshTokens_update_column!]!' },
    where: { __type: 'authRefreshTokens_bool_exp' },
  },
  authRefreshTokens_order_by: {
    createdAt: { __type: 'order_by' },
    expiresAt: { __type: 'order_by' },
    refreshToken: { __type: 'order_by' },
    refreshTokenHash: { __type: 'order_by' },
    user: { __type: 'users_order_by' },
    userId: { __type: 'order_by' },
  },
  authRefreshTokens_pk_columns_input: { refreshToken: { __type: 'uuid!' } },
  authRefreshTokens_set_input: {
    createdAt: { __type: 'timestamptz' },
    expiresAt: { __type: 'timestamptz' },
    refreshToken: { __type: 'uuid' },
    userId: { __type: 'uuid' },
  },
  authRefreshTokens_stream_cursor_input: {
    initial_value: { __type: 'authRefreshTokens_stream_cursor_value_input!' },
    ordering: { __type: 'cursor_ordering' },
  },
  authRefreshTokens_stream_cursor_value_input: {
    createdAt: { __type: 'timestamptz' },
    expiresAt: { __type: 'timestamptz' },
    refreshToken: { __type: 'uuid' },
    refreshTokenHash: { __type: 'String' },
    userId: { __type: 'uuid' },
  },
  authRefreshTokens_updates: {
    _set: { __type: 'authRefreshTokens_set_input' },
    where: { __type: 'authRefreshTokens_bool_exp!' },
  },
  authRoles: {
    __typename: { __type: 'String!' },
    role: { __type: 'String!' },
    userRoles: {
      __type: '[authUserRoles!]!',
      __args: {
        distinct_on: '[authUserRoles_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[authUserRoles_order_by!]',
        where: 'authUserRoles_bool_exp',
      },
    },
    userRoles_aggregate: {
      __type: 'authUserRoles_aggregate!',
      __args: {
        distinct_on: '[authUserRoles_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[authUserRoles_order_by!]',
        where: 'authUserRoles_bool_exp',
      },
    },
    usersByDefaultRole: {
      __type: '[users!]!',
      __args: {
        distinct_on: '[users_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[users_order_by!]',
        where: 'users_bool_exp',
      },
    },
    usersByDefaultRole_aggregate: {
      __type: 'users_aggregate!',
      __args: {
        distinct_on: '[users_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[users_order_by!]',
        where: 'users_bool_exp',
      },
    },
  },
  authRoles_aggregate: {
    __typename: { __type: 'String!' },
    aggregate: { __type: 'authRoles_aggregate_fields' },
    nodes: { __type: '[authRoles!]!' },
  },
  authRoles_aggregate_fields: {
    __typename: { __type: 'String!' },
    count: {
      __type: 'Int!',
      __args: { columns: '[authRoles_select_column!]', distinct: 'Boolean' },
    },
    max: { __type: 'authRoles_max_fields' },
    min: { __type: 'authRoles_min_fields' },
  },
  authRoles_bool_exp: {
    _and: { __type: '[authRoles_bool_exp!]' },
    _not: { __type: 'authRoles_bool_exp' },
    _or: { __type: '[authRoles_bool_exp!]' },
    role: { __type: 'String_comparison_exp' },
    userRoles: { __type: 'authUserRoles_bool_exp' },
    userRoles_aggregate: { __type: 'authUserRoles_aggregate_bool_exp' },
    usersByDefaultRole: { __type: 'users_bool_exp' },
    usersByDefaultRole_aggregate: { __type: 'users_aggregate_bool_exp' },
  },
  authRoles_insert_input: {
    role: { __type: 'String' },
    userRoles: { __type: 'authUserRoles_arr_rel_insert_input' },
    usersByDefaultRole: { __type: 'users_arr_rel_insert_input' },
  },
  authRoles_max_fields: {
    __typename: { __type: 'String!' },
    role: { __type: 'String' },
  },
  authRoles_min_fields: {
    __typename: { __type: 'String!' },
    role: { __type: 'String' },
  },
  authRoles_mutation_response: {
    __typename: { __type: 'String!' },
    affected_rows: { __type: 'Int!' },
    returning: { __type: '[authRoles!]!' },
  },
  authRoles_obj_rel_insert_input: {
    data: { __type: 'authRoles_insert_input!' },
    on_conflict: { __type: 'authRoles_on_conflict' },
  },
  authRoles_on_conflict: {
    constraint: { __type: 'authRoles_constraint!' },
    update_columns: { __type: '[authRoles_update_column!]!' },
    where: { __type: 'authRoles_bool_exp' },
  },
  authRoles_order_by: {
    role: { __type: 'order_by' },
    userRoles_aggregate: { __type: 'authUserRoles_aggregate_order_by' },
    usersByDefaultRole_aggregate: { __type: 'users_aggregate_order_by' },
  },
  authRoles_pk_columns_input: { role: { __type: 'String!' } },
  authRoles_set_input: { role: { __type: 'String' } },
  authRoles_stream_cursor_input: {
    initial_value: { __type: 'authRoles_stream_cursor_value_input!' },
    ordering: { __type: 'cursor_ordering' },
  },
  authRoles_stream_cursor_value_input: { role: { __type: 'String' } },
  authRoles_updates: {
    _set: { __type: 'authRoles_set_input' },
    where: { __type: 'authRoles_bool_exp!' },
  },
  authUserProviders: {
    __typename: { __type: 'String!' },
    accessToken: { __type: 'String!' },
    createdAt: { __type: 'timestamptz!' },
    id: { __type: 'uuid!' },
    provider: { __type: 'authProviders!' },
    providerId: { __type: 'String!' },
    providerUserId: { __type: 'String!' },
    refreshToken: { __type: 'String' },
    updatedAt: { __type: 'timestamptz!' },
    user: { __type: 'users!' },
    userId: { __type: 'uuid!' },
  },
  authUserProviders_aggregate: {
    __typename: { __type: 'String!' },
    aggregate: { __type: 'authUserProviders_aggregate_fields' },
    nodes: { __type: '[authUserProviders!]!' },
  },
  authUserProviders_aggregate_bool_exp: {
    count: { __type: 'authUserProviders_aggregate_bool_exp_count' },
  },
  authUserProviders_aggregate_bool_exp_count: {
    arguments: { __type: '[authUserProviders_select_column!]' },
    distinct: { __type: 'Boolean' },
    filter: { __type: 'authUserProviders_bool_exp' },
    predicate: { __type: 'Int_comparison_exp!' },
  },
  authUserProviders_aggregate_fields: {
    __typename: { __type: 'String!' },
    count: {
      __type: 'Int!',
      __args: {
        columns: '[authUserProviders_select_column!]',
        distinct: 'Boolean',
      },
    },
    max: { __type: 'authUserProviders_max_fields' },
    min: { __type: 'authUserProviders_min_fields' },
  },
  authUserProviders_aggregate_order_by: {
    count: { __type: 'order_by' },
    max: { __type: 'authUserProviders_max_order_by' },
    min: { __type: 'authUserProviders_min_order_by' },
  },
  authUserProviders_arr_rel_insert_input: {
    data: { __type: '[authUserProviders_insert_input!]!' },
    on_conflict: { __type: 'authUserProviders_on_conflict' },
  },
  authUserProviders_bool_exp: {
    _and: { __type: '[authUserProviders_bool_exp!]' },
    _not: { __type: 'authUserProviders_bool_exp' },
    _or: { __type: '[authUserProviders_bool_exp!]' },
    accessToken: { __type: 'String_comparison_exp' },
    createdAt: { __type: 'timestamptz_comparison_exp' },
    id: { __type: 'uuid_comparison_exp' },
    provider: { __type: 'authProviders_bool_exp' },
    providerId: { __type: 'String_comparison_exp' },
    providerUserId: { __type: 'String_comparison_exp' },
    refreshToken: { __type: 'String_comparison_exp' },
    updatedAt: { __type: 'timestamptz_comparison_exp' },
    user: { __type: 'users_bool_exp' },
    userId: { __type: 'uuid_comparison_exp' },
  },
  authUserProviders_insert_input: {
    accessToken: { __type: 'String' },
    createdAt: { __type: 'timestamptz' },
    id: { __type: 'uuid' },
    provider: { __type: 'authProviders_obj_rel_insert_input' },
    providerId: { __type: 'String' },
    providerUserId: { __type: 'String' },
    refreshToken: { __type: 'String' },
    updatedAt: { __type: 'timestamptz' },
    user: { __type: 'users_obj_rel_insert_input' },
    userId: { __type: 'uuid' },
  },
  authUserProviders_max_fields: {
    __typename: { __type: 'String!' },
    accessToken: { __type: 'String' },
    createdAt: { __type: 'timestamptz' },
    id: { __type: 'uuid' },
    providerId: { __type: 'String' },
    providerUserId: { __type: 'String' },
    refreshToken: { __type: 'String' },
    updatedAt: { __type: 'timestamptz' },
    userId: { __type: 'uuid' },
  },
  authUserProviders_max_order_by: {
    accessToken: { __type: 'order_by' },
    createdAt: { __type: 'order_by' },
    id: { __type: 'order_by' },
    providerId: { __type: 'order_by' },
    providerUserId: { __type: 'order_by' },
    refreshToken: { __type: 'order_by' },
    updatedAt: { __type: 'order_by' },
    userId: { __type: 'order_by' },
  },
  authUserProviders_min_fields: {
    __typename: { __type: 'String!' },
    accessToken: { __type: 'String' },
    createdAt: { __type: 'timestamptz' },
    id: { __type: 'uuid' },
    providerId: { __type: 'String' },
    providerUserId: { __type: 'String' },
    refreshToken: { __type: 'String' },
    updatedAt: { __type: 'timestamptz' },
    userId: { __type: 'uuid' },
  },
  authUserProviders_min_order_by: {
    accessToken: { __type: 'order_by' },
    createdAt: { __type: 'order_by' },
    id: { __type: 'order_by' },
    providerId: { __type: 'order_by' },
    providerUserId: { __type: 'order_by' },
    refreshToken: { __type: 'order_by' },
    updatedAt: { __type: 'order_by' },
    userId: { __type: 'order_by' },
  },
  authUserProviders_mutation_response: {
    __typename: { __type: 'String!' },
    affected_rows: { __type: 'Int!' },
    returning: { __type: '[authUserProviders!]!' },
  },
  authUserProviders_on_conflict: {
    constraint: { __type: 'authUserProviders_constraint!' },
    update_columns: { __type: '[authUserProviders_update_column!]!' },
    where: { __type: 'authUserProviders_bool_exp' },
  },
  authUserProviders_order_by: {
    accessToken: { __type: 'order_by' },
    createdAt: { __type: 'order_by' },
    id: { __type: 'order_by' },
    provider: { __type: 'authProviders_order_by' },
    providerId: { __type: 'order_by' },
    providerUserId: { __type: 'order_by' },
    refreshToken: { __type: 'order_by' },
    updatedAt: { __type: 'order_by' },
    user: { __type: 'users_order_by' },
    userId: { __type: 'order_by' },
  },
  authUserProviders_pk_columns_input: { id: { __type: 'uuid!' } },
  authUserProviders_set_input: {
    accessToken: { __type: 'String' },
    createdAt: { __type: 'timestamptz' },
    id: { __type: 'uuid' },
    providerId: { __type: 'String' },
    providerUserId: { __type: 'String' },
    refreshToken: { __type: 'String' },
    updatedAt: { __type: 'timestamptz' },
    userId: { __type: 'uuid' },
  },
  authUserProviders_stream_cursor_input: {
    initial_value: { __type: 'authUserProviders_stream_cursor_value_input!' },
    ordering: { __type: 'cursor_ordering' },
  },
  authUserProviders_stream_cursor_value_input: {
    accessToken: { __type: 'String' },
    createdAt: { __type: 'timestamptz' },
    id: { __type: 'uuid' },
    providerId: { __type: 'String' },
    providerUserId: { __type: 'String' },
    refreshToken: { __type: 'String' },
    updatedAt: { __type: 'timestamptz' },
    userId: { __type: 'uuid' },
  },
  authUserProviders_updates: {
    _set: { __type: 'authUserProviders_set_input' },
    where: { __type: 'authUserProviders_bool_exp!' },
  },
  authUserRoles: {
    __typename: { __type: 'String!' },
    createdAt: { __type: 'timestamptz!' },
    id: { __type: 'uuid!' },
    role: { __type: 'String!' },
    roleByRole: { __type: 'authRoles!' },
    user: { __type: 'users!' },
    userId: { __type: 'uuid!' },
  },
  authUserRoles_aggregate: {
    __typename: { __type: 'String!' },
    aggregate: { __type: 'authUserRoles_aggregate_fields' },
    nodes: { __type: '[authUserRoles!]!' },
  },
  authUserRoles_aggregate_bool_exp: {
    count: { __type: 'authUserRoles_aggregate_bool_exp_count' },
  },
  authUserRoles_aggregate_bool_exp_count: {
    arguments: { __type: '[authUserRoles_select_column!]' },
    distinct: { __type: 'Boolean' },
    filter: { __type: 'authUserRoles_bool_exp' },
    predicate: { __type: 'Int_comparison_exp!' },
  },
  authUserRoles_aggregate_fields: {
    __typename: { __type: 'String!' },
    count: {
      __type: 'Int!',
      __args: {
        columns: '[authUserRoles_select_column!]',
        distinct: 'Boolean',
      },
    },
    max: { __type: 'authUserRoles_max_fields' },
    min: { __type: 'authUserRoles_min_fields' },
  },
  authUserRoles_aggregate_order_by: {
    count: { __type: 'order_by' },
    max: { __type: 'authUserRoles_max_order_by' },
    min: { __type: 'authUserRoles_min_order_by' },
  },
  authUserRoles_arr_rel_insert_input: {
    data: { __type: '[authUserRoles_insert_input!]!' },
    on_conflict: { __type: 'authUserRoles_on_conflict' },
  },
  authUserRoles_bool_exp: {
    _and: { __type: '[authUserRoles_bool_exp!]' },
    _not: { __type: 'authUserRoles_bool_exp' },
    _or: { __type: '[authUserRoles_bool_exp!]' },
    createdAt: { __type: 'timestamptz_comparison_exp' },
    id: { __type: 'uuid_comparison_exp' },
    role: { __type: 'String_comparison_exp' },
    roleByRole: { __type: 'authRoles_bool_exp' },
    user: { __type: 'users_bool_exp' },
    userId: { __type: 'uuid_comparison_exp' },
  },
  authUserRoles_insert_input: {
    createdAt: { __type: 'timestamptz' },
    id: { __type: 'uuid' },
    role: { __type: 'String' },
    roleByRole: { __type: 'authRoles_obj_rel_insert_input' },
    user: { __type: 'users_obj_rel_insert_input' },
    userId: { __type: 'uuid' },
  },
  authUserRoles_max_fields: {
    __typename: { __type: 'String!' },
    createdAt: { __type: 'timestamptz' },
    id: { __type: 'uuid' },
    role: { __type: 'String' },
    userId: { __type: 'uuid' },
  },
  authUserRoles_max_order_by: {
    createdAt: { __type: 'order_by' },
    id: { __type: 'order_by' },
    role: { __type: 'order_by' },
    userId: { __type: 'order_by' },
  },
  authUserRoles_min_fields: {
    __typename: { __type: 'String!' },
    createdAt: { __type: 'timestamptz' },
    id: { __type: 'uuid' },
    role: { __type: 'String' },
    userId: { __type: 'uuid' },
  },
  authUserRoles_min_order_by: {
    createdAt: { __type: 'order_by' },
    id: { __type: 'order_by' },
    role: { __type: 'order_by' },
    userId: { __type: 'order_by' },
  },
  authUserRoles_mutation_response: {
    __typename: { __type: 'String!' },
    affected_rows: { __type: 'Int!' },
    returning: { __type: '[authUserRoles!]!' },
  },
  authUserRoles_on_conflict: {
    constraint: { __type: 'authUserRoles_constraint!' },
    update_columns: { __type: '[authUserRoles_update_column!]!' },
    where: { __type: 'authUserRoles_bool_exp' },
  },
  authUserRoles_order_by: {
    createdAt: { __type: 'order_by' },
    id: { __type: 'order_by' },
    role: { __type: 'order_by' },
    roleByRole: { __type: 'authRoles_order_by' },
    user: { __type: 'users_order_by' },
    userId: { __type: 'order_by' },
  },
  authUserRoles_pk_columns_input: { id: { __type: 'uuid!' } },
  authUserRoles_set_input: {
    createdAt: { __type: 'timestamptz' },
    id: { __type: 'uuid' },
    role: { __type: 'String' },
    userId: { __type: 'uuid' },
  },
  authUserRoles_stream_cursor_input: {
    initial_value: { __type: 'authUserRoles_stream_cursor_value_input!' },
    ordering: { __type: 'cursor_ordering' },
  },
  authUserRoles_stream_cursor_value_input: {
    createdAt: { __type: 'timestamptz' },
    id: { __type: 'uuid' },
    role: { __type: 'String' },
    userId: { __type: 'uuid' },
  },
  authUserRoles_updates: {
    _set: { __type: 'authUserRoles_set_input' },
    where: { __type: 'authUserRoles_bool_exp!' },
  },
  authUserSecurityKeys: {
    __typename: { __type: 'String!' },
    counter: { __type: 'bigint!' },
    credentialId: { __type: 'String!' },
    credentialPublicKey: { __type: 'bytea' },
    id: { __type: 'uuid!' },
    nickname: { __type: 'String' },
    transports: { __type: 'String!' },
    user: { __type: 'users!' },
    userId: { __type: 'uuid!' },
  },
  authUserSecurityKeys_aggregate: {
    __typename: { __type: 'String!' },
    aggregate: { __type: 'authUserSecurityKeys_aggregate_fields' },
    nodes: { __type: '[authUserSecurityKeys!]!' },
  },
  authUserSecurityKeys_aggregate_bool_exp: {
    count: { __type: 'authUserSecurityKeys_aggregate_bool_exp_count' },
  },
  authUserSecurityKeys_aggregate_bool_exp_count: {
    arguments: { __type: '[authUserSecurityKeys_select_column!]' },
    distinct: { __type: 'Boolean' },
    filter: { __type: 'authUserSecurityKeys_bool_exp' },
    predicate: { __type: 'Int_comparison_exp!' },
  },
  authUserSecurityKeys_aggregate_fields: {
    __typename: { __type: 'String!' },
    avg: { __type: 'authUserSecurityKeys_avg_fields' },
    count: {
      __type: 'Int!',
      __args: {
        columns: '[authUserSecurityKeys_select_column!]',
        distinct: 'Boolean',
      },
    },
    max: { __type: 'authUserSecurityKeys_max_fields' },
    min: { __type: 'authUserSecurityKeys_min_fields' },
    stddev: { __type: 'authUserSecurityKeys_stddev_fields' },
    stddev_pop: { __type: 'authUserSecurityKeys_stddev_pop_fields' },
    stddev_samp: { __type: 'authUserSecurityKeys_stddev_samp_fields' },
    sum: { __type: 'authUserSecurityKeys_sum_fields' },
    var_pop: { __type: 'authUserSecurityKeys_var_pop_fields' },
    var_samp: { __type: 'authUserSecurityKeys_var_samp_fields' },
    variance: { __type: 'authUserSecurityKeys_variance_fields' },
  },
  authUserSecurityKeys_aggregate_order_by: {
    avg: { __type: 'authUserSecurityKeys_avg_order_by' },
    count: { __type: 'order_by' },
    max: { __type: 'authUserSecurityKeys_max_order_by' },
    min: { __type: 'authUserSecurityKeys_min_order_by' },
    stddev: { __type: 'authUserSecurityKeys_stddev_order_by' },
    stddev_pop: { __type: 'authUserSecurityKeys_stddev_pop_order_by' },
    stddev_samp: { __type: 'authUserSecurityKeys_stddev_samp_order_by' },
    sum: { __type: 'authUserSecurityKeys_sum_order_by' },
    var_pop: { __type: 'authUserSecurityKeys_var_pop_order_by' },
    var_samp: { __type: 'authUserSecurityKeys_var_samp_order_by' },
    variance: { __type: 'authUserSecurityKeys_variance_order_by' },
  },
  authUserSecurityKeys_arr_rel_insert_input: {
    data: { __type: '[authUserSecurityKeys_insert_input!]!' },
    on_conflict: { __type: 'authUserSecurityKeys_on_conflict' },
  },
  authUserSecurityKeys_avg_fields: {
    __typename: { __type: 'String!' },
    counter: { __type: 'Float' },
  },
  authUserSecurityKeys_avg_order_by: { counter: { __type: 'order_by' } },
  authUserSecurityKeys_bool_exp: {
    _and: { __type: '[authUserSecurityKeys_bool_exp!]' },
    _not: { __type: 'authUserSecurityKeys_bool_exp' },
    _or: { __type: '[authUserSecurityKeys_bool_exp!]' },
    counter: { __type: 'bigint_comparison_exp' },
    credentialId: { __type: 'String_comparison_exp' },
    credentialPublicKey: { __type: 'bytea_comparison_exp' },
    id: { __type: 'uuid_comparison_exp' },
    nickname: { __type: 'String_comparison_exp' },
    transports: { __type: 'String_comparison_exp' },
    user: { __type: 'users_bool_exp' },
    userId: { __type: 'uuid_comparison_exp' },
  },
  authUserSecurityKeys_inc_input: { counter: { __type: 'bigint' } },
  authUserSecurityKeys_insert_input: {
    counter: { __type: 'bigint' },
    credentialId: { __type: 'String' },
    credentialPublicKey: { __type: 'bytea' },
    id: { __type: 'uuid' },
    nickname: { __type: 'String' },
    transports: { __type: 'String' },
    user: { __type: 'users_obj_rel_insert_input' },
    userId: { __type: 'uuid' },
  },
  authUserSecurityKeys_max_fields: {
    __typename: { __type: 'String!' },
    counter: { __type: 'bigint' },
    credentialId: { __type: 'String' },
    id: { __type: 'uuid' },
    nickname: { __type: 'String' },
    transports: { __type: 'String' },
    userId: { __type: 'uuid' },
  },
  authUserSecurityKeys_max_order_by: {
    counter: { __type: 'order_by' },
    credentialId: { __type: 'order_by' },
    id: { __type: 'order_by' },
    nickname: { __type: 'order_by' },
    transports: { __type: 'order_by' },
    userId: { __type: 'order_by' },
  },
  authUserSecurityKeys_min_fields: {
    __typename: { __type: 'String!' },
    counter: { __type: 'bigint' },
    credentialId: { __type: 'String' },
    id: { __type: 'uuid' },
    nickname: { __type: 'String' },
    transports: { __type: 'String' },
    userId: { __type: 'uuid' },
  },
  authUserSecurityKeys_min_order_by: {
    counter: { __type: 'order_by' },
    credentialId: { __type: 'order_by' },
    id: { __type: 'order_by' },
    nickname: { __type: 'order_by' },
    transports: { __type: 'order_by' },
    userId: { __type: 'order_by' },
  },
  authUserSecurityKeys_mutation_response: {
    __typename: { __type: 'String!' },
    affected_rows: { __type: 'Int!' },
    returning: { __type: '[authUserSecurityKeys!]!' },
  },
  authUserSecurityKeys_on_conflict: {
    constraint: { __type: 'authUserSecurityKeys_constraint!' },
    update_columns: { __type: '[authUserSecurityKeys_update_column!]!' },
    where: { __type: 'authUserSecurityKeys_bool_exp' },
  },
  authUserSecurityKeys_order_by: {
    counter: { __type: 'order_by' },
    credentialId: { __type: 'order_by' },
    credentialPublicKey: { __type: 'order_by' },
    id: { __type: 'order_by' },
    nickname: { __type: 'order_by' },
    transports: { __type: 'order_by' },
    user: { __type: 'users_order_by' },
    userId: { __type: 'order_by' },
  },
  authUserSecurityKeys_pk_columns_input: { id: { __type: 'uuid!' } },
  authUserSecurityKeys_set_input: {
    counter: { __type: 'bigint' },
    credentialId: { __type: 'String' },
    credentialPublicKey: { __type: 'bytea' },
    id: { __type: 'uuid' },
    nickname: { __type: 'String' },
    transports: { __type: 'String' },
    userId: { __type: 'uuid' },
  },
  authUserSecurityKeys_stddev_fields: {
    __typename: { __type: 'String!' },
    counter: { __type: 'Float' },
  },
  authUserSecurityKeys_stddev_order_by: { counter: { __type: 'order_by' } },
  authUserSecurityKeys_stddev_pop_fields: {
    __typename: { __type: 'String!' },
    counter: { __type: 'Float' },
  },
  authUserSecurityKeys_stddev_pop_order_by: { counter: { __type: 'order_by' } },
  authUserSecurityKeys_stddev_samp_fields: {
    __typename: { __type: 'String!' },
    counter: { __type: 'Float' },
  },
  authUserSecurityKeys_stddev_samp_order_by: {
    counter: { __type: 'order_by' },
  },
  authUserSecurityKeys_stream_cursor_input: {
    initial_value: {
      __type: 'authUserSecurityKeys_stream_cursor_value_input!',
    },
    ordering: { __type: 'cursor_ordering' },
  },
  authUserSecurityKeys_stream_cursor_value_input: {
    counter: { __type: 'bigint' },
    credentialId: { __type: 'String' },
    credentialPublicKey: { __type: 'bytea' },
    id: { __type: 'uuid' },
    nickname: { __type: 'String' },
    transports: { __type: 'String' },
    userId: { __type: 'uuid' },
  },
  authUserSecurityKeys_sum_fields: {
    __typename: { __type: 'String!' },
    counter: { __type: 'bigint' },
  },
  authUserSecurityKeys_sum_order_by: { counter: { __type: 'order_by' } },
  authUserSecurityKeys_updates: {
    _inc: { __type: 'authUserSecurityKeys_inc_input' },
    _set: { __type: 'authUserSecurityKeys_set_input' },
    where: { __type: 'authUserSecurityKeys_bool_exp!' },
  },
  authUserSecurityKeys_var_pop_fields: {
    __typename: { __type: 'String!' },
    counter: { __type: 'Float' },
  },
  authUserSecurityKeys_var_pop_order_by: { counter: { __type: 'order_by' } },
  authUserSecurityKeys_var_samp_fields: {
    __typename: { __type: 'String!' },
    counter: { __type: 'Float' },
  },
  authUserSecurityKeys_var_samp_order_by: { counter: { __type: 'order_by' } },
  authUserSecurityKeys_variance_fields: {
    __typename: { __type: 'String!' },
    counter: { __type: 'Float' },
  },
  authUserSecurityKeys_variance_order_by: { counter: { __type: 'order_by' } },
  bigint_comparison_exp: {
    _eq: { __type: 'bigint' },
    _gt: { __type: 'bigint' },
    _gte: { __type: 'bigint' },
    _in: { __type: '[bigint!]' },
    _is_null: { __type: 'Boolean' },
    _lt: { __type: 'bigint' },
    _lte: { __type: 'bigint' },
    _neq: { __type: 'bigint' },
    _nin: { __type: '[bigint!]' },
  },
  buckets: {
    __typename: { __type: 'String!' },
    cacheControl: { __type: 'String' },
    createdAt: { __type: 'timestamptz!' },
    downloadExpiration: { __type: 'Int!' },
    files: {
      __type: '[files!]!',
      __args: {
        distinct_on: '[files_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[files_order_by!]',
        where: 'files_bool_exp',
      },
    },
    files_aggregate: {
      __type: 'files_aggregate!',
      __args: {
        distinct_on: '[files_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[files_order_by!]',
        where: 'files_bool_exp',
      },
    },
    id: { __type: 'String!' },
    maxUploadFileSize: { __type: 'Int!' },
    minUploadFileSize: { __type: 'Int!' },
    presignedUrlsEnabled: { __type: 'Boolean!' },
    updatedAt: { __type: 'timestamptz!' },
  },
  buckets_aggregate: {
    __typename: { __type: 'String!' },
    aggregate: { __type: 'buckets_aggregate_fields' },
    nodes: { __type: '[buckets!]!' },
  },
  buckets_aggregate_fields: {
    __typename: { __type: 'String!' },
    avg: { __type: 'buckets_avg_fields' },
    count: {
      __type: 'Int!',
      __args: { columns: '[buckets_select_column!]', distinct: 'Boolean' },
    },
    max: { __type: 'buckets_max_fields' },
    min: { __type: 'buckets_min_fields' },
    stddev: { __type: 'buckets_stddev_fields' },
    stddev_pop: { __type: 'buckets_stddev_pop_fields' },
    stddev_samp: { __type: 'buckets_stddev_samp_fields' },
    sum: { __type: 'buckets_sum_fields' },
    var_pop: { __type: 'buckets_var_pop_fields' },
    var_samp: { __type: 'buckets_var_samp_fields' },
    variance: { __type: 'buckets_variance_fields' },
  },
  buckets_avg_fields: {
    __typename: { __type: 'String!' },
    downloadExpiration: { __type: 'Float' },
    maxUploadFileSize: { __type: 'Float' },
    minUploadFileSize: { __type: 'Float' },
  },
  buckets_bool_exp: {
    _and: { __type: '[buckets_bool_exp!]' },
    _not: { __type: 'buckets_bool_exp' },
    _or: { __type: '[buckets_bool_exp!]' },
    cacheControl: { __type: 'String_comparison_exp' },
    createdAt: { __type: 'timestamptz_comparison_exp' },
    downloadExpiration: { __type: 'Int_comparison_exp' },
    files: { __type: 'files_bool_exp' },
    files_aggregate: { __type: 'files_aggregate_bool_exp' },
    id: { __type: 'String_comparison_exp' },
    maxUploadFileSize: { __type: 'Int_comparison_exp' },
    minUploadFileSize: { __type: 'Int_comparison_exp' },
    presignedUrlsEnabled: { __type: 'Boolean_comparison_exp' },
    updatedAt: { __type: 'timestamptz_comparison_exp' },
  },
  buckets_inc_input: {
    downloadExpiration: { __type: 'Int' },
    maxUploadFileSize: { __type: 'Int' },
    minUploadFileSize: { __type: 'Int' },
  },
  buckets_insert_input: {
    cacheControl: { __type: 'String' },
    createdAt: { __type: 'timestamptz' },
    downloadExpiration: { __type: 'Int' },
    files: { __type: 'files_arr_rel_insert_input' },
    id: { __type: 'String' },
    maxUploadFileSize: { __type: 'Int' },
    minUploadFileSize: { __type: 'Int' },
    presignedUrlsEnabled: { __type: 'Boolean' },
    updatedAt: { __type: 'timestamptz' },
  },
  buckets_max_fields: {
    __typename: { __type: 'String!' },
    cacheControl: { __type: 'String' },
    createdAt: { __type: 'timestamptz' },
    downloadExpiration: { __type: 'Int' },
    id: { __type: 'String' },
    maxUploadFileSize: { __type: 'Int' },
    minUploadFileSize: { __type: 'Int' },
    updatedAt: { __type: 'timestamptz' },
  },
  buckets_min_fields: {
    __typename: { __type: 'String!' },
    cacheControl: { __type: 'String' },
    createdAt: { __type: 'timestamptz' },
    downloadExpiration: { __type: 'Int' },
    id: { __type: 'String' },
    maxUploadFileSize: { __type: 'Int' },
    minUploadFileSize: { __type: 'Int' },
    updatedAt: { __type: 'timestamptz' },
  },
  buckets_mutation_response: {
    __typename: { __type: 'String!' },
    affected_rows: { __type: 'Int!' },
    returning: { __type: '[buckets!]!' },
  },
  buckets_obj_rel_insert_input: {
    data: { __type: 'buckets_insert_input!' },
    on_conflict: { __type: 'buckets_on_conflict' },
  },
  buckets_on_conflict: {
    constraint: { __type: 'buckets_constraint!' },
    update_columns: { __type: '[buckets_update_column!]!' },
    where: { __type: 'buckets_bool_exp' },
  },
  buckets_order_by: {
    cacheControl: { __type: 'order_by' },
    createdAt: { __type: 'order_by' },
    downloadExpiration: { __type: 'order_by' },
    files_aggregate: { __type: 'files_aggregate_order_by' },
    id: { __type: 'order_by' },
    maxUploadFileSize: { __type: 'order_by' },
    minUploadFileSize: { __type: 'order_by' },
    presignedUrlsEnabled: { __type: 'order_by' },
    updatedAt: { __type: 'order_by' },
  },
  buckets_pk_columns_input: { id: { __type: 'String!' } },
  buckets_set_input: {
    cacheControl: { __type: 'String' },
    createdAt: { __type: 'timestamptz' },
    downloadExpiration: { __type: 'Int' },
    id: { __type: 'String' },
    maxUploadFileSize: { __type: 'Int' },
    minUploadFileSize: { __type: 'Int' },
    presignedUrlsEnabled: { __type: 'Boolean' },
    updatedAt: { __type: 'timestamptz' },
  },
  buckets_stddev_fields: {
    __typename: { __type: 'String!' },
    downloadExpiration: { __type: 'Float' },
    maxUploadFileSize: { __type: 'Float' },
    minUploadFileSize: { __type: 'Float' },
  },
  buckets_stddev_pop_fields: {
    __typename: { __type: 'String!' },
    downloadExpiration: { __type: 'Float' },
    maxUploadFileSize: { __type: 'Float' },
    minUploadFileSize: { __type: 'Float' },
  },
  buckets_stddev_samp_fields: {
    __typename: { __type: 'String!' },
    downloadExpiration: { __type: 'Float' },
    maxUploadFileSize: { __type: 'Float' },
    minUploadFileSize: { __type: 'Float' },
  },
  buckets_stream_cursor_input: {
    initial_value: { __type: 'buckets_stream_cursor_value_input!' },
    ordering: { __type: 'cursor_ordering' },
  },
  buckets_stream_cursor_value_input: {
    cacheControl: { __type: 'String' },
    createdAt: { __type: 'timestamptz' },
    downloadExpiration: { __type: 'Int' },
    id: { __type: 'String' },
    maxUploadFileSize: { __type: 'Int' },
    minUploadFileSize: { __type: 'Int' },
    presignedUrlsEnabled: { __type: 'Boolean' },
    updatedAt: { __type: 'timestamptz' },
  },
  buckets_sum_fields: {
    __typename: { __type: 'String!' },
    downloadExpiration: { __type: 'Int' },
    maxUploadFileSize: { __type: 'Int' },
    minUploadFileSize: { __type: 'Int' },
  },
  buckets_updates: {
    _inc: { __type: 'buckets_inc_input' },
    _set: { __type: 'buckets_set_input' },
    where: { __type: 'buckets_bool_exp!' },
  },
  buckets_var_pop_fields: {
    __typename: { __type: 'String!' },
    downloadExpiration: { __type: 'Float' },
    maxUploadFileSize: { __type: 'Float' },
    minUploadFileSize: { __type: 'Float' },
  },
  buckets_var_samp_fields: {
    __typename: { __type: 'String!' },
    downloadExpiration: { __type: 'Float' },
    maxUploadFileSize: { __type: 'Float' },
    minUploadFileSize: { __type: 'Float' },
  },
  buckets_variance_fields: {
    __typename: { __type: 'String!' },
    downloadExpiration: { __type: 'Float' },
    maxUploadFileSize: { __type: 'Float' },
    minUploadFileSize: { __type: 'Float' },
  },
  bytea_comparison_exp: {
    _eq: { __type: 'bytea' },
    _gt: { __type: 'bytea' },
    _gte: { __type: 'bytea' },
    _in: { __type: '[bytea!]' },
    _is_null: { __type: 'Boolean' },
    _lt: { __type: 'bytea' },
    _lte: { __type: 'bytea' },
    _neq: { __type: 'bytea' },
    _nin: { __type: '[bytea!]' },
  },
  checkUnique_nodes_args: { mime: { __type: 'String' } },
  citext_comparison_exp: {
    _eq: { __type: 'citext' },
    _gt: { __type: 'citext' },
    _gte: { __type: 'citext' },
    _ilike: { __type: 'citext' },
    _in: { __type: '[citext!]' },
    _iregex: { __type: 'citext' },
    _is_null: { __type: 'Boolean' },
    _like: { __type: 'citext' },
    _lt: { __type: 'citext' },
    _lte: { __type: 'citext' },
    _neq: { __type: 'citext' },
    _nilike: { __type: 'citext' },
    _nin: { __type: '[citext!]' },
    _niregex: { __type: 'citext' },
    _nlike: { __type: 'citext' },
    _nregex: { __type: 'citext' },
    _nsimilar: { __type: 'citext' },
    _regex: { __type: 'citext' },
    _similar: { __type: 'citext' },
  },
  fields: {
    __typename: { __type: 'String!' },
    data: { __type: 'jsonb', __args: { path: 'String' } },
    dataId: { __type: 'uuid' },
    id: { __type: 'uuid!' },
    mime: { __type: 'String!' },
    name: { __type: 'String!' },
    parent: { __type: 'nodes' },
    parentId: { __type: 'uuid!' },
  },
  fields_aggregate: {
    __typename: { __type: 'String!' },
    aggregate: { __type: 'fields_aggregate_fields' },
    nodes: { __type: '[fields!]!' },
  },
  fields_aggregate_bool_exp: {
    count: { __type: 'fields_aggregate_bool_exp_count' },
  },
  fields_aggregate_bool_exp_count: {
    arguments: { __type: '[fields_select_column!]' },
    distinct: { __type: 'Boolean' },
    filter: { __type: 'fields_bool_exp' },
    predicate: { __type: 'Int_comparison_exp!' },
  },
  fields_aggregate_fields: {
    __typename: { __type: 'String!' },
    count: {
      __type: 'Int!',
      __args: { columns: '[fields_select_column!]', distinct: 'Boolean' },
    },
    max: { __type: 'fields_max_fields' },
    min: { __type: 'fields_min_fields' },
  },
  fields_aggregate_order_by: {
    count: { __type: 'order_by' },
    max: { __type: 'fields_max_order_by' },
    min: { __type: 'fields_min_order_by' },
  },
  fields_append_input: { data: { __type: 'jsonb' } },
  fields_arr_rel_insert_input: {
    data: { __type: '[fields_insert_input!]!' },
    on_conflict: { __type: 'fields_on_conflict' },
  },
  fields_bool_exp: {
    _and: { __type: '[fields_bool_exp!]' },
    _not: { __type: 'fields_bool_exp' },
    _or: { __type: '[fields_bool_exp!]' },
    data: { __type: 'jsonb_comparison_exp' },
    dataId: { __type: 'uuid_comparison_exp' },
    id: { __type: 'uuid_comparison_exp' },
    mime: { __type: 'String_comparison_exp' },
    name: { __type: 'String_comparison_exp' },
    parent: { __type: 'nodes_bool_exp' },
    parentId: { __type: 'uuid_comparison_exp' },
  },
  fields_delete_at_path_input: { data: { __type: '[String!]' } },
  fields_delete_elem_input: { data: { __type: 'Int' } },
  fields_delete_key_input: { data: { __type: 'String' } },
  fields_insert_input: {
    data: { __type: 'jsonb' },
    id: { __type: 'uuid' },
    mime: { __type: 'String' },
    name: { __type: 'String' },
    parent: { __type: 'nodes_obj_rel_insert_input' },
    parentId: { __type: 'uuid' },
  },
  fields_max_fields: {
    __typename: { __type: 'String!' },
    id: { __type: 'uuid' },
    mime: { __type: 'String' },
    name: { __type: 'String' },
    parentId: { __type: 'uuid' },
  },
  fields_max_order_by: {
    id: { __type: 'order_by' },
    mime: { __type: 'order_by' },
    name: { __type: 'order_by' },
    parentId: { __type: 'order_by' },
  },
  fields_min_fields: {
    __typename: { __type: 'String!' },
    id: { __type: 'uuid' },
    mime: { __type: 'String' },
    name: { __type: 'String' },
    parentId: { __type: 'uuid' },
  },
  fields_min_order_by: {
    id: { __type: 'order_by' },
    mime: { __type: 'order_by' },
    name: { __type: 'order_by' },
    parentId: { __type: 'order_by' },
  },
  fields_mutation_response: {
    __typename: { __type: 'String!' },
    affected_rows: { __type: 'Int!' },
    returning: { __type: '[fields!]!' },
  },
  fields_on_conflict: {
    constraint: { __type: 'fields_constraint!' },
    update_columns: { __type: '[fields_update_column!]!' },
    where: { __type: 'fields_bool_exp' },
  },
  fields_order_by: {
    data: { __type: 'order_by' },
    dataId: { __type: 'order_by' },
    id: { __type: 'order_by' },
    mime: { __type: 'order_by' },
    name: { __type: 'order_by' },
    parent: { __type: 'nodes_order_by' },
    parentId: { __type: 'order_by' },
  },
  fields_pk_columns_input: { id: { __type: 'uuid!' } },
  fields_prepend_input: { data: { __type: 'jsonb' } },
  fields_set_input: {
    data: { __type: 'jsonb' },
    id: { __type: 'uuid' },
    mime: { __type: 'String' },
    name: { __type: 'String' },
    parentId: { __type: 'uuid' },
  },
  fields_stream_cursor_input: {
    initial_value: { __type: 'fields_stream_cursor_value_input!' },
    ordering: { __type: 'cursor_ordering' },
  },
  fields_stream_cursor_value_input: {
    data: { __type: 'jsonb' },
    id: { __type: 'uuid' },
    mime: { __type: 'String' },
    name: { __type: 'String' },
    parentId: { __type: 'uuid' },
  },
  fields_updates: {
    _append: { __type: 'fields_append_input' },
    _delete_at_path: { __type: 'fields_delete_at_path_input' },
    _delete_elem: { __type: 'fields_delete_elem_input' },
    _delete_key: { __type: 'fields_delete_key_input' },
    _prepend: { __type: 'fields_prepend_input' },
    _set: { __type: 'fields_set_input' },
    where: { __type: 'fields_bool_exp!' },
  },
  files: {
    __typename: { __type: 'String!' },
    bucket: { __type: 'buckets!' },
    bucketId: { __type: 'String!' },
    createdAt: { __type: 'timestamptz!' },
    etag: { __type: 'String' },
    id: { __type: 'uuid!' },
    isUploaded: { __type: 'Boolean' },
    mimeType: { __type: 'String' },
    name: { __type: 'String' },
    size: { __type: 'Int' },
    updatedAt: { __type: 'timestamptz!' },
    uploadedByUserId: { __type: 'uuid' },
  },
  files_aggregate: {
    __typename: { __type: 'String!' },
    aggregate: { __type: 'files_aggregate_fields' },
    nodes: { __type: '[files!]!' },
  },
  files_aggregate_bool_exp: {
    bool_and: { __type: 'files_aggregate_bool_exp_bool_and' },
    bool_or: { __type: 'files_aggregate_bool_exp_bool_or' },
    count: { __type: 'files_aggregate_bool_exp_count' },
  },
  files_aggregate_bool_exp_bool_and: {
    arguments: {
      __type:
        'files_select_column_files_aggregate_bool_exp_bool_and_arguments_columns!',
    },
    distinct: { __type: 'Boolean' },
    filter: { __type: 'files_bool_exp' },
    predicate: { __type: 'Boolean_comparison_exp!' },
  },
  files_aggregate_bool_exp_bool_or: {
    arguments: {
      __type:
        'files_select_column_files_aggregate_bool_exp_bool_or_arguments_columns!',
    },
    distinct: { __type: 'Boolean' },
    filter: { __type: 'files_bool_exp' },
    predicate: { __type: 'Boolean_comparison_exp!' },
  },
  files_aggregate_bool_exp_count: {
    arguments: { __type: '[files_select_column!]' },
    distinct: { __type: 'Boolean' },
    filter: { __type: 'files_bool_exp' },
    predicate: { __type: 'Int_comparison_exp!' },
  },
  files_aggregate_fields: {
    __typename: { __type: 'String!' },
    avg: { __type: 'files_avg_fields' },
    count: {
      __type: 'Int!',
      __args: { columns: '[files_select_column!]', distinct: 'Boolean' },
    },
    max: { __type: 'files_max_fields' },
    min: { __type: 'files_min_fields' },
    stddev: { __type: 'files_stddev_fields' },
    stddev_pop: { __type: 'files_stddev_pop_fields' },
    stddev_samp: { __type: 'files_stddev_samp_fields' },
    sum: { __type: 'files_sum_fields' },
    var_pop: { __type: 'files_var_pop_fields' },
    var_samp: { __type: 'files_var_samp_fields' },
    variance: { __type: 'files_variance_fields' },
  },
  files_aggregate_order_by: {
    avg: { __type: 'files_avg_order_by' },
    count: { __type: 'order_by' },
    max: { __type: 'files_max_order_by' },
    min: { __type: 'files_min_order_by' },
    stddev: { __type: 'files_stddev_order_by' },
    stddev_pop: { __type: 'files_stddev_pop_order_by' },
    stddev_samp: { __type: 'files_stddev_samp_order_by' },
    sum: { __type: 'files_sum_order_by' },
    var_pop: { __type: 'files_var_pop_order_by' },
    var_samp: { __type: 'files_var_samp_order_by' },
    variance: { __type: 'files_variance_order_by' },
  },
  files_arr_rel_insert_input: {
    data: { __type: '[files_insert_input!]!' },
    on_conflict: { __type: 'files_on_conflict' },
  },
  files_avg_fields: {
    __typename: { __type: 'String!' },
    size: { __type: 'Float' },
  },
  files_avg_order_by: { size: { __type: 'order_by' } },
  files_bool_exp: {
    _and: { __type: '[files_bool_exp!]' },
    _not: { __type: 'files_bool_exp' },
    _or: { __type: '[files_bool_exp!]' },
    bucket: { __type: 'buckets_bool_exp' },
    bucketId: { __type: 'String_comparison_exp' },
    createdAt: { __type: 'timestamptz_comparison_exp' },
    etag: { __type: 'String_comparison_exp' },
    id: { __type: 'uuid_comparison_exp' },
    isUploaded: { __type: 'Boolean_comparison_exp' },
    mimeType: { __type: 'String_comparison_exp' },
    name: { __type: 'String_comparison_exp' },
    size: { __type: 'Int_comparison_exp' },
    updatedAt: { __type: 'timestamptz_comparison_exp' },
    uploadedByUserId: { __type: 'uuid_comparison_exp' },
  },
  files_inc_input: { size: { __type: 'Int' } },
  files_insert_input: {
    bucket: { __type: 'buckets_obj_rel_insert_input' },
    bucketId: { __type: 'String' },
    createdAt: { __type: 'timestamptz' },
    etag: { __type: 'String' },
    id: { __type: 'uuid' },
    isUploaded: { __type: 'Boolean' },
    mimeType: { __type: 'String' },
    name: { __type: 'String' },
    size: { __type: 'Int' },
    updatedAt: { __type: 'timestamptz' },
    uploadedByUserId: { __type: 'uuid' },
  },
  files_max_fields: {
    __typename: { __type: 'String!' },
    bucketId: { __type: 'String' },
    createdAt: { __type: 'timestamptz' },
    etag: { __type: 'String' },
    id: { __type: 'uuid' },
    mimeType: { __type: 'String' },
    name: { __type: 'String' },
    size: { __type: 'Int' },
    updatedAt: { __type: 'timestamptz' },
    uploadedByUserId: { __type: 'uuid' },
  },
  files_max_order_by: {
    bucketId: { __type: 'order_by' },
    createdAt: { __type: 'order_by' },
    etag: { __type: 'order_by' },
    id: { __type: 'order_by' },
    mimeType: { __type: 'order_by' },
    name: { __type: 'order_by' },
    size: { __type: 'order_by' },
    updatedAt: { __type: 'order_by' },
    uploadedByUserId: { __type: 'order_by' },
  },
  files_min_fields: {
    __typename: { __type: 'String!' },
    bucketId: { __type: 'String' },
    createdAt: { __type: 'timestamptz' },
    etag: { __type: 'String' },
    id: { __type: 'uuid' },
    mimeType: { __type: 'String' },
    name: { __type: 'String' },
    size: { __type: 'Int' },
    updatedAt: { __type: 'timestamptz' },
    uploadedByUserId: { __type: 'uuid' },
  },
  files_min_order_by: {
    bucketId: { __type: 'order_by' },
    createdAt: { __type: 'order_by' },
    etag: { __type: 'order_by' },
    id: { __type: 'order_by' },
    mimeType: { __type: 'order_by' },
    name: { __type: 'order_by' },
    size: { __type: 'order_by' },
    updatedAt: { __type: 'order_by' },
    uploadedByUserId: { __type: 'order_by' },
  },
  files_mutation_response: {
    __typename: { __type: 'String!' },
    affected_rows: { __type: 'Int!' },
    returning: { __type: '[files!]!' },
  },
  files_on_conflict: {
    constraint: { __type: 'files_constraint!' },
    update_columns: { __type: '[files_update_column!]!' },
    where: { __type: 'files_bool_exp' },
  },
  files_order_by: {
    bucket: { __type: 'buckets_order_by' },
    bucketId: { __type: 'order_by' },
    createdAt: { __type: 'order_by' },
    etag: { __type: 'order_by' },
    id: { __type: 'order_by' },
    isUploaded: { __type: 'order_by' },
    mimeType: { __type: 'order_by' },
    name: { __type: 'order_by' },
    size: { __type: 'order_by' },
    updatedAt: { __type: 'order_by' },
    uploadedByUserId: { __type: 'order_by' },
  },
  files_pk_columns_input: { id: { __type: 'uuid!' } },
  files_set_input: {
    bucketId: { __type: 'String' },
    createdAt: { __type: 'timestamptz' },
    etag: { __type: 'String' },
    id: { __type: 'uuid' },
    isUploaded: { __type: 'Boolean' },
    mimeType: { __type: 'String' },
    name: { __type: 'String' },
    size: { __type: 'Int' },
    updatedAt: { __type: 'timestamptz' },
    uploadedByUserId: { __type: 'uuid' },
  },
  files_stddev_fields: {
    __typename: { __type: 'String!' },
    size: { __type: 'Float' },
  },
  files_stddev_order_by: { size: { __type: 'order_by' } },
  files_stddev_pop_fields: {
    __typename: { __type: 'String!' },
    size: { __type: 'Float' },
  },
  files_stddev_pop_order_by: { size: { __type: 'order_by' } },
  files_stddev_samp_fields: {
    __typename: { __type: 'String!' },
    size: { __type: 'Float' },
  },
  files_stddev_samp_order_by: { size: { __type: 'order_by' } },
  files_stream_cursor_input: {
    initial_value: { __type: 'files_stream_cursor_value_input!' },
    ordering: { __type: 'cursor_ordering' },
  },
  files_stream_cursor_value_input: {
    bucketId: { __type: 'String' },
    createdAt: { __type: 'timestamptz' },
    etag: { __type: 'String' },
    id: { __type: 'uuid' },
    isUploaded: { __type: 'Boolean' },
    mimeType: { __type: 'String' },
    name: { __type: 'String' },
    size: { __type: 'Int' },
    updatedAt: { __type: 'timestamptz' },
    uploadedByUserId: { __type: 'uuid' },
  },
  files_sum_fields: {
    __typename: { __type: 'String!' },
    size: { __type: 'Int' },
  },
  files_sum_order_by: { size: { __type: 'order_by' } },
  files_updates: {
    _inc: { __type: 'files_inc_input' },
    _set: { __type: 'files_set_input' },
    where: { __type: 'files_bool_exp!' },
  },
  files_var_pop_fields: {
    __typename: { __type: 'String!' },
    size: { __type: 'Float' },
  },
  files_var_pop_order_by: { size: { __type: 'order_by' } },
  files_var_samp_fields: {
    __typename: { __type: 'String!' },
    size: { __type: 'Float' },
  },
  files_var_samp_order_by: { size: { __type: 'order_by' } },
  files_variance_fields: {
    __typename: { __type: 'String!' },
    size: { __type: 'Float' },
  },
  files_variance_order_by: { size: { __type: 'order_by' } },
  jsonb_cast_exp: { String: { __type: 'String_comparison_exp' } },
  jsonb_comparison_exp: {
    _cast: { __type: 'jsonb_cast_exp' },
    _contained_in: { __type: 'jsonb' },
    _contains: { __type: 'jsonb' },
    _eq: { __type: 'jsonb' },
    _gt: { __type: 'jsonb' },
    _gte: { __type: 'jsonb' },
    _has_key: { __type: 'String' },
    _has_keys_all: { __type: '[String!]' },
    _has_keys_any: { __type: '[String!]' },
    _in: { __type: '[jsonb!]' },
    _is_null: { __type: 'Boolean' },
    _lt: { __type: 'jsonb' },
    _lte: { __type: 'jsonb' },
    _neq: { __type: 'jsonb' },
    _nin: { __type: '[jsonb!]' },
  },
  members: {
    __typename: { __type: 'String!' },
    accepted: { __type: 'Boolean!' },
    active: { __type: 'Boolean!' },
    email: { __type: 'String' },
    emailUser: { __type: 'users' },
    hidden: { __type: 'Boolean!' },
    id: { __type: 'uuid!' },
    name: { __type: 'String' },
    node: { __type: 'nodes' },
    nodeId: { __type: 'uuid' },
    owner: { __type: 'Boolean!' },
    parent: { __type: 'nodes' },
    parentId: { __type: 'uuid!' },
    user: { __type: 'users' },
  },
  members_aggregate: {
    __typename: { __type: 'String!' },
    aggregate: { __type: 'members_aggregate_fields' },
    nodes: { __type: '[members!]!' },
  },
  members_aggregate_bool_exp: {
    bool_and: { __type: 'members_aggregate_bool_exp_bool_and' },
    bool_or: { __type: 'members_aggregate_bool_exp_bool_or' },
    count: { __type: 'members_aggregate_bool_exp_count' },
  },
  members_aggregate_bool_exp_bool_and: {
    arguments: {
      __type:
        'members_select_column_members_aggregate_bool_exp_bool_and_arguments_columns!',
    },
    distinct: { __type: 'Boolean' },
    filter: { __type: 'members_bool_exp' },
    predicate: { __type: 'Boolean_comparison_exp!' },
  },
  members_aggregate_bool_exp_bool_or: {
    arguments: {
      __type:
        'members_select_column_members_aggregate_bool_exp_bool_or_arguments_columns!',
    },
    distinct: { __type: 'Boolean' },
    filter: { __type: 'members_bool_exp' },
    predicate: { __type: 'Boolean_comparison_exp!' },
  },
  members_aggregate_bool_exp_count: {
    arguments: { __type: '[members_select_column!]' },
    distinct: { __type: 'Boolean' },
    filter: { __type: 'members_bool_exp' },
    predicate: { __type: 'Int_comparison_exp!' },
  },
  members_aggregate_fields: {
    __typename: { __type: 'String!' },
    count: {
      __type: 'Int!',
      __args: { columns: '[members_select_column!]', distinct: 'Boolean' },
    },
    max: { __type: 'members_max_fields' },
    min: { __type: 'members_min_fields' },
  },
  members_aggregate_order_by: {
    count: { __type: 'order_by' },
    max: { __type: 'members_max_order_by' },
    min: { __type: 'members_min_order_by' },
  },
  members_arr_rel_insert_input: {
    data: { __type: '[members_insert_input!]!' },
    on_conflict: { __type: 'members_on_conflict' },
  },
  members_bool_exp: {
    _and: { __type: '[members_bool_exp!]' },
    _not: { __type: 'members_bool_exp' },
    _or: { __type: '[members_bool_exp!]' },
    accepted: { __type: 'Boolean_comparison_exp' },
    active: { __type: 'Boolean_comparison_exp' },
    email: { __type: 'String_comparison_exp' },
    emailUser: { __type: 'users_bool_exp' },
    hidden: { __type: 'Boolean_comparison_exp' },
    id: { __type: 'uuid_comparison_exp' },
    name: { __type: 'String_comparison_exp' },
    node: { __type: 'nodes_bool_exp' },
    nodeId: { __type: 'uuid_comparison_exp' },
    owner: { __type: 'Boolean_comparison_exp' },
    parent: { __type: 'nodes_bool_exp' },
    parentId: { __type: 'uuid_comparison_exp' },
    user: { __type: 'users_bool_exp' },
  },
  members_insert_input: {
    accepted: { __type: 'Boolean' },
    active: { __type: 'Boolean' },
    email: { __type: 'String' },
    emailUser: { __type: 'users_obj_rel_insert_input' },
    hidden: { __type: 'Boolean' },
    id: { __type: 'uuid' },
    name: { __type: 'String' },
    node: { __type: 'nodes_obj_rel_insert_input' },
    nodeId: { __type: 'uuid' },
    owner: { __type: 'Boolean' },
    parent: { __type: 'nodes_obj_rel_insert_input' },
    parentId: { __type: 'uuid' },
    user: { __type: 'users_obj_rel_insert_input' },
  },
  members_max_fields: {
    __typename: { __type: 'String!' },
    email: { __type: 'String' },
    id: { __type: 'uuid' },
    name: { __type: 'String' },
    nodeId: { __type: 'uuid' },
    parentId: { __type: 'uuid' },
  },
  members_max_order_by: {
    email: { __type: 'order_by' },
    id: { __type: 'order_by' },
    name: { __type: 'order_by' },
    nodeId: { __type: 'order_by' },
    parentId: { __type: 'order_by' },
  },
  members_min_fields: {
    __typename: { __type: 'String!' },
    email: { __type: 'String' },
    id: { __type: 'uuid' },
    name: { __type: 'String' },
    nodeId: { __type: 'uuid' },
    parentId: { __type: 'uuid' },
  },
  members_min_order_by: {
    email: { __type: 'order_by' },
    id: { __type: 'order_by' },
    name: { __type: 'order_by' },
    nodeId: { __type: 'order_by' },
    parentId: { __type: 'order_by' },
  },
  members_mutation_response: {
    __typename: { __type: 'String!' },
    affected_rows: { __type: 'Int!' },
    returning: { __type: '[members!]!' },
  },
  members_on_conflict: {
    constraint: { __type: 'members_constraint!' },
    update_columns: { __type: '[members_update_column!]!' },
    where: { __type: 'members_bool_exp' },
  },
  members_order_by: {
    accepted: { __type: 'order_by' },
    active: { __type: 'order_by' },
    email: { __type: 'order_by' },
    emailUser: { __type: 'users_order_by' },
    hidden: { __type: 'order_by' },
    id: { __type: 'order_by' },
    name: { __type: 'order_by' },
    node: { __type: 'nodes_order_by' },
    nodeId: { __type: 'order_by' },
    owner: { __type: 'order_by' },
    parent: { __type: 'nodes_order_by' },
    parentId: { __type: 'order_by' },
    user: { __type: 'users_order_by' },
  },
  members_pk_columns_input: { id: { __type: 'uuid!' } },
  members_set_input: {
    accepted: { __type: 'Boolean' },
    active: { __type: 'Boolean' },
    email: { __type: 'String' },
    hidden: { __type: 'Boolean' },
    id: { __type: 'uuid' },
    name: { __type: 'String' },
    nodeId: { __type: 'uuid' },
    owner: { __type: 'Boolean' },
    parentId: { __type: 'uuid' },
  },
  members_stream_cursor_input: {
    initial_value: { __type: 'members_stream_cursor_value_input!' },
    ordering: { __type: 'cursor_ordering' },
  },
  members_stream_cursor_value_input: {
    accepted: { __type: 'Boolean' },
    active: { __type: 'Boolean' },
    email: { __type: 'String' },
    hidden: { __type: 'Boolean' },
    id: { __type: 'uuid' },
    name: { __type: 'String' },
    nodeId: { __type: 'uuid' },
    owner: { __type: 'Boolean' },
    parentId: { __type: 'uuid' },
  },
  members_updates: {
    _set: { __type: 'members_set_input' },
    where: { __type: 'members_bool_exp!' },
  },
  mimes: {
    __typename: { __type: 'String!' },
    children: {
      __type: '[mimes!]',
      __args: {
        distinct_on: '[mimes_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[mimes_order_by!]',
        where: 'mimes_bool_exp',
      },
    },
    context: { __type: 'Boolean!' },
    hidden: { __type: 'Boolean!' },
    icon: { __type: 'String!' },
    id: { __type: 'String!' },
    parents: {
      __type: '[mimes!]',
      __args: {
        distinct_on: '[mimes_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[mimes_order_by!]',
        where: 'mimes_bool_exp',
      },
    },
    traits: { __type: 'jsonb!', __args: { path: 'String' } },
    unique: { __type: 'Boolean!' },
  },
  mimes_aggregate: {
    __typename: { __type: 'String!' },
    aggregate: { __type: 'mimes_aggregate_fields' },
    nodes: { __type: '[mimes!]!' },
  },
  mimes_aggregate_fields: {
    __typename: { __type: 'String!' },
    count: {
      __type: 'Int!',
      __args: { columns: '[mimes_select_column!]', distinct: 'Boolean' },
    },
    max: { __type: 'mimes_max_fields' },
    min: { __type: 'mimes_min_fields' },
  },
  mimes_aggregate_order_by: {
    count: { __type: 'order_by' },
    max: { __type: 'mimes_max_order_by' },
    min: { __type: 'mimes_min_order_by' },
  },
  mimes_append_input: { traits: { __type: 'jsonb' } },
  mimes_bool_exp: {
    _and: { __type: '[mimes_bool_exp!]' },
    _not: { __type: 'mimes_bool_exp' },
    _or: { __type: '[mimes_bool_exp!]' },
    children: { __type: 'mimes_bool_exp' },
    context: { __type: 'Boolean_comparison_exp' },
    hidden: { __type: 'Boolean_comparison_exp' },
    icon: { __type: 'String_comparison_exp' },
    id: { __type: 'String_comparison_exp' },
    parents: { __type: 'mimes_bool_exp' },
    traits: { __type: 'jsonb_comparison_exp' },
    unique: { __type: 'Boolean_comparison_exp' },
  },
  mimes_delete_at_path_input: { traits: { __type: '[String!]' } },
  mimes_delete_elem_input: { traits: { __type: 'Int' } },
  mimes_delete_key_input: { traits: { __type: 'String' } },
  mimes_insert_input: {
    context: { __type: 'Boolean' },
    hidden: { __type: 'Boolean' },
    icon: { __type: 'String' },
    id: { __type: 'String' },
    traits: { __type: 'jsonb' },
    unique: { __type: 'Boolean' },
  },
  mimes_max_fields: {
    __typename: { __type: 'String!' },
    icon: { __type: 'String' },
    id: { __type: 'String' },
  },
  mimes_max_order_by: {
    icon: { __type: 'order_by' },
    id: { __type: 'order_by' },
  },
  mimes_min_fields: {
    __typename: { __type: 'String!' },
    icon: { __type: 'String' },
    id: { __type: 'String' },
  },
  mimes_min_order_by: {
    icon: { __type: 'order_by' },
    id: { __type: 'order_by' },
  },
  mimes_mutation_response: {
    __typename: { __type: 'String!' },
    affected_rows: { __type: 'Int!' },
    returning: { __type: '[mimes!]!' },
  },
  mimes_obj_rel_insert_input: {
    data: { __type: 'mimes_insert_input!' },
    on_conflict: { __type: 'mimes_on_conflict' },
  },
  mimes_on_conflict: {
    constraint: { __type: 'mimes_constraint!' },
    update_columns: { __type: '[mimes_update_column!]!' },
    where: { __type: 'mimes_bool_exp' },
  },
  mimes_order_by: {
    children_aggregate: { __type: 'mimes_aggregate_order_by' },
    context: { __type: 'order_by' },
    hidden: { __type: 'order_by' },
    icon: { __type: 'order_by' },
    id: { __type: 'order_by' },
    parents_aggregate: { __type: 'mimes_aggregate_order_by' },
    traits: { __type: 'order_by' },
    unique: { __type: 'order_by' },
  },
  mimes_pk_columns_input: { id: { __type: 'String!' } },
  mimes_prepend_input: { traits: { __type: 'jsonb' } },
  mimes_set_input: {
    context: { __type: 'Boolean' },
    hidden: { __type: 'Boolean' },
    icon: { __type: 'String' },
    id: { __type: 'String' },
    traits: { __type: 'jsonb' },
    unique: { __type: 'Boolean' },
  },
  mimes_stream_cursor_input: {
    initial_value: { __type: 'mimes_stream_cursor_value_input!' },
    ordering: { __type: 'cursor_ordering' },
  },
  mimes_stream_cursor_value_input: {
    context: { __type: 'Boolean' },
    hidden: { __type: 'Boolean' },
    icon: { __type: 'String' },
    id: { __type: 'String' },
    traits: { __type: 'jsonb' },
    unique: { __type: 'Boolean' },
  },
  mimes_updates: {
    _append: { __type: 'mimes_append_input' },
    _delete_at_path: { __type: 'mimes_delete_at_path_input' },
    _delete_elem: { __type: 'mimes_delete_elem_input' },
    _delete_key: { __type: 'mimes_delete_key_input' },
    _prepend: { __type: 'mimes_prepend_input' },
    _set: { __type: 'mimes_set_input' },
    where: { __type: 'mimes_bool_exp!' },
  },
  mutation: {
    __typename: { __type: 'String!' },
    deleteAuthProvider: { __type: 'authProviders', __args: { id: 'String!' } },
    deleteAuthProviderRequest: {
      __type: 'authProviderRequests',
      __args: { id: 'uuid!' },
    },
    deleteAuthProviderRequests: {
      __type: 'authProviderRequests_mutation_response',
      __args: { where: 'authProviderRequests_bool_exp!' },
    },
    deleteAuthProviders: {
      __type: 'authProviders_mutation_response',
      __args: { where: 'authProviders_bool_exp!' },
    },
    deleteAuthRefreshToken: {
      __type: 'authRefreshTokens',
      __args: { refreshToken: 'uuid!' },
    },
    deleteAuthRefreshTokens: {
      __type: 'authRefreshTokens_mutation_response',
      __args: { where: 'authRefreshTokens_bool_exp!' },
    },
    deleteAuthRole: { __type: 'authRoles', __args: { role: 'String!' } },
    deleteAuthRoles: {
      __type: 'authRoles_mutation_response',
      __args: { where: 'authRoles_bool_exp!' },
    },
    deleteAuthUserProvider: {
      __type: 'authUserProviders',
      __args: { id: 'uuid!' },
    },
    deleteAuthUserProviders: {
      __type: 'authUserProviders_mutation_response',
      __args: { where: 'authUserProviders_bool_exp!' },
    },
    deleteAuthUserRole: { __type: 'authUserRoles', __args: { id: 'uuid!' } },
    deleteAuthUserRoles: {
      __type: 'authUserRoles_mutation_response',
      __args: { where: 'authUserRoles_bool_exp!' },
    },
    deleteAuthUserSecurityKey: {
      __type: 'authUserSecurityKeys',
      __args: { id: 'uuid!' },
    },
    deleteAuthUserSecurityKeys: {
      __type: 'authUserSecurityKeys_mutation_response',
      __args: { where: 'authUserSecurityKeys_bool_exp!' },
    },
    deleteBucket: { __type: 'buckets', __args: { id: 'String!' } },
    deleteBuckets: {
      __type: 'buckets_mutation_response',
      __args: { where: 'buckets_bool_exp!' },
    },
    deleteFile: { __type: 'files', __args: { id: 'uuid!' } },
    deleteFiles: {
      __type: 'files_mutation_response',
      __args: { where: 'files_bool_exp!' },
    },
    deleteMember: { __type: 'members', __args: { id: 'uuid!' } },
    deleteMembers: {
      __type: 'members_mutation_response',
      __args: { where: 'members_bool_exp!' },
    },
    deleteMime: { __type: 'mimes', __args: { id: 'String!' } },
    deleteMimes: {
      __type: 'mimes_mutation_response',
      __args: { where: 'mimes_bool_exp!' },
    },
    deleteNode: { __type: 'nodes', __args: { id: 'uuid!' } },
    deleteNodes: {
      __type: 'nodes_mutation_response',
      __args: { where: 'nodes_bool_exp!' },
    },
    deletePermission: { __type: 'permissions', __args: { id: 'uuid!' } },
    deletePermissions: {
      __type: 'permissions_mutation_response',
      __args: { where: 'permissions_bool_exp!' },
    },
    deleteRelation: { __type: 'relations', __args: { id: 'uuid!' } },
    deleteRelations: {
      __type: 'relations_mutation_response',
      __args: { where: 'relations_bool_exp!' },
    },
    deleteUser: { __type: 'users', __args: { id: 'uuid!' } },
    deleteUsers: {
      __type: 'users_mutation_response',
      __args: { where: 'users_bool_exp!' },
    },
    delete_fields: {
      __type: 'fields_mutation_response',
      __args: { where: 'fields_bool_exp!' },
    },
    delete_fields_by_pk: { __type: 'fields', __args: { id: 'uuid!' } },
    insertAuthProvider: {
      __type: 'authProviders',
      __args: {
        object: 'authProviders_insert_input!',
        on_conflict: 'authProviders_on_conflict',
      },
    },
    insertAuthProviderRequest: {
      __type: 'authProviderRequests',
      __args: {
        object: 'authProviderRequests_insert_input!',
        on_conflict: 'authProviderRequests_on_conflict',
      },
    },
    insertAuthProviderRequests: {
      __type: 'authProviderRequests_mutation_response',
      __args: {
        objects: '[authProviderRequests_insert_input!]!',
        on_conflict: 'authProviderRequests_on_conflict',
      },
    },
    insertAuthProviders: {
      __type: 'authProviders_mutation_response',
      __args: {
        objects: '[authProviders_insert_input!]!',
        on_conflict: 'authProviders_on_conflict',
      },
    },
    insertAuthRefreshToken: {
      __type: 'authRefreshTokens',
      __args: {
        object: 'authRefreshTokens_insert_input!',
        on_conflict: 'authRefreshTokens_on_conflict',
      },
    },
    insertAuthRefreshTokens: {
      __type: 'authRefreshTokens_mutation_response',
      __args: {
        objects: '[authRefreshTokens_insert_input!]!',
        on_conflict: 'authRefreshTokens_on_conflict',
      },
    },
    insertAuthRole: {
      __type: 'authRoles',
      __args: {
        object: 'authRoles_insert_input!',
        on_conflict: 'authRoles_on_conflict',
      },
    },
    insertAuthRoles: {
      __type: 'authRoles_mutation_response',
      __args: {
        objects: '[authRoles_insert_input!]!',
        on_conflict: 'authRoles_on_conflict',
      },
    },
    insertAuthUserProvider: {
      __type: 'authUserProviders',
      __args: {
        object: 'authUserProviders_insert_input!',
        on_conflict: 'authUserProviders_on_conflict',
      },
    },
    insertAuthUserProviders: {
      __type: 'authUserProviders_mutation_response',
      __args: {
        objects: '[authUserProviders_insert_input!]!',
        on_conflict: 'authUserProviders_on_conflict',
      },
    },
    insertAuthUserRole: {
      __type: 'authUserRoles',
      __args: {
        object: 'authUserRoles_insert_input!',
        on_conflict: 'authUserRoles_on_conflict',
      },
    },
    insertAuthUserRoles: {
      __type: 'authUserRoles_mutation_response',
      __args: {
        objects: '[authUserRoles_insert_input!]!',
        on_conflict: 'authUserRoles_on_conflict',
      },
    },
    insertAuthUserSecurityKey: {
      __type: 'authUserSecurityKeys',
      __args: {
        object: 'authUserSecurityKeys_insert_input!',
        on_conflict: 'authUserSecurityKeys_on_conflict',
      },
    },
    insertAuthUserSecurityKeys: {
      __type: 'authUserSecurityKeys_mutation_response',
      __args: {
        objects: '[authUserSecurityKeys_insert_input!]!',
        on_conflict: 'authUserSecurityKeys_on_conflict',
      },
    },
    insertBucket: {
      __type: 'buckets',
      __args: {
        object: 'buckets_insert_input!',
        on_conflict: 'buckets_on_conflict',
      },
    },
    insertBuckets: {
      __type: 'buckets_mutation_response',
      __args: {
        objects: '[buckets_insert_input!]!',
        on_conflict: 'buckets_on_conflict',
      },
    },
    insertFile: {
      __type: 'files',
      __args: {
        object: 'files_insert_input!',
        on_conflict: 'files_on_conflict',
      },
    },
    insertFiles: {
      __type: 'files_mutation_response',
      __args: {
        objects: '[files_insert_input!]!',
        on_conflict: 'files_on_conflict',
      },
    },
    insertMember: {
      __type: 'members',
      __args: {
        object: 'members_insert_input!',
        on_conflict: 'members_on_conflict',
      },
    },
    insertMembers: {
      __type: 'members_mutation_response',
      __args: {
        objects: '[members_insert_input!]!',
        on_conflict: 'members_on_conflict',
      },
    },
    insertMime: {
      __type: 'mimes',
      __args: {
        object: 'mimes_insert_input!',
        on_conflict: 'mimes_on_conflict',
      },
    },
    insertMimes: {
      __type: 'mimes_mutation_response',
      __args: {
        objects: '[mimes_insert_input!]!',
        on_conflict: 'mimes_on_conflict',
      },
    },
    insertNode: {
      __type: 'nodes',
      __args: {
        object: 'nodes_insert_input!',
        on_conflict: 'nodes_on_conflict',
      },
    },
    insertNodes: {
      __type: 'nodes_mutation_response',
      __args: {
        objects: '[nodes_insert_input!]!',
        on_conflict: 'nodes_on_conflict',
      },
    },
    insertPermission: {
      __type: 'permissions',
      __args: {
        object: 'permissions_insert_input!',
        on_conflict: 'permissions_on_conflict',
      },
    },
    insertPermissions: {
      __type: 'permissions_mutation_response',
      __args: {
        objects: '[permissions_insert_input!]!',
        on_conflict: 'permissions_on_conflict',
      },
    },
    insertRelation: {
      __type: 'relations',
      __args: {
        object: 'relations_insert_input!',
        on_conflict: 'relations_on_conflict',
      },
    },
    insertRelations: {
      __type: 'relations_mutation_response',
      __args: {
        objects: '[relations_insert_input!]!',
        on_conflict: 'relations_on_conflict',
      },
    },
    insertUser: {
      __type: 'users',
      __args: {
        object: 'users_insert_input!',
        on_conflict: 'users_on_conflict',
      },
    },
    insertUsers: {
      __type: 'users_mutation_response',
      __args: {
        objects: '[users_insert_input!]!',
        on_conflict: 'users_on_conflict',
      },
    },
    insert_fields: {
      __type: 'fields_mutation_response',
      __args: {
        objects: '[fields_insert_input!]!',
        on_conflict: 'fields_on_conflict',
      },
    },
    insert_fields_one: {
      __type: 'fields',
      __args: {
        object: 'fields_insert_input!',
        on_conflict: 'fields_on_conflict',
      },
    },
    updateAuthProvider: {
      __type: 'authProviders',
      __args: {
        _set: 'authProviders_set_input',
        pk_columns: 'authProviders_pk_columns_input!',
      },
    },
    updateAuthProviderRequest: {
      __type: 'authProviderRequests',
      __args: {
        _append: 'authProviderRequests_append_input',
        _delete_at_path: 'authProviderRequests_delete_at_path_input',
        _delete_elem: 'authProviderRequests_delete_elem_input',
        _delete_key: 'authProviderRequests_delete_key_input',
        _prepend: 'authProviderRequests_prepend_input',
        _set: 'authProviderRequests_set_input',
        pk_columns: 'authProviderRequests_pk_columns_input!',
      },
    },
    updateAuthProviderRequests: {
      __type: 'authProviderRequests_mutation_response',
      __args: {
        _append: 'authProviderRequests_append_input',
        _delete_at_path: 'authProviderRequests_delete_at_path_input',
        _delete_elem: 'authProviderRequests_delete_elem_input',
        _delete_key: 'authProviderRequests_delete_key_input',
        _prepend: 'authProviderRequests_prepend_input',
        _set: 'authProviderRequests_set_input',
        where: 'authProviderRequests_bool_exp!',
      },
    },
    updateAuthProviders: {
      __type: 'authProviders_mutation_response',
      __args: {
        _set: 'authProviders_set_input',
        where: 'authProviders_bool_exp!',
      },
    },
    updateAuthRefreshToken: {
      __type: 'authRefreshTokens',
      __args: {
        _set: 'authRefreshTokens_set_input',
        pk_columns: 'authRefreshTokens_pk_columns_input!',
      },
    },
    updateAuthRefreshTokens: {
      __type: 'authRefreshTokens_mutation_response',
      __args: {
        _set: 'authRefreshTokens_set_input',
        where: 'authRefreshTokens_bool_exp!',
      },
    },
    updateAuthRole: {
      __type: 'authRoles',
      __args: {
        _set: 'authRoles_set_input',
        pk_columns: 'authRoles_pk_columns_input!',
      },
    },
    updateAuthRoles: {
      __type: 'authRoles_mutation_response',
      __args: { _set: 'authRoles_set_input', where: 'authRoles_bool_exp!' },
    },
    updateAuthUserProvider: {
      __type: 'authUserProviders',
      __args: {
        _set: 'authUserProviders_set_input',
        pk_columns: 'authUserProviders_pk_columns_input!',
      },
    },
    updateAuthUserProviders: {
      __type: 'authUserProviders_mutation_response',
      __args: {
        _set: 'authUserProviders_set_input',
        where: 'authUserProviders_bool_exp!',
      },
    },
    updateAuthUserRole: {
      __type: 'authUserRoles',
      __args: {
        _set: 'authUserRoles_set_input',
        pk_columns: 'authUserRoles_pk_columns_input!',
      },
    },
    updateAuthUserRoles: {
      __type: 'authUserRoles_mutation_response',
      __args: {
        _set: 'authUserRoles_set_input',
        where: 'authUserRoles_bool_exp!',
      },
    },
    updateAuthUserSecurityKey: {
      __type: 'authUserSecurityKeys',
      __args: {
        _inc: 'authUserSecurityKeys_inc_input',
        _set: 'authUserSecurityKeys_set_input',
        pk_columns: 'authUserSecurityKeys_pk_columns_input!',
      },
    },
    updateAuthUserSecurityKeys: {
      __type: 'authUserSecurityKeys_mutation_response',
      __args: {
        _inc: 'authUserSecurityKeys_inc_input',
        _set: 'authUserSecurityKeys_set_input',
        where: 'authUserSecurityKeys_bool_exp!',
      },
    },
    updateBucket: {
      __type: 'buckets',
      __args: {
        _inc: 'buckets_inc_input',
        _set: 'buckets_set_input',
        pk_columns: 'buckets_pk_columns_input!',
      },
    },
    updateBuckets: {
      __type: 'buckets_mutation_response',
      __args: {
        _inc: 'buckets_inc_input',
        _set: 'buckets_set_input',
        where: 'buckets_bool_exp!',
      },
    },
    updateFile: {
      __type: 'files',
      __args: {
        _inc: 'files_inc_input',
        _set: 'files_set_input',
        pk_columns: 'files_pk_columns_input!',
      },
    },
    updateFiles: {
      __type: 'files_mutation_response',
      __args: {
        _inc: 'files_inc_input',
        _set: 'files_set_input',
        where: 'files_bool_exp!',
      },
    },
    updateMember: {
      __type: 'members',
      __args: {
        _set: 'members_set_input',
        pk_columns: 'members_pk_columns_input!',
      },
    },
    updateMembers: {
      __type: 'members_mutation_response',
      __args: { _set: 'members_set_input', where: 'members_bool_exp!' },
    },
    updateMime: {
      __type: 'mimes',
      __args: {
        _append: 'mimes_append_input',
        _delete_at_path: 'mimes_delete_at_path_input',
        _delete_elem: 'mimes_delete_elem_input',
        _delete_key: 'mimes_delete_key_input',
        _prepend: 'mimes_prepend_input',
        _set: 'mimes_set_input',
        pk_columns: 'mimes_pk_columns_input!',
      },
    },
    updateMimes: {
      __type: 'mimes_mutation_response',
      __args: {
        _append: 'mimes_append_input',
        _delete_at_path: 'mimes_delete_at_path_input',
        _delete_elem: 'mimes_delete_elem_input',
        _delete_key: 'mimes_delete_key_input',
        _prepend: 'mimes_prepend_input',
        _set: 'mimes_set_input',
        where: 'mimes_bool_exp!',
      },
    },
    updateNode: {
      __type: 'nodes',
      __args: {
        _append: 'nodes_append_input',
        _delete_at_path: 'nodes_delete_at_path_input',
        _delete_elem: 'nodes_delete_elem_input',
        _delete_key: 'nodes_delete_key_input',
        _inc: 'nodes_inc_input',
        _prepend: 'nodes_prepend_input',
        _set: 'nodes_set_input',
        pk_columns: 'nodes_pk_columns_input!',
      },
    },
    updateNodes: {
      __type: 'nodes_mutation_response',
      __args: {
        _append: 'nodes_append_input',
        _delete_at_path: 'nodes_delete_at_path_input',
        _delete_elem: 'nodes_delete_elem_input',
        _delete_key: 'nodes_delete_key_input',
        _inc: 'nodes_inc_input',
        _prepend: 'nodes_prepend_input',
        _set: 'nodes_set_input',
        where: 'nodes_bool_exp!',
      },
    },
    updatePermission: {
      __type: 'permissions',
      __args: {
        _set: 'permissions_set_input',
        pk_columns: 'permissions_pk_columns_input!',
      },
    },
    updatePermissions: {
      __type: 'permissions_mutation_response',
      __args: { _set: 'permissions_set_input', where: 'permissions_bool_exp!' },
    },
    updateRelation: {
      __type: 'relations',
      __args: {
        _set: 'relations_set_input',
        pk_columns: 'relations_pk_columns_input!',
      },
    },
    updateRelations: {
      __type: 'relations_mutation_response',
      __args: { _set: 'relations_set_input', where: 'relations_bool_exp!' },
    },
    updateUser: {
      __type: 'users',
      __args: {
        _append: 'users_append_input',
        _delete_at_path: 'users_delete_at_path_input',
        _delete_elem: 'users_delete_elem_input',
        _delete_key: 'users_delete_key_input',
        _prepend: 'users_prepend_input',
        _set: 'users_set_input',
        pk_columns: 'users_pk_columns_input!',
      },
    },
    updateUsers: {
      __type: 'users_mutation_response',
      __args: {
        _append: 'users_append_input',
        _delete_at_path: 'users_delete_at_path_input',
        _delete_elem: 'users_delete_elem_input',
        _delete_key: 'users_delete_key_input',
        _prepend: 'users_prepend_input',
        _set: 'users_set_input',
        where: 'users_bool_exp!',
      },
    },
    update_authProviderRequests_many: {
      __type: '[authProviderRequests_mutation_response]',
      __args: { updates: '[authProviderRequests_updates!]!' },
    },
    update_authProviders_many: {
      __type: '[authProviders_mutation_response]',
      __args: { updates: '[authProviders_updates!]!' },
    },
    update_authRefreshTokens_many: {
      __type: '[authRefreshTokens_mutation_response]',
      __args: { updates: '[authRefreshTokens_updates!]!' },
    },
    update_authRoles_many: {
      __type: '[authRoles_mutation_response]',
      __args: { updates: '[authRoles_updates!]!' },
    },
    update_authUserProviders_many: {
      __type: '[authUserProviders_mutation_response]',
      __args: { updates: '[authUserProviders_updates!]!' },
    },
    update_authUserRoles_many: {
      __type: '[authUserRoles_mutation_response]',
      __args: { updates: '[authUserRoles_updates!]!' },
    },
    update_authUserSecurityKeys_many: {
      __type: '[authUserSecurityKeys_mutation_response]',
      __args: { updates: '[authUserSecurityKeys_updates!]!' },
    },
    update_buckets_many: {
      __type: '[buckets_mutation_response]',
      __args: { updates: '[buckets_updates!]!' },
    },
    update_fields: {
      __type: 'fields_mutation_response',
      __args: {
        _append: 'fields_append_input',
        _delete_at_path: 'fields_delete_at_path_input',
        _delete_elem: 'fields_delete_elem_input',
        _delete_key: 'fields_delete_key_input',
        _prepend: 'fields_prepend_input',
        _set: 'fields_set_input',
        where: 'fields_bool_exp!',
      },
    },
    update_fields_by_pk: {
      __type: 'fields',
      __args: {
        _append: 'fields_append_input',
        _delete_at_path: 'fields_delete_at_path_input',
        _delete_elem: 'fields_delete_elem_input',
        _delete_key: 'fields_delete_key_input',
        _prepend: 'fields_prepend_input',
        _set: 'fields_set_input',
        pk_columns: 'fields_pk_columns_input!',
      },
    },
    update_fields_many: {
      __type: '[fields_mutation_response]',
      __args: { updates: '[fields_updates!]!' },
    },
    update_files_many: {
      __type: '[files_mutation_response]',
      __args: { updates: '[files_updates!]!' },
    },
    update_members_many: {
      __type: '[members_mutation_response]',
      __args: { updates: '[members_updates!]!' },
    },
    update_mimes_many: {
      __type: '[mimes_mutation_response]',
      __args: { updates: '[mimes_updates!]!' },
    },
    update_nodes_many: {
      __type: '[nodes_mutation_response]',
      __args: { updates: '[nodes_updates!]!' },
    },
    update_permissions_many: {
      __type: '[permissions_mutation_response]',
      __args: { updates: '[permissions_updates!]!' },
    },
    update_relations_many: {
      __type: '[relations_mutation_response]',
      __args: { updates: '[relations_updates!]!' },
    },
    update_users_many: {
      __type: '[users_mutation_response]',
      __args: { updates: '[users_updates!]!' },
    },
  },
  nodes: {
    __typename: { __type: 'String!' },
    attachable: { __type: 'Boolean!' },
    checkUnique: {
      __type: 'Boolean',
      __args: { args: 'checkUnique_nodes_args!' },
    },
    children: {
      __type: '[nodes!]!',
      __args: {
        distinct_on: '[nodes_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[nodes_order_by!]',
        where: 'nodes_bool_exp',
      },
    },
    children_aggregate: {
      __type: 'nodes_aggregate!',
      __args: {
        distinct_on: '[nodes_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[nodes_order_by!]',
        where: 'nodes_bool_exp',
      },
    },
    context: { __type: 'nodes' },
    contextId: { __type: 'uuid' },
    contextOwners: {
      __type: '[users!]',
      __args: {
        distinct_on: '[users_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[users_order_by!]',
        where: 'users_bool_exp',
      },
    },
    createdAt: { __type: 'timestamptz' },
    data: { __type: 'jsonb', __args: { path: 'String' } },
    delete: { __type: 'Boolean' },
    fields: {
      __type: '[fields!]!',
      __args: {
        distinct_on: '[fields_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[fields_order_by!]',
        where: 'fields_bool_exp',
      },
    },
    fields_aggregate: {
      __type: 'fields_aggregate!',
      __args: {
        distinct_on: '[fields_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[fields_order_by!]',
        where: 'fields_bool_exp',
      },
    },
    getIndex: { __type: 'Int' },
    id: { __type: 'uuid!' },
    index: { __type: 'Int!' },
    insert: { __type: 'Boolean' },
    inserts: {
      __type: '[mimes!]',
      __args: {
        distinct_on: '[mimes_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[mimes_order_by!]',
        where: 'mimes_bool_exp',
      },
    },
    isContextOwner: { __type: 'Boolean' },
    isOwner: { __type: 'Boolean' },
    key: { __type: 'String!' },
    members: {
      __type: '[members!]!',
      __args: {
        distinct_on: '[members_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[members_order_by!]',
        where: 'members_bool_exp',
      },
    },
    members_aggregate: {
      __type: 'members_aggregate!',
      __args: {
        distinct_on: '[members_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[members_order_by!]',
        where: 'members_bool_exp',
      },
    },
    mime: { __type: 'mimes' },
    mimeId: { __type: 'String' },
    mutable: { __type: 'Boolean!' },
    name: { __type: 'String!' },
    owner: { __type: 'users' },
    ownerId: { __type: 'uuid' },
    owners: {
      __type: '[users!]',
      __args: {
        distinct_on: '[users_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[users_order_by!]',
        where: 'users_bool_exp',
      },
    },
    parent: { __type: 'nodes' },
    parentId: { __type: 'uuid' },
    permissions: {
      __type: '[permissions!]!',
      __args: {
        distinct_on: '[permissions_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[permissions_order_by!]',
        where: 'permissions_bool_exp',
      },
    },
    permissions_aggregate: {
      __type: 'permissions_aggregate!',
      __args: {
        distinct_on: '[permissions_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[permissions_order_by!]',
        where: 'permissions_bool_exp',
      },
    },
    relation: {
      __type: '[nodes!]',
      __args: {
        args: 'relation_nodes_args!',
        distinct_on: '[nodes_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[nodes_order_by!]',
        where: 'nodes_bool_exp',
      },
    },
    relations: {
      __type: '[relations!]!',
      __args: {
        distinct_on: '[relations_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[relations_order_by!]',
        where: 'relations_bool_exp',
      },
    },
    relations_aggregate: {
      __type: 'relations_aggregate!',
      __args: {
        distinct_on: '[relations_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[relations_order_by!]',
        where: 'relations_bool_exp',
      },
    },
    select: { __type: 'Boolean' },
    unique: { __type: 'String' },
    update: { __type: 'Boolean' },
    updatedAt: { __type: 'timestamptz!' },
  },
  nodes_aggregate: {
    __typename: { __type: 'String!' },
    aggregate: { __type: 'nodes_aggregate_fields' },
    nodes: { __type: '[nodes!]!' },
  },
  nodes_aggregate_bool_exp: {
    bool_and: { __type: 'nodes_aggregate_bool_exp_bool_and' },
    bool_or: { __type: 'nodes_aggregate_bool_exp_bool_or' },
    count: { __type: 'nodes_aggregate_bool_exp_count' },
  },
  nodes_aggregate_bool_exp_bool_and: {
    arguments: {
      __type:
        'nodes_select_column_nodes_aggregate_bool_exp_bool_and_arguments_columns!',
    },
    distinct: { __type: 'Boolean' },
    filter: { __type: 'nodes_bool_exp' },
    predicate: { __type: 'Boolean_comparison_exp!' },
  },
  nodes_aggregate_bool_exp_bool_or: {
    arguments: {
      __type:
        'nodes_select_column_nodes_aggregate_bool_exp_bool_or_arguments_columns!',
    },
    distinct: { __type: 'Boolean' },
    filter: { __type: 'nodes_bool_exp' },
    predicate: { __type: 'Boolean_comparison_exp!' },
  },
  nodes_aggregate_bool_exp_count: {
    arguments: { __type: '[nodes_select_column!]' },
    distinct: { __type: 'Boolean' },
    filter: { __type: 'nodes_bool_exp' },
    predicate: { __type: 'Int_comparison_exp!' },
  },
  nodes_aggregate_fields: {
    __typename: { __type: 'String!' },
    avg: { __type: 'nodes_avg_fields' },
    count: {
      __type: 'Int!',
      __args: { columns: '[nodes_select_column!]', distinct: 'Boolean' },
    },
    max: { __type: 'nodes_max_fields' },
    min: { __type: 'nodes_min_fields' },
    stddev: { __type: 'nodes_stddev_fields' },
    stddev_pop: { __type: 'nodes_stddev_pop_fields' },
    stddev_samp: { __type: 'nodes_stddev_samp_fields' },
    sum: { __type: 'nodes_sum_fields' },
    var_pop: { __type: 'nodes_var_pop_fields' },
    var_samp: { __type: 'nodes_var_samp_fields' },
    variance: { __type: 'nodes_variance_fields' },
  },
  nodes_aggregate_order_by: {
    avg: { __type: 'nodes_avg_order_by' },
    count: { __type: 'order_by' },
    max: { __type: 'nodes_max_order_by' },
    min: { __type: 'nodes_min_order_by' },
    stddev: { __type: 'nodes_stddev_order_by' },
    stddev_pop: { __type: 'nodes_stddev_pop_order_by' },
    stddev_samp: { __type: 'nodes_stddev_samp_order_by' },
    sum: { __type: 'nodes_sum_order_by' },
    var_pop: { __type: 'nodes_var_pop_order_by' },
    var_samp: { __type: 'nodes_var_samp_order_by' },
    variance: { __type: 'nodes_variance_order_by' },
  },
  nodes_append_input: { data: { __type: 'jsonb' } },
  nodes_arr_rel_insert_input: {
    data: { __type: '[nodes_insert_input!]!' },
    on_conflict: { __type: 'nodes_on_conflict' },
  },
  nodes_avg_fields: {
    __typename: { __type: 'String!' },
    index: { __type: 'Float' },
  },
  nodes_avg_order_by: { index: { __type: 'order_by' } },
  nodes_bool_exp: {
    _and: { __type: '[nodes_bool_exp!]' },
    _not: { __type: 'nodes_bool_exp' },
    _or: { __type: '[nodes_bool_exp!]' },
    attachable: { __type: 'Boolean_comparison_exp' },
    children: { __type: 'nodes_bool_exp' },
    children_aggregate: { __type: 'nodes_aggregate_bool_exp' },
    context: { __type: 'nodes_bool_exp' },
    contextId: { __type: 'uuid_comparison_exp' },
    contextOwners: { __type: 'users_bool_exp' },
    createdAt: { __type: 'timestamptz_comparison_exp' },
    data: { __type: 'jsonb_comparison_exp' },
    delete: { __type: 'Boolean_comparison_exp' },
    fields: { __type: 'fields_bool_exp' },
    fields_aggregate: { __type: 'fields_aggregate_bool_exp' },
    getIndex: { __type: 'Int_comparison_exp' },
    id: { __type: 'uuid_comparison_exp' },
    index: { __type: 'Int_comparison_exp' },
    insert: { __type: 'Boolean_comparison_exp' },
    inserts: { __type: 'mimes_bool_exp' },
    isContextOwner: { __type: 'Boolean_comparison_exp' },
    isOwner: { __type: 'Boolean_comparison_exp' },
    key: { __type: 'String_comparison_exp' },
    members: { __type: 'members_bool_exp' },
    members_aggregate: { __type: 'members_aggregate_bool_exp' },
    mime: { __type: 'mimes_bool_exp' },
    mimeId: { __type: 'String_comparison_exp' },
    mutable: { __type: 'Boolean_comparison_exp' },
    name: { __type: 'String_comparison_exp' },
    owner: { __type: 'users_bool_exp' },
    ownerId: { __type: 'uuid_comparison_exp' },
    owners: { __type: 'users_bool_exp' },
    parent: { __type: 'nodes_bool_exp' },
    parentId: { __type: 'uuid_comparison_exp' },
    permissions: { __type: 'permissions_bool_exp' },
    permissions_aggregate: { __type: 'permissions_aggregate_bool_exp' },
    relations: { __type: 'relations_bool_exp' },
    relations_aggregate: { __type: 'relations_aggregate_bool_exp' },
    select: { __type: 'Boolean_comparison_exp' },
    unique: { __type: 'String_comparison_exp' },
    update: { __type: 'Boolean_comparison_exp' },
    updatedAt: { __type: 'timestamptz_comparison_exp' },
  },
  nodes_delete_at_path_input: { data: { __type: '[String!]' } },
  nodes_delete_elem_input: { data: { __type: 'Int' } },
  nodes_delete_key_input: { data: { __type: 'String' } },
  nodes_inc_input: { index: { __type: 'Int' } },
  nodes_insert_input: {
    attachable: { __type: 'Boolean' },
    children: { __type: 'nodes_arr_rel_insert_input' },
    context: { __type: 'nodes_obj_rel_insert_input' },
    contextId: { __type: 'uuid' },
    createdAt: { __type: 'timestamptz' },
    data: { __type: 'jsonb' },
    fields: { __type: 'fields_arr_rel_insert_input' },
    id: { __type: 'uuid' },
    index: { __type: 'Int' },
    key: { __type: 'String' },
    members: { __type: 'members_arr_rel_insert_input' },
    mime: { __type: 'mimes_obj_rel_insert_input' },
    mimeId: { __type: 'String' },
    mutable: { __type: 'Boolean' },
    name: { __type: 'String' },
    owner: { __type: 'users_obj_rel_insert_input' },
    ownerId: { __type: 'uuid' },
    parent: { __type: 'nodes_obj_rel_insert_input' },
    parentId: { __type: 'uuid' },
    permissions: { __type: 'permissions_arr_rel_insert_input' },
    relations: { __type: 'relations_arr_rel_insert_input' },
    updatedAt: { __type: 'timestamptz' },
  },
  nodes_max_fields: {
    __typename: { __type: 'String!' },
    contextId: { __type: 'uuid' },
    createdAt: { __type: 'timestamptz' },
    id: { __type: 'uuid' },
    index: { __type: 'Int' },
    key: { __type: 'String' },
    mimeId: { __type: 'String' },
    name: { __type: 'String' },
    ownerId: { __type: 'uuid' },
    parentId: { __type: 'uuid' },
    updatedAt: { __type: 'timestamptz' },
  },
  nodes_max_order_by: {
    contextId: { __type: 'order_by' },
    createdAt: { __type: 'order_by' },
    id: { __type: 'order_by' },
    index: { __type: 'order_by' },
    key: { __type: 'order_by' },
    mimeId: { __type: 'order_by' },
    name: { __type: 'order_by' },
    ownerId: { __type: 'order_by' },
    parentId: { __type: 'order_by' },
    updatedAt: { __type: 'order_by' },
  },
  nodes_min_fields: {
    __typename: { __type: 'String!' },
    contextId: { __type: 'uuid' },
    createdAt: { __type: 'timestamptz' },
    id: { __type: 'uuid' },
    index: { __type: 'Int' },
    key: { __type: 'String' },
    mimeId: { __type: 'String' },
    name: { __type: 'String' },
    ownerId: { __type: 'uuid' },
    parentId: { __type: 'uuid' },
    updatedAt: { __type: 'timestamptz' },
  },
  nodes_min_order_by: {
    contextId: { __type: 'order_by' },
    createdAt: { __type: 'order_by' },
    id: { __type: 'order_by' },
    index: { __type: 'order_by' },
    key: { __type: 'order_by' },
    mimeId: { __type: 'order_by' },
    name: { __type: 'order_by' },
    ownerId: { __type: 'order_by' },
    parentId: { __type: 'order_by' },
    updatedAt: { __type: 'order_by' },
  },
  nodes_mutation_response: {
    __typename: { __type: 'String!' },
    affected_rows: { __type: 'Int!' },
    returning: { __type: '[nodes!]!' },
  },
  nodes_obj_rel_insert_input: {
    data: { __type: 'nodes_insert_input!' },
    on_conflict: { __type: 'nodes_on_conflict' },
  },
  nodes_on_conflict: {
    constraint: { __type: 'nodes_constraint!' },
    update_columns: { __type: '[nodes_update_column!]!' },
    where: { __type: 'nodes_bool_exp' },
  },
  nodes_order_by: {
    attachable: { __type: 'order_by' },
    children_aggregate: { __type: 'nodes_aggregate_order_by' },
    context: { __type: 'nodes_order_by' },
    contextId: { __type: 'order_by' },
    contextOwners_aggregate: { __type: 'users_aggregate_order_by' },
    createdAt: { __type: 'order_by' },
    data: { __type: 'order_by' },
    delete: { __type: 'order_by' },
    fields_aggregate: { __type: 'fields_aggregate_order_by' },
    getIndex: { __type: 'order_by' },
    id: { __type: 'order_by' },
    index: { __type: 'order_by' },
    insert: { __type: 'order_by' },
    inserts_aggregate: { __type: 'mimes_aggregate_order_by' },
    isContextOwner: { __type: 'order_by' },
    isOwner: { __type: 'order_by' },
    key: { __type: 'order_by' },
    members_aggregate: { __type: 'members_aggregate_order_by' },
    mime: { __type: 'mimes_order_by' },
    mimeId: { __type: 'order_by' },
    mutable: { __type: 'order_by' },
    name: { __type: 'order_by' },
    owner: { __type: 'users_order_by' },
    ownerId: { __type: 'order_by' },
    owners_aggregate: { __type: 'users_aggregate_order_by' },
    parent: { __type: 'nodes_order_by' },
    parentId: { __type: 'order_by' },
    permissions_aggregate: { __type: 'permissions_aggregate_order_by' },
    relations_aggregate: { __type: 'relations_aggregate_order_by' },
    select: { __type: 'order_by' },
    unique: { __type: 'order_by' },
    update: { __type: 'order_by' },
    updatedAt: { __type: 'order_by' },
  },
  nodes_pk_columns_input: { id: { __type: 'uuid!' } },
  nodes_prepend_input: { data: { __type: 'jsonb' } },
  nodes_set_input: {
    attachable: { __type: 'Boolean' },
    contextId: { __type: 'uuid' },
    createdAt: { __type: 'timestamptz' },
    data: { __type: 'jsonb' },
    id: { __type: 'uuid' },
    index: { __type: 'Int' },
    key: { __type: 'String' },
    mimeId: { __type: 'String' },
    mutable: { __type: 'Boolean' },
    name: { __type: 'String' },
    ownerId: { __type: 'uuid' },
    parentId: { __type: 'uuid' },
    updatedAt: { __type: 'timestamptz' },
  },
  nodes_stddev_fields: {
    __typename: { __type: 'String!' },
    index: { __type: 'Float' },
  },
  nodes_stddev_order_by: { index: { __type: 'order_by' } },
  nodes_stddev_pop_fields: {
    __typename: { __type: 'String!' },
    index: { __type: 'Float' },
  },
  nodes_stddev_pop_order_by: { index: { __type: 'order_by' } },
  nodes_stddev_samp_fields: {
    __typename: { __type: 'String!' },
    index: { __type: 'Float' },
  },
  nodes_stddev_samp_order_by: { index: { __type: 'order_by' } },
  nodes_stream_cursor_input: {
    initial_value: { __type: 'nodes_stream_cursor_value_input!' },
    ordering: { __type: 'cursor_ordering' },
  },
  nodes_stream_cursor_value_input: {
    attachable: { __type: 'Boolean' },
    contextId: { __type: 'uuid' },
    createdAt: { __type: 'timestamptz' },
    data: { __type: 'jsonb' },
    id: { __type: 'uuid' },
    index: { __type: 'Int' },
    key: { __type: 'String' },
    mimeId: { __type: 'String' },
    mutable: { __type: 'Boolean' },
    name: { __type: 'String' },
    ownerId: { __type: 'uuid' },
    parentId: { __type: 'uuid' },
    updatedAt: { __type: 'timestamptz' },
  },
  nodes_sum_fields: {
    __typename: { __type: 'String!' },
    index: { __type: 'Int' },
  },
  nodes_sum_order_by: { index: { __type: 'order_by' } },
  nodes_updates: {
    _append: { __type: 'nodes_append_input' },
    _delete_at_path: { __type: 'nodes_delete_at_path_input' },
    _delete_elem: { __type: 'nodes_delete_elem_input' },
    _delete_key: { __type: 'nodes_delete_key_input' },
    _inc: { __type: 'nodes_inc_input' },
    _prepend: { __type: 'nodes_prepend_input' },
    _set: { __type: 'nodes_set_input' },
    where: { __type: 'nodes_bool_exp!' },
  },
  nodes_var_pop_fields: {
    __typename: { __type: 'String!' },
    index: { __type: 'Float' },
  },
  nodes_var_pop_order_by: { index: { __type: 'order_by' } },
  nodes_var_samp_fields: {
    __typename: { __type: 'String!' },
    index: { __type: 'Float' },
  },
  nodes_var_samp_order_by: { index: { __type: 'order_by' } },
  nodes_variance_fields: {
    __typename: { __type: 'String!' },
    index: { __type: 'Float' },
  },
  nodes_variance_order_by: { index: { __type: 'order_by' } },
  permissions: {
    __typename: { __type: 'String!' },
    active: { __type: 'Boolean!' },
    context: { __type: 'nodes' },
    contextId: { __type: 'uuid' },
    delete: { __type: 'Boolean!' },
    id: { __type: 'uuid!' },
    insert: { __type: 'Boolean!' },
    mimeId: { __type: 'String' },
    node: { __type: 'nodes' },
    nodeId: { __type: 'uuid' },
    parents: { __type: '_text' },
    role: { __type: 'String!' },
    select: { __type: 'Boolean!' },
    update: { __type: 'Boolean!' },
  },
  permissions_aggregate: {
    __typename: { __type: 'String!' },
    aggregate: { __type: 'permissions_aggregate_fields' },
    nodes: { __type: '[permissions!]!' },
  },
  permissions_aggregate_bool_exp: {
    bool_and: { __type: 'permissions_aggregate_bool_exp_bool_and' },
    bool_or: { __type: 'permissions_aggregate_bool_exp_bool_or' },
    count: { __type: 'permissions_aggregate_bool_exp_count' },
  },
  permissions_aggregate_bool_exp_bool_and: {
    arguments: {
      __type:
        'permissions_select_column_permissions_aggregate_bool_exp_bool_and_arguments_columns!',
    },
    distinct: { __type: 'Boolean' },
    filter: { __type: 'permissions_bool_exp' },
    predicate: { __type: 'Boolean_comparison_exp!' },
  },
  permissions_aggregate_bool_exp_bool_or: {
    arguments: {
      __type:
        'permissions_select_column_permissions_aggregate_bool_exp_bool_or_arguments_columns!',
    },
    distinct: { __type: 'Boolean' },
    filter: { __type: 'permissions_bool_exp' },
    predicate: { __type: 'Boolean_comparison_exp!' },
  },
  permissions_aggregate_bool_exp_count: {
    arguments: { __type: '[permissions_select_column!]' },
    distinct: { __type: 'Boolean' },
    filter: { __type: 'permissions_bool_exp' },
    predicate: { __type: 'Int_comparison_exp!' },
  },
  permissions_aggregate_fields: {
    __typename: { __type: 'String!' },
    count: {
      __type: 'Int!',
      __args: { columns: '[permissions_select_column!]', distinct: 'Boolean' },
    },
    max: { __type: 'permissions_max_fields' },
    min: { __type: 'permissions_min_fields' },
  },
  permissions_aggregate_order_by: {
    count: { __type: 'order_by' },
    max: { __type: 'permissions_max_order_by' },
    min: { __type: 'permissions_min_order_by' },
  },
  permissions_arr_rel_insert_input: {
    data: { __type: '[permissions_insert_input!]!' },
    on_conflict: { __type: 'permissions_on_conflict' },
  },
  permissions_bool_exp: {
    _and: { __type: '[permissions_bool_exp!]' },
    _not: { __type: 'permissions_bool_exp' },
    _or: { __type: '[permissions_bool_exp!]' },
    active: { __type: 'Boolean_comparison_exp' },
    context: { __type: 'nodes_bool_exp' },
    contextId: { __type: 'uuid_comparison_exp' },
    delete: { __type: 'Boolean_comparison_exp' },
    id: { __type: 'uuid_comparison_exp' },
    insert: { __type: 'Boolean_comparison_exp' },
    mimeId: { __type: 'String_comparison_exp' },
    node: { __type: 'nodes_bool_exp' },
    nodeId: { __type: 'uuid_comparison_exp' },
    parents: { __type: '_text_comparison_exp' },
    role: { __type: 'String_comparison_exp' },
    select: { __type: 'Boolean_comparison_exp' },
    update: { __type: 'Boolean_comparison_exp' },
  },
  permissions_insert_input: {
    active: { __type: 'Boolean' },
    context: { __type: 'nodes_obj_rel_insert_input' },
    contextId: { __type: 'uuid' },
    delete: { __type: 'Boolean' },
    id: { __type: 'uuid' },
    insert: { __type: 'Boolean' },
    mimeId: { __type: 'String' },
    node: { __type: 'nodes_obj_rel_insert_input' },
    nodeId: { __type: 'uuid' },
    parents: { __type: '_text' },
    role: { __type: 'String' },
    select: { __type: 'Boolean' },
    update: { __type: 'Boolean' },
  },
  permissions_max_fields: {
    __typename: { __type: 'String!' },
    contextId: { __type: 'uuid' },
    id: { __type: 'uuid' },
    mimeId: { __type: 'String' },
    nodeId: { __type: 'uuid' },
    role: { __type: 'String' },
  },
  permissions_max_order_by: {
    contextId: { __type: 'order_by' },
    id: { __type: 'order_by' },
    mimeId: { __type: 'order_by' },
    nodeId: { __type: 'order_by' },
    role: { __type: 'order_by' },
  },
  permissions_min_fields: {
    __typename: { __type: 'String!' },
    contextId: { __type: 'uuid' },
    id: { __type: 'uuid' },
    mimeId: { __type: 'String' },
    nodeId: { __type: 'uuid' },
    role: { __type: 'String' },
  },
  permissions_min_order_by: {
    contextId: { __type: 'order_by' },
    id: { __type: 'order_by' },
    mimeId: { __type: 'order_by' },
    nodeId: { __type: 'order_by' },
    role: { __type: 'order_by' },
  },
  permissions_mutation_response: {
    __typename: { __type: 'String!' },
    affected_rows: { __type: 'Int!' },
    returning: { __type: '[permissions!]!' },
  },
  permissions_on_conflict: {
    constraint: { __type: 'permissions_constraint!' },
    update_columns: { __type: '[permissions_update_column!]!' },
    where: { __type: 'permissions_bool_exp' },
  },
  permissions_order_by: {
    active: { __type: 'order_by' },
    context: { __type: 'nodes_order_by' },
    contextId: { __type: 'order_by' },
    delete: { __type: 'order_by' },
    id: { __type: 'order_by' },
    insert: { __type: 'order_by' },
    mimeId: { __type: 'order_by' },
    node: { __type: 'nodes_order_by' },
    nodeId: { __type: 'order_by' },
    parents: { __type: 'order_by' },
    role: { __type: 'order_by' },
    select: { __type: 'order_by' },
    update: { __type: 'order_by' },
  },
  permissions_pk_columns_input: { id: { __type: 'uuid!' } },
  permissions_set_input: {
    active: { __type: 'Boolean' },
    contextId: { __type: 'uuid' },
    delete: { __type: 'Boolean' },
    id: { __type: 'uuid' },
    insert: { __type: 'Boolean' },
    mimeId: { __type: 'String' },
    nodeId: { __type: 'uuid' },
    parents: { __type: '_text' },
    role: { __type: 'String' },
    select: { __type: 'Boolean' },
    update: { __type: 'Boolean' },
  },
  permissions_stream_cursor_input: {
    initial_value: { __type: 'permissions_stream_cursor_value_input!' },
    ordering: { __type: 'cursor_ordering' },
  },
  permissions_stream_cursor_value_input: {
    active: { __type: 'Boolean' },
    contextId: { __type: 'uuid' },
    delete: { __type: 'Boolean' },
    id: { __type: 'uuid' },
    insert: { __type: 'Boolean' },
    mimeId: { __type: 'String' },
    nodeId: { __type: 'uuid' },
    parents: { __type: '_text' },
    role: { __type: 'String' },
    select: { __type: 'Boolean' },
    update: { __type: 'Boolean' },
  },
  permissions_updates: {
    _set: { __type: 'permissions_set_input' },
    where: { __type: 'permissions_bool_exp!' },
  },
  query: {
    __typename: { __type: 'String!' },
    authProvider: { __type: 'authProviders', __args: { id: 'String!' } },
    authProviderRequest: {
      __type: 'authProviderRequests',
      __args: { id: 'uuid!' },
    },
    authProviderRequests: {
      __type: '[authProviderRequests!]!',
      __args: {
        distinct_on: '[authProviderRequests_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[authProviderRequests_order_by!]',
        where: 'authProviderRequests_bool_exp',
      },
    },
    authProviderRequestsAggregate: {
      __type: 'authProviderRequests_aggregate!',
      __args: {
        distinct_on: '[authProviderRequests_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[authProviderRequests_order_by!]',
        where: 'authProviderRequests_bool_exp',
      },
    },
    authProviders: {
      __type: '[authProviders!]!',
      __args: {
        distinct_on: '[authProviders_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[authProviders_order_by!]',
        where: 'authProviders_bool_exp',
      },
    },
    authProvidersAggregate: {
      __type: 'authProviders_aggregate!',
      __args: {
        distinct_on: '[authProviders_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[authProviders_order_by!]',
        where: 'authProviders_bool_exp',
      },
    },
    authRefreshToken: {
      __type: 'authRefreshTokens',
      __args: { refreshToken: 'uuid!' },
    },
    authRefreshTokens: {
      __type: '[authRefreshTokens!]!',
      __args: {
        distinct_on: '[authRefreshTokens_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[authRefreshTokens_order_by!]',
        where: 'authRefreshTokens_bool_exp',
      },
    },
    authRefreshTokensAggregate: {
      __type: 'authRefreshTokens_aggregate!',
      __args: {
        distinct_on: '[authRefreshTokens_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[authRefreshTokens_order_by!]',
        where: 'authRefreshTokens_bool_exp',
      },
    },
    authRole: { __type: 'authRoles', __args: { role: 'String!' } },
    authRoles: {
      __type: '[authRoles!]!',
      __args: {
        distinct_on: '[authRoles_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[authRoles_order_by!]',
        where: 'authRoles_bool_exp',
      },
    },
    authRolesAggregate: {
      __type: 'authRoles_aggregate!',
      __args: {
        distinct_on: '[authRoles_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[authRoles_order_by!]',
        where: 'authRoles_bool_exp',
      },
    },
    authUserProvider: { __type: 'authUserProviders', __args: { id: 'uuid!' } },
    authUserProviders: {
      __type: '[authUserProviders!]!',
      __args: {
        distinct_on: '[authUserProviders_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[authUserProviders_order_by!]',
        where: 'authUserProviders_bool_exp',
      },
    },
    authUserProvidersAggregate: {
      __type: 'authUserProviders_aggregate!',
      __args: {
        distinct_on: '[authUserProviders_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[authUserProviders_order_by!]',
        where: 'authUserProviders_bool_exp',
      },
    },
    authUserRole: { __type: 'authUserRoles', __args: { id: 'uuid!' } },
    authUserRoles: {
      __type: '[authUserRoles!]!',
      __args: {
        distinct_on: '[authUserRoles_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[authUserRoles_order_by!]',
        where: 'authUserRoles_bool_exp',
      },
    },
    authUserRolesAggregate: {
      __type: 'authUserRoles_aggregate!',
      __args: {
        distinct_on: '[authUserRoles_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[authUserRoles_order_by!]',
        where: 'authUserRoles_bool_exp',
      },
    },
    authUserSecurityKey: {
      __type: 'authUserSecurityKeys',
      __args: { id: 'uuid!' },
    },
    authUserSecurityKeys: {
      __type: '[authUserSecurityKeys!]!',
      __args: {
        distinct_on: '[authUserSecurityKeys_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[authUserSecurityKeys_order_by!]',
        where: 'authUserSecurityKeys_bool_exp',
      },
    },
    authUserSecurityKeysAggregate: {
      __type: 'authUserSecurityKeys_aggregate!',
      __args: {
        distinct_on: '[authUserSecurityKeys_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[authUserSecurityKeys_order_by!]',
        where: 'authUserSecurityKeys_bool_exp',
      },
    },
    bucket: { __type: 'buckets', __args: { id: 'String!' } },
    buckets: {
      __type: '[buckets!]!',
      __args: {
        distinct_on: '[buckets_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[buckets_order_by!]',
        where: 'buckets_bool_exp',
      },
    },
    bucketsAggregate: {
      __type: 'buckets_aggregate!',
      __args: {
        distinct_on: '[buckets_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[buckets_order_by!]',
        where: 'buckets_bool_exp',
      },
    },
    fields: {
      __type: '[fields!]!',
      __args: {
        distinct_on: '[fields_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[fields_order_by!]',
        where: 'fields_bool_exp',
      },
    },
    fields_aggregate: {
      __type: 'fields_aggregate!',
      __args: {
        distinct_on: '[fields_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[fields_order_by!]',
        where: 'fields_bool_exp',
      },
    },
    fields_by_pk: { __type: 'fields', __args: { id: 'uuid!' } },
    file: { __type: 'files', __args: { id: 'uuid!' } },
    files: {
      __type: '[files!]!',
      __args: {
        distinct_on: '[files_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[files_order_by!]',
        where: 'files_bool_exp',
      },
    },
    filesAggregate: {
      __type: 'files_aggregate!',
      __args: {
        distinct_on: '[files_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[files_order_by!]',
        where: 'files_bool_exp',
      },
    },
    member: { __type: 'members', __args: { id: 'uuid!' } },
    members: {
      __type: '[members!]!',
      __args: {
        distinct_on: '[members_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[members_order_by!]',
        where: 'members_bool_exp',
      },
    },
    membersAggregate: {
      __type: 'members_aggregate!',
      __args: {
        distinct_on: '[members_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[members_order_by!]',
        where: 'members_bool_exp',
      },
    },
    mime: { __type: 'mimes', __args: { id: 'String!' } },
    mimes: {
      __type: '[mimes!]!',
      __args: {
        distinct_on: '[mimes_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[mimes_order_by!]',
        where: 'mimes_bool_exp',
      },
    },
    mimesAggregate: {
      __type: 'mimes_aggregate!',
      __args: {
        distinct_on: '[mimes_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[mimes_order_by!]',
        where: 'mimes_bool_exp',
      },
    },
    node: { __type: 'nodes', __args: { id: 'uuid!' } },
    nodes: {
      __type: '[nodes!]!',
      __args: {
        distinct_on: '[nodes_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[nodes_order_by!]',
        where: 'nodes_bool_exp',
      },
    },
    nodesAggregate: {
      __type: 'nodes_aggregate!',
      __args: {
        distinct_on: '[nodes_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[nodes_order_by!]',
        where: 'nodes_bool_exp',
      },
    },
    permission: { __type: 'permissions', __args: { id: 'uuid!' } },
    permissions: {
      __type: '[permissions!]!',
      __args: {
        distinct_on: '[permissions_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[permissions_order_by!]',
        where: 'permissions_bool_exp',
      },
    },
    permissionsAggregate: {
      __type: 'permissions_aggregate!',
      __args: {
        distinct_on: '[permissions_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[permissions_order_by!]',
        where: 'permissions_bool_exp',
      },
    },
    relation: { __type: 'relations', __args: { id: 'uuid!' } },
    relations: {
      __type: '[relations!]!',
      __args: {
        distinct_on: '[relations_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[relations_order_by!]',
        where: 'relations_bool_exp',
      },
    },
    relationsAggregate: {
      __type: 'relations_aggregate!',
      __args: {
        distinct_on: '[relations_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[relations_order_by!]',
        where: 'relations_bool_exp',
      },
    },
    user: { __type: 'users', __args: { id: 'uuid!' } },
    users: {
      __type: '[users!]!',
      __args: {
        distinct_on: '[users_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[users_order_by!]',
        where: 'users_bool_exp',
      },
    },
    usersAggregate: {
      __type: 'users_aggregate!',
      __args: {
        distinct_on: '[users_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[users_order_by!]',
        where: 'users_bool_exp',
      },
    },
  },
  relation_nodes_args: { relation_name: { __type: 'String' } },
  relations: {
    __typename: { __type: 'String!' },
    id: { __type: 'uuid!' },
    name: { __type: 'String!' },
    node: { __type: 'nodes' },
    nodeId: { __type: 'uuid' },
    parent: { __type: 'nodes' },
    parentId: { __type: 'uuid!' },
  },
  relations_aggregate: {
    __typename: { __type: 'String!' },
    aggregate: { __type: 'relations_aggregate_fields' },
    nodes: { __type: '[relations!]!' },
  },
  relations_aggregate_bool_exp: {
    count: { __type: 'relations_aggregate_bool_exp_count' },
  },
  relations_aggregate_bool_exp_count: {
    arguments: { __type: '[relations_select_column!]' },
    distinct: { __type: 'Boolean' },
    filter: { __type: 'relations_bool_exp' },
    predicate: { __type: 'Int_comparison_exp!' },
  },
  relations_aggregate_fields: {
    __typename: { __type: 'String!' },
    count: {
      __type: 'Int!',
      __args: { columns: '[relations_select_column!]', distinct: 'Boolean' },
    },
    max: { __type: 'relations_max_fields' },
    min: { __type: 'relations_min_fields' },
  },
  relations_aggregate_order_by: {
    count: { __type: 'order_by' },
    max: { __type: 'relations_max_order_by' },
    min: { __type: 'relations_min_order_by' },
  },
  relations_arr_rel_insert_input: {
    data: { __type: '[relations_insert_input!]!' },
    on_conflict: { __type: 'relations_on_conflict' },
  },
  relations_bool_exp: {
    _and: { __type: '[relations_bool_exp!]' },
    _not: { __type: 'relations_bool_exp' },
    _or: { __type: '[relations_bool_exp!]' },
    id: { __type: 'uuid_comparison_exp' },
    name: { __type: 'String_comparison_exp' },
    node: { __type: 'nodes_bool_exp' },
    nodeId: { __type: 'uuid_comparison_exp' },
    parent: { __type: 'nodes_bool_exp' },
    parentId: { __type: 'uuid_comparison_exp' },
  },
  relations_insert_input: {
    id: { __type: 'uuid' },
    name: { __type: 'String' },
    node: { __type: 'nodes_obj_rel_insert_input' },
    nodeId: { __type: 'uuid' },
    parent: { __type: 'nodes_obj_rel_insert_input' },
    parentId: { __type: 'uuid' },
  },
  relations_max_fields: {
    __typename: { __type: 'String!' },
    id: { __type: 'uuid' },
    name: { __type: 'String' },
    nodeId: { __type: 'uuid' },
    parentId: { __type: 'uuid' },
  },
  relations_max_order_by: {
    id: { __type: 'order_by' },
    name: { __type: 'order_by' },
    nodeId: { __type: 'order_by' },
    parentId: { __type: 'order_by' },
  },
  relations_min_fields: {
    __typename: { __type: 'String!' },
    id: { __type: 'uuid' },
    name: { __type: 'String' },
    nodeId: { __type: 'uuid' },
    parentId: { __type: 'uuid' },
  },
  relations_min_order_by: {
    id: { __type: 'order_by' },
    name: { __type: 'order_by' },
    nodeId: { __type: 'order_by' },
    parentId: { __type: 'order_by' },
  },
  relations_mutation_response: {
    __typename: { __type: 'String!' },
    affected_rows: { __type: 'Int!' },
    returning: { __type: '[relations!]!' },
  },
  relations_on_conflict: {
    constraint: { __type: 'relations_constraint!' },
    update_columns: { __type: '[relations_update_column!]!' },
    where: { __type: 'relations_bool_exp' },
  },
  relations_order_by: {
    id: { __type: 'order_by' },
    name: { __type: 'order_by' },
    node: { __type: 'nodes_order_by' },
    nodeId: { __type: 'order_by' },
    parent: { __type: 'nodes_order_by' },
    parentId: { __type: 'order_by' },
  },
  relations_pk_columns_input: { id: { __type: 'uuid!' } },
  relations_set_input: {
    id: { __type: 'uuid' },
    name: { __type: 'String' },
    nodeId: { __type: 'uuid' },
    parentId: { __type: 'uuid' },
  },
  relations_stream_cursor_input: {
    initial_value: { __type: 'relations_stream_cursor_value_input!' },
    ordering: { __type: 'cursor_ordering' },
  },
  relations_stream_cursor_value_input: {
    id: { __type: 'uuid' },
    name: { __type: 'String' },
    nodeId: { __type: 'uuid' },
    parentId: { __type: 'uuid' },
  },
  relations_updates: {
    _set: { __type: 'relations_set_input' },
    where: { __type: 'relations_bool_exp!' },
  },
  subscription: {
    __typename: { __type: 'String!' },
    authProvider: { __type: 'authProviders', __args: { id: 'String!' } },
    authProviderRequest: {
      __type: 'authProviderRequests',
      __args: { id: 'uuid!' },
    },
    authProviderRequests: {
      __type: '[authProviderRequests!]!',
      __args: {
        distinct_on: '[authProviderRequests_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[authProviderRequests_order_by!]',
        where: 'authProviderRequests_bool_exp',
      },
    },
    authProviderRequestsAggregate: {
      __type: 'authProviderRequests_aggregate!',
      __args: {
        distinct_on: '[authProviderRequests_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[authProviderRequests_order_by!]',
        where: 'authProviderRequests_bool_exp',
      },
    },
    authProviderRequests_stream: {
      __type: '[authProviderRequests!]!',
      __args: {
        batch_size: 'Int!',
        cursor: '[authProviderRequests_stream_cursor_input]!',
        where: 'authProviderRequests_bool_exp',
      },
    },
    authProviders: {
      __type: '[authProviders!]!',
      __args: {
        distinct_on: '[authProviders_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[authProviders_order_by!]',
        where: 'authProviders_bool_exp',
      },
    },
    authProvidersAggregate: {
      __type: 'authProviders_aggregate!',
      __args: {
        distinct_on: '[authProviders_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[authProviders_order_by!]',
        where: 'authProviders_bool_exp',
      },
    },
    authProviders_stream: {
      __type: '[authProviders!]!',
      __args: {
        batch_size: 'Int!',
        cursor: '[authProviders_stream_cursor_input]!',
        where: 'authProviders_bool_exp',
      },
    },
    authRefreshToken: {
      __type: 'authRefreshTokens',
      __args: { refreshToken: 'uuid!' },
    },
    authRefreshTokens: {
      __type: '[authRefreshTokens!]!',
      __args: {
        distinct_on: '[authRefreshTokens_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[authRefreshTokens_order_by!]',
        where: 'authRefreshTokens_bool_exp',
      },
    },
    authRefreshTokensAggregate: {
      __type: 'authRefreshTokens_aggregate!',
      __args: {
        distinct_on: '[authRefreshTokens_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[authRefreshTokens_order_by!]',
        where: 'authRefreshTokens_bool_exp',
      },
    },
    authRefreshTokens_stream: {
      __type: '[authRefreshTokens!]!',
      __args: {
        batch_size: 'Int!',
        cursor: '[authRefreshTokens_stream_cursor_input]!',
        where: 'authRefreshTokens_bool_exp',
      },
    },
    authRole: { __type: 'authRoles', __args: { role: 'String!' } },
    authRoles: {
      __type: '[authRoles!]!',
      __args: {
        distinct_on: '[authRoles_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[authRoles_order_by!]',
        where: 'authRoles_bool_exp',
      },
    },
    authRolesAggregate: {
      __type: 'authRoles_aggregate!',
      __args: {
        distinct_on: '[authRoles_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[authRoles_order_by!]',
        where: 'authRoles_bool_exp',
      },
    },
    authRoles_stream: {
      __type: '[authRoles!]!',
      __args: {
        batch_size: 'Int!',
        cursor: '[authRoles_stream_cursor_input]!',
        where: 'authRoles_bool_exp',
      },
    },
    authUserProvider: { __type: 'authUserProviders', __args: { id: 'uuid!' } },
    authUserProviders: {
      __type: '[authUserProviders!]!',
      __args: {
        distinct_on: '[authUserProviders_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[authUserProviders_order_by!]',
        where: 'authUserProviders_bool_exp',
      },
    },
    authUserProvidersAggregate: {
      __type: 'authUserProviders_aggregate!',
      __args: {
        distinct_on: '[authUserProviders_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[authUserProviders_order_by!]',
        where: 'authUserProviders_bool_exp',
      },
    },
    authUserProviders_stream: {
      __type: '[authUserProviders!]!',
      __args: {
        batch_size: 'Int!',
        cursor: '[authUserProviders_stream_cursor_input]!',
        where: 'authUserProviders_bool_exp',
      },
    },
    authUserRole: { __type: 'authUserRoles', __args: { id: 'uuid!' } },
    authUserRoles: {
      __type: '[authUserRoles!]!',
      __args: {
        distinct_on: '[authUserRoles_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[authUserRoles_order_by!]',
        where: 'authUserRoles_bool_exp',
      },
    },
    authUserRolesAggregate: {
      __type: 'authUserRoles_aggregate!',
      __args: {
        distinct_on: '[authUserRoles_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[authUserRoles_order_by!]',
        where: 'authUserRoles_bool_exp',
      },
    },
    authUserRoles_stream: {
      __type: '[authUserRoles!]!',
      __args: {
        batch_size: 'Int!',
        cursor: '[authUserRoles_stream_cursor_input]!',
        where: 'authUserRoles_bool_exp',
      },
    },
    authUserSecurityKey: {
      __type: 'authUserSecurityKeys',
      __args: { id: 'uuid!' },
    },
    authUserSecurityKeys: {
      __type: '[authUserSecurityKeys!]!',
      __args: {
        distinct_on: '[authUserSecurityKeys_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[authUserSecurityKeys_order_by!]',
        where: 'authUserSecurityKeys_bool_exp',
      },
    },
    authUserSecurityKeysAggregate: {
      __type: 'authUserSecurityKeys_aggregate!',
      __args: {
        distinct_on: '[authUserSecurityKeys_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[authUserSecurityKeys_order_by!]',
        where: 'authUserSecurityKeys_bool_exp',
      },
    },
    authUserSecurityKeys_stream: {
      __type: '[authUserSecurityKeys!]!',
      __args: {
        batch_size: 'Int!',
        cursor: '[authUserSecurityKeys_stream_cursor_input]!',
        where: 'authUserSecurityKeys_bool_exp',
      },
    },
    bucket: { __type: 'buckets', __args: { id: 'String!' } },
    buckets: {
      __type: '[buckets!]!',
      __args: {
        distinct_on: '[buckets_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[buckets_order_by!]',
        where: 'buckets_bool_exp',
      },
    },
    bucketsAggregate: {
      __type: 'buckets_aggregate!',
      __args: {
        distinct_on: '[buckets_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[buckets_order_by!]',
        where: 'buckets_bool_exp',
      },
    },
    buckets_stream: {
      __type: '[buckets!]!',
      __args: {
        batch_size: 'Int!',
        cursor: '[buckets_stream_cursor_input]!',
        where: 'buckets_bool_exp',
      },
    },
    fields: {
      __type: '[fields!]!',
      __args: {
        distinct_on: '[fields_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[fields_order_by!]',
        where: 'fields_bool_exp',
      },
    },
    fields_aggregate: {
      __type: 'fields_aggregate!',
      __args: {
        distinct_on: '[fields_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[fields_order_by!]',
        where: 'fields_bool_exp',
      },
    },
    fields_by_pk: { __type: 'fields', __args: { id: 'uuid!' } },
    fields_stream: {
      __type: '[fields!]!',
      __args: {
        batch_size: 'Int!',
        cursor: '[fields_stream_cursor_input]!',
        where: 'fields_bool_exp',
      },
    },
    file: { __type: 'files', __args: { id: 'uuid!' } },
    files: {
      __type: '[files!]!',
      __args: {
        distinct_on: '[files_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[files_order_by!]',
        where: 'files_bool_exp',
      },
    },
    filesAggregate: {
      __type: 'files_aggregate!',
      __args: {
        distinct_on: '[files_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[files_order_by!]',
        where: 'files_bool_exp',
      },
    },
    files_stream: {
      __type: '[files!]!',
      __args: {
        batch_size: 'Int!',
        cursor: '[files_stream_cursor_input]!',
        where: 'files_bool_exp',
      },
    },
    member: { __type: 'members', __args: { id: 'uuid!' } },
    members: {
      __type: '[members!]!',
      __args: {
        distinct_on: '[members_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[members_order_by!]',
        where: 'members_bool_exp',
      },
    },
    membersAggregate: {
      __type: 'members_aggregate!',
      __args: {
        distinct_on: '[members_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[members_order_by!]',
        where: 'members_bool_exp',
      },
    },
    members_stream: {
      __type: '[members!]!',
      __args: {
        batch_size: 'Int!',
        cursor: '[members_stream_cursor_input]!',
        where: 'members_bool_exp',
      },
    },
    mime: { __type: 'mimes', __args: { id: 'String!' } },
    mimes: {
      __type: '[mimes!]!',
      __args: {
        distinct_on: '[mimes_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[mimes_order_by!]',
        where: 'mimes_bool_exp',
      },
    },
    mimesAggregate: {
      __type: 'mimes_aggregate!',
      __args: {
        distinct_on: '[mimes_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[mimes_order_by!]',
        where: 'mimes_bool_exp',
      },
    },
    mimes_stream: {
      __type: '[mimes!]!',
      __args: {
        batch_size: 'Int!',
        cursor: '[mimes_stream_cursor_input]!',
        where: 'mimes_bool_exp',
      },
    },
    node: { __type: 'nodes', __args: { id: 'uuid!' } },
    nodes: {
      __type: '[nodes!]!',
      __args: {
        distinct_on: '[nodes_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[nodes_order_by!]',
        where: 'nodes_bool_exp',
      },
    },
    nodesAggregate: {
      __type: 'nodes_aggregate!',
      __args: {
        distinct_on: '[nodes_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[nodes_order_by!]',
        where: 'nodes_bool_exp',
      },
    },
    nodes_stream: {
      __type: '[nodes!]!',
      __args: {
        batch_size: 'Int!',
        cursor: '[nodes_stream_cursor_input]!',
        where: 'nodes_bool_exp',
      },
    },
    permission: { __type: 'permissions', __args: { id: 'uuid!' } },
    permissions: {
      __type: '[permissions!]!',
      __args: {
        distinct_on: '[permissions_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[permissions_order_by!]',
        where: 'permissions_bool_exp',
      },
    },
    permissionsAggregate: {
      __type: 'permissions_aggregate!',
      __args: {
        distinct_on: '[permissions_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[permissions_order_by!]',
        where: 'permissions_bool_exp',
      },
    },
    permissions_stream: {
      __type: '[permissions!]!',
      __args: {
        batch_size: 'Int!',
        cursor: '[permissions_stream_cursor_input]!',
        where: 'permissions_bool_exp',
      },
    },
    relation: { __type: 'relations', __args: { id: 'uuid!' } },
    relations: {
      __type: '[relations!]!',
      __args: {
        distinct_on: '[relations_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[relations_order_by!]',
        where: 'relations_bool_exp',
      },
    },
    relationsAggregate: {
      __type: 'relations_aggregate!',
      __args: {
        distinct_on: '[relations_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[relations_order_by!]',
        where: 'relations_bool_exp',
      },
    },
    relations_stream: {
      __type: '[relations!]!',
      __args: {
        batch_size: 'Int!',
        cursor: '[relations_stream_cursor_input]!',
        where: 'relations_bool_exp',
      },
    },
    user: { __type: 'users', __args: { id: 'uuid!' } },
    users: {
      __type: '[users!]!',
      __args: {
        distinct_on: '[users_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[users_order_by!]',
        where: 'users_bool_exp',
      },
    },
    usersAggregate: {
      __type: 'users_aggregate!',
      __args: {
        distinct_on: '[users_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[users_order_by!]',
        where: 'users_bool_exp',
      },
    },
    users_stream: {
      __type: '[users!]!',
      __args: {
        batch_size: 'Int!',
        cursor: '[users_stream_cursor_input]!',
        where: 'users_bool_exp',
      },
    },
  },
  timestamptz_comparison_exp: {
    _eq: { __type: 'timestamptz' },
    _gt: { __type: 'timestamptz' },
    _gte: { __type: 'timestamptz' },
    _in: { __type: '[timestamptz!]' },
    _is_null: { __type: 'Boolean' },
    _lt: { __type: 'timestamptz' },
    _lte: { __type: 'timestamptz' },
    _neq: { __type: 'timestamptz' },
    _nin: { __type: '[timestamptz!]' },
  },
  users: {
    __typename: { __type: 'String!' },
    activeMfaType: { __type: 'String' },
    avatarUrl: { __type: 'String!' },
    createdAt: { __type: 'timestamptz!' },
    currentChallenge: { __type: 'String' },
    defaultRole: { __type: 'String!' },
    defaultRoleByRole: { __type: 'authRoles!' },
    disabled: { __type: 'Boolean!' },
    displayName: { __type: 'String!' },
    email: { __type: 'citext' },
    emailVerified: { __type: 'Boolean!' },
    id: { __type: 'uuid!' },
    isAnonymous: { __type: 'Boolean!' },
    lastSeen: { __type: 'timestamptz' },
    locale: { __type: 'String!' },
    memberships: {
      __type: '[members!]!',
      __args: {
        distinct_on: '[members_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[members_order_by!]',
        where: 'members_bool_exp',
      },
    },
    memberships_aggregate: {
      __type: 'members_aggregate!',
      __args: {
        distinct_on: '[members_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[members_order_by!]',
        where: 'members_bool_exp',
      },
    },
    metadata: { __type: 'jsonb', __args: { path: 'String' } },
    newEmail: { __type: 'citext' },
    otpHash: { __type: 'String' },
    otpHashExpiresAt: { __type: 'timestamptz!' },
    otpMethodLastUsed: { __type: 'String' },
    passwordHash: { __type: 'String' },
    phoneNumber: { __type: 'String' },
    phoneNumberVerified: { __type: 'Boolean!' },
    refreshTokens: {
      __type: '[authRefreshTokens!]!',
      __args: {
        distinct_on: '[authRefreshTokens_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[authRefreshTokens_order_by!]',
        where: 'authRefreshTokens_bool_exp',
      },
    },
    refreshTokens_aggregate: {
      __type: 'authRefreshTokens_aggregate!',
      __args: {
        distinct_on: '[authRefreshTokens_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[authRefreshTokens_order_by!]',
        where: 'authRefreshTokens_bool_exp',
      },
    },
    roles: {
      __type: '[authUserRoles!]!',
      __args: {
        distinct_on: '[authUserRoles_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[authUserRoles_order_by!]',
        where: 'authUserRoles_bool_exp',
      },
    },
    roles_aggregate: {
      __type: 'authUserRoles_aggregate!',
      __args: {
        distinct_on: '[authUserRoles_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[authUserRoles_order_by!]',
        where: 'authUserRoles_bool_exp',
      },
    },
    securityKeys: {
      __type: '[authUserSecurityKeys!]!',
      __args: {
        distinct_on: '[authUserSecurityKeys_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[authUserSecurityKeys_order_by!]',
        where: 'authUserSecurityKeys_bool_exp',
      },
    },
    securityKeys_aggregate: {
      __type: 'authUserSecurityKeys_aggregate!',
      __args: {
        distinct_on: '[authUserSecurityKeys_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[authUserSecurityKeys_order_by!]',
        where: 'authUserSecurityKeys_bool_exp',
      },
    },
    ticket: { __type: 'String' },
    ticketExpiresAt: { __type: 'timestamptz!' },
    totpSecret: { __type: 'String' },
    updatedAt: { __type: 'timestamptz!' },
    userProviders: {
      __type: '[authUserProviders!]!',
      __args: {
        distinct_on: '[authUserProviders_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[authUserProviders_order_by!]',
        where: 'authUserProviders_bool_exp',
      },
    },
    userProviders_aggregate: {
      __type: 'authUserProviders_aggregate!',
      __args: {
        distinct_on: '[authUserProviders_select_column!]',
        limit: 'Int',
        offset: 'Int',
        order_by: '[authUserProviders_order_by!]',
        where: 'authUserProviders_bool_exp',
      },
    },
  },
  users_aggregate: {
    __typename: { __type: 'String!' },
    aggregate: { __type: 'users_aggregate_fields' },
    nodes: { __type: '[users!]!' },
  },
  users_aggregate_bool_exp: {
    bool_and: { __type: 'users_aggregate_bool_exp_bool_and' },
    bool_or: { __type: 'users_aggregate_bool_exp_bool_or' },
    count: { __type: 'users_aggregate_bool_exp_count' },
  },
  users_aggregate_bool_exp_bool_and: {
    arguments: {
      __type:
        'users_select_column_users_aggregate_bool_exp_bool_and_arguments_columns!',
    },
    distinct: { __type: 'Boolean' },
    filter: { __type: 'users_bool_exp' },
    predicate: { __type: 'Boolean_comparison_exp!' },
  },
  users_aggregate_bool_exp_bool_or: {
    arguments: {
      __type:
        'users_select_column_users_aggregate_bool_exp_bool_or_arguments_columns!',
    },
    distinct: { __type: 'Boolean' },
    filter: { __type: 'users_bool_exp' },
    predicate: { __type: 'Boolean_comparison_exp!' },
  },
  users_aggregate_bool_exp_count: {
    arguments: { __type: '[users_select_column!]' },
    distinct: { __type: 'Boolean' },
    filter: { __type: 'users_bool_exp' },
    predicate: { __type: 'Int_comparison_exp!' },
  },
  users_aggregate_fields: {
    __typename: { __type: 'String!' },
    count: {
      __type: 'Int!',
      __args: { columns: '[users_select_column!]', distinct: 'Boolean' },
    },
    max: { __type: 'users_max_fields' },
    min: { __type: 'users_min_fields' },
  },
  users_aggregate_order_by: {
    count: { __type: 'order_by' },
    max: { __type: 'users_max_order_by' },
    min: { __type: 'users_min_order_by' },
  },
  users_append_input: { metadata: { __type: 'jsonb' } },
  users_arr_rel_insert_input: {
    data: { __type: '[users_insert_input!]!' },
    on_conflict: { __type: 'users_on_conflict' },
  },
  users_bool_exp: {
    _and: { __type: '[users_bool_exp!]' },
    _not: { __type: 'users_bool_exp' },
    _or: { __type: '[users_bool_exp!]' },
    activeMfaType: { __type: 'String_comparison_exp' },
    avatarUrl: { __type: 'String_comparison_exp' },
    createdAt: { __type: 'timestamptz_comparison_exp' },
    currentChallenge: { __type: 'String_comparison_exp' },
    defaultRole: { __type: 'String_comparison_exp' },
    defaultRoleByRole: { __type: 'authRoles_bool_exp' },
    disabled: { __type: 'Boolean_comparison_exp' },
    displayName: { __type: 'String_comparison_exp' },
    email: { __type: 'citext_comparison_exp' },
    emailVerified: { __type: 'Boolean_comparison_exp' },
    id: { __type: 'uuid_comparison_exp' },
    isAnonymous: { __type: 'Boolean_comparison_exp' },
    lastSeen: { __type: 'timestamptz_comparison_exp' },
    locale: { __type: 'String_comparison_exp' },
    memberships: { __type: 'members_bool_exp' },
    memberships_aggregate: { __type: 'members_aggregate_bool_exp' },
    metadata: { __type: 'jsonb_comparison_exp' },
    newEmail: { __type: 'citext_comparison_exp' },
    otpHash: { __type: 'String_comparison_exp' },
    otpHashExpiresAt: { __type: 'timestamptz_comparison_exp' },
    otpMethodLastUsed: { __type: 'String_comparison_exp' },
    passwordHash: { __type: 'String_comparison_exp' },
    phoneNumber: { __type: 'String_comparison_exp' },
    phoneNumberVerified: { __type: 'Boolean_comparison_exp' },
    refreshTokens: { __type: 'authRefreshTokens_bool_exp' },
    refreshTokens_aggregate: { __type: 'authRefreshTokens_aggregate_bool_exp' },
    roles: { __type: 'authUserRoles_bool_exp' },
    roles_aggregate: { __type: 'authUserRoles_aggregate_bool_exp' },
    securityKeys: { __type: 'authUserSecurityKeys_bool_exp' },
    securityKeys_aggregate: {
      __type: 'authUserSecurityKeys_aggregate_bool_exp',
    },
    ticket: { __type: 'String_comparison_exp' },
    ticketExpiresAt: { __type: 'timestamptz_comparison_exp' },
    totpSecret: { __type: 'String_comparison_exp' },
    updatedAt: { __type: 'timestamptz_comparison_exp' },
    userProviders: { __type: 'authUserProviders_bool_exp' },
    userProviders_aggregate: { __type: 'authUserProviders_aggregate_bool_exp' },
  },
  users_delete_at_path_input: { metadata: { __type: '[String!]' } },
  users_delete_elem_input: { metadata: { __type: 'Int' } },
  users_delete_key_input: { metadata: { __type: 'String' } },
  users_insert_input: {
    activeMfaType: { __type: 'String' },
    avatarUrl: { __type: 'String' },
    createdAt: { __type: 'timestamptz' },
    currentChallenge: { __type: 'String' },
    defaultRole: { __type: 'String' },
    defaultRoleByRole: { __type: 'authRoles_obj_rel_insert_input' },
    disabled: { __type: 'Boolean' },
    displayName: { __type: 'String' },
    email: { __type: 'citext' },
    emailVerified: { __type: 'Boolean' },
    id: { __type: 'uuid' },
    isAnonymous: { __type: 'Boolean' },
    lastSeen: { __type: 'timestamptz' },
    locale: { __type: 'String' },
    memberships: { __type: 'members_arr_rel_insert_input' },
    metadata: { __type: 'jsonb' },
    newEmail: { __type: 'citext' },
    otpHash: { __type: 'String' },
    otpHashExpiresAt: { __type: 'timestamptz' },
    otpMethodLastUsed: { __type: 'String' },
    passwordHash: { __type: 'String' },
    phoneNumber: { __type: 'String' },
    phoneNumberVerified: { __type: 'Boolean' },
    refreshTokens: { __type: 'authRefreshTokens_arr_rel_insert_input' },
    roles: { __type: 'authUserRoles_arr_rel_insert_input' },
    securityKeys: { __type: 'authUserSecurityKeys_arr_rel_insert_input' },
    ticket: { __type: 'String' },
    ticketExpiresAt: { __type: 'timestamptz' },
    totpSecret: { __type: 'String' },
    updatedAt: { __type: 'timestamptz' },
    userProviders: { __type: 'authUserProviders_arr_rel_insert_input' },
  },
  users_max_fields: {
    __typename: { __type: 'String!' },
    activeMfaType: { __type: 'String' },
    avatarUrl: { __type: 'String' },
    createdAt: { __type: 'timestamptz' },
    currentChallenge: { __type: 'String' },
    defaultRole: { __type: 'String' },
    displayName: { __type: 'String' },
    email: { __type: 'citext' },
    id: { __type: 'uuid' },
    lastSeen: { __type: 'timestamptz' },
    locale: { __type: 'String' },
    newEmail: { __type: 'citext' },
    otpHash: { __type: 'String' },
    otpHashExpiresAt: { __type: 'timestamptz' },
    otpMethodLastUsed: { __type: 'String' },
    passwordHash: { __type: 'String' },
    phoneNumber: { __type: 'String' },
    ticket: { __type: 'String' },
    ticketExpiresAt: { __type: 'timestamptz' },
    totpSecret: { __type: 'String' },
    updatedAt: { __type: 'timestamptz' },
  },
  users_max_order_by: {
    activeMfaType: { __type: 'order_by' },
    avatarUrl: { __type: 'order_by' },
    createdAt: { __type: 'order_by' },
    currentChallenge: { __type: 'order_by' },
    defaultRole: { __type: 'order_by' },
    displayName: { __type: 'order_by' },
    email: { __type: 'order_by' },
    id: { __type: 'order_by' },
    lastSeen: { __type: 'order_by' },
    locale: { __type: 'order_by' },
    newEmail: { __type: 'order_by' },
    otpHash: { __type: 'order_by' },
    otpHashExpiresAt: { __type: 'order_by' },
    otpMethodLastUsed: { __type: 'order_by' },
    passwordHash: { __type: 'order_by' },
    phoneNumber: { __type: 'order_by' },
    ticket: { __type: 'order_by' },
    ticketExpiresAt: { __type: 'order_by' },
    totpSecret: { __type: 'order_by' },
    updatedAt: { __type: 'order_by' },
  },
  users_min_fields: {
    __typename: { __type: 'String!' },
    activeMfaType: { __type: 'String' },
    avatarUrl: { __type: 'String' },
    createdAt: { __type: 'timestamptz' },
    currentChallenge: { __type: 'String' },
    defaultRole: { __type: 'String' },
    displayName: { __type: 'String' },
    email: { __type: 'citext' },
    id: { __type: 'uuid' },
    lastSeen: { __type: 'timestamptz' },
    locale: { __type: 'String' },
    newEmail: { __type: 'citext' },
    otpHash: { __type: 'String' },
    otpHashExpiresAt: { __type: 'timestamptz' },
    otpMethodLastUsed: { __type: 'String' },
    passwordHash: { __type: 'String' },
    phoneNumber: { __type: 'String' },
    ticket: { __type: 'String' },
    ticketExpiresAt: { __type: 'timestamptz' },
    totpSecret: { __type: 'String' },
    updatedAt: { __type: 'timestamptz' },
  },
  users_min_order_by: {
    activeMfaType: { __type: 'order_by' },
    avatarUrl: { __type: 'order_by' },
    createdAt: { __type: 'order_by' },
    currentChallenge: { __type: 'order_by' },
    defaultRole: { __type: 'order_by' },
    displayName: { __type: 'order_by' },
    email: { __type: 'order_by' },
    id: { __type: 'order_by' },
    lastSeen: { __type: 'order_by' },
    locale: { __type: 'order_by' },
    newEmail: { __type: 'order_by' },
    otpHash: { __type: 'order_by' },
    otpHashExpiresAt: { __type: 'order_by' },
    otpMethodLastUsed: { __type: 'order_by' },
    passwordHash: { __type: 'order_by' },
    phoneNumber: { __type: 'order_by' },
    ticket: { __type: 'order_by' },
    ticketExpiresAt: { __type: 'order_by' },
    totpSecret: { __type: 'order_by' },
    updatedAt: { __type: 'order_by' },
  },
  users_mutation_response: {
    __typename: { __type: 'String!' },
    affected_rows: { __type: 'Int!' },
    returning: { __type: '[users!]!' },
  },
  users_obj_rel_insert_input: {
    data: { __type: 'users_insert_input!' },
    on_conflict: { __type: 'users_on_conflict' },
  },
  users_on_conflict: {
    constraint: { __type: 'users_constraint!' },
    update_columns: { __type: '[users_update_column!]!' },
    where: { __type: 'users_bool_exp' },
  },
  users_order_by: {
    activeMfaType: { __type: 'order_by' },
    avatarUrl: { __type: 'order_by' },
    createdAt: { __type: 'order_by' },
    currentChallenge: { __type: 'order_by' },
    defaultRole: { __type: 'order_by' },
    defaultRoleByRole: { __type: 'authRoles_order_by' },
    disabled: { __type: 'order_by' },
    displayName: { __type: 'order_by' },
    email: { __type: 'order_by' },
    emailVerified: { __type: 'order_by' },
    id: { __type: 'order_by' },
    isAnonymous: { __type: 'order_by' },
    lastSeen: { __type: 'order_by' },
    locale: { __type: 'order_by' },
    memberships_aggregate: { __type: 'members_aggregate_order_by' },
    metadata: { __type: 'order_by' },
    newEmail: { __type: 'order_by' },
    otpHash: { __type: 'order_by' },
    otpHashExpiresAt: { __type: 'order_by' },
    otpMethodLastUsed: { __type: 'order_by' },
    passwordHash: { __type: 'order_by' },
    phoneNumber: { __type: 'order_by' },
    phoneNumberVerified: { __type: 'order_by' },
    refreshTokens_aggregate: { __type: 'authRefreshTokens_aggregate_order_by' },
    roles_aggregate: { __type: 'authUserRoles_aggregate_order_by' },
    securityKeys_aggregate: {
      __type: 'authUserSecurityKeys_aggregate_order_by',
    },
    ticket: { __type: 'order_by' },
    ticketExpiresAt: { __type: 'order_by' },
    totpSecret: { __type: 'order_by' },
    updatedAt: { __type: 'order_by' },
    userProviders_aggregate: { __type: 'authUserProviders_aggregate_order_by' },
  },
  users_pk_columns_input: { id: { __type: 'uuid!' } },
  users_prepend_input: { metadata: { __type: 'jsonb' } },
  users_set_input: {
    activeMfaType: { __type: 'String' },
    avatarUrl: { __type: 'String' },
    createdAt: { __type: 'timestamptz' },
    currentChallenge: { __type: 'String' },
    defaultRole: { __type: 'String' },
    disabled: { __type: 'Boolean' },
    displayName: { __type: 'String' },
    email: { __type: 'citext' },
    emailVerified: { __type: 'Boolean' },
    id: { __type: 'uuid' },
    isAnonymous: { __type: 'Boolean' },
    lastSeen: { __type: 'timestamptz' },
    locale: { __type: 'String' },
    metadata: { __type: 'jsonb' },
    newEmail: { __type: 'citext' },
    otpHash: { __type: 'String' },
    otpHashExpiresAt: { __type: 'timestamptz' },
    otpMethodLastUsed: { __type: 'String' },
    passwordHash: { __type: 'String' },
    phoneNumber: { __type: 'String' },
    phoneNumberVerified: { __type: 'Boolean' },
    ticket: { __type: 'String' },
    ticketExpiresAt: { __type: 'timestamptz' },
    totpSecret: { __type: 'String' },
    updatedAt: { __type: 'timestamptz' },
  },
  users_stream_cursor_input: {
    initial_value: { __type: 'users_stream_cursor_value_input!' },
    ordering: { __type: 'cursor_ordering' },
  },
  users_stream_cursor_value_input: {
    activeMfaType: { __type: 'String' },
    avatarUrl: { __type: 'String' },
    createdAt: { __type: 'timestamptz' },
    currentChallenge: { __type: 'String' },
    defaultRole: { __type: 'String' },
    disabled: { __type: 'Boolean' },
    displayName: { __type: 'String' },
    email: { __type: 'citext' },
    emailVerified: { __type: 'Boolean' },
    id: { __type: 'uuid' },
    isAnonymous: { __type: 'Boolean' },
    lastSeen: { __type: 'timestamptz' },
    locale: { __type: 'String' },
    metadata: { __type: 'jsonb' },
    newEmail: { __type: 'citext' },
    otpHash: { __type: 'String' },
    otpHashExpiresAt: { __type: 'timestamptz' },
    otpMethodLastUsed: { __type: 'String' },
    passwordHash: { __type: 'String' },
    phoneNumber: { __type: 'String' },
    phoneNumberVerified: { __type: 'Boolean' },
    ticket: { __type: 'String' },
    ticketExpiresAt: { __type: 'timestamptz' },
    totpSecret: { __type: 'String' },
    updatedAt: { __type: 'timestamptz' },
  },
  users_updates: {
    _append: { __type: 'users_append_input' },
    _delete_at_path: { __type: 'users_delete_at_path_input' },
    _delete_elem: { __type: 'users_delete_elem_input' },
    _delete_key: { __type: 'users_delete_key_input' },
    _prepend: { __type: 'users_prepend_input' },
    _set: { __type: 'users_set_input' },
    where: { __type: 'users_bool_exp!' },
  },
  uuid_comparison_exp: {
    _eq: { __type: 'uuid' },
    _gt: { __type: 'uuid' },
    _gte: { __type: 'uuid' },
    _in: { __type: '[uuid!]' },
    _is_null: { __type: 'Boolean' },
    _lt: { __type: 'uuid' },
    _lte: { __type: 'uuid' },
    _neq: { __type: 'uuid' },
    _nin: { __type: '[uuid!]' },
  },
} as const;

/**
 * Oauth requests, inserted before redirecting to the provider's site. Don't modify its structure as Hasura Auth relies on it to function properly.
 */
export interface authProviderRequests {
  __typename?: 'authProviderRequests';
  id: ScalarsEnums['uuid'];
  options: (args?: {
    /**
     * JSON select path
     */
    path?: Maybe<Scalars['String']>;
  }) => Maybe<ScalarsEnums['jsonb']>;
}

/**
 * aggregated selection of "auth.provider_requests"
 */
export interface authProviderRequests_aggregate {
  __typename?: 'authProviderRequests_aggregate';
  aggregate?: Maybe<authProviderRequests_aggregate_fields>;
  nodes: Array<authProviderRequests>;
}

/**
 * aggregate fields of "auth.provider_requests"
 */
export interface authProviderRequests_aggregate_fields {
  __typename?: 'authProviderRequests_aggregate_fields';
  count: (args?: {
    columns?: Maybe<Array<authProviderRequests_select_column>>;
    distinct?: Maybe<Scalars['Boolean']>;
  }) => ScalarsEnums['Int'];
  max?: Maybe<authProviderRequests_max_fields>;
  min?: Maybe<authProviderRequests_min_fields>;
}

/**
 * aggregate max on columns
 */
export interface authProviderRequests_max_fields {
  __typename?: 'authProviderRequests_max_fields';
  id?: Maybe<ScalarsEnums['uuid']>;
}

/**
 * aggregate min on columns
 */
export interface authProviderRequests_min_fields {
  __typename?: 'authProviderRequests_min_fields';
  id?: Maybe<ScalarsEnums['uuid']>;
}

/**
 * response of any mutation on the table "auth.provider_requests"
 */
export interface authProviderRequests_mutation_response {
  __typename?: 'authProviderRequests_mutation_response';
  /**
   * number of rows affected by the mutation
   */
  affected_rows: ScalarsEnums['Int'];
  /**
   * data from the rows affected by the mutation
   */
  returning: Array<authProviderRequests>;
}

/**
 * List of available Oauth providers. Don't modify its structure as Hasura Auth relies on it to function properly.
 */
export interface authProviders {
  __typename?: 'authProviders';
  id: ScalarsEnums['String'];
  /**
   * An array relationship
   */
  userProviders: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<authUserProviders_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars['Int']>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars['Int']>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<authUserProviders_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<authUserProviders_bool_exp>;
  }) => Array<authUserProviders>;
  /**
   * An aggregate relationship
   */
  userProviders_aggregate: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<authUserProviders_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars['Int']>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars['Int']>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<authUserProviders_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<authUserProviders_bool_exp>;
  }) => authUserProviders_aggregate;
}

/**
 * aggregated selection of "auth.providers"
 */
export interface authProviders_aggregate {
  __typename?: 'authProviders_aggregate';
  aggregate?: Maybe<authProviders_aggregate_fields>;
  nodes: Array<authProviders>;
}

/**
 * aggregate fields of "auth.providers"
 */
export interface authProviders_aggregate_fields {
  __typename?: 'authProviders_aggregate_fields';
  count: (args?: {
    columns?: Maybe<Array<authProviders_select_column>>;
    distinct?: Maybe<Scalars['Boolean']>;
  }) => ScalarsEnums['Int'];
  max?: Maybe<authProviders_max_fields>;
  min?: Maybe<authProviders_min_fields>;
}

/**
 * aggregate max on columns
 */
export interface authProviders_max_fields {
  __typename?: 'authProviders_max_fields';
  id?: Maybe<ScalarsEnums['String']>;
}

/**
 * aggregate min on columns
 */
export interface authProviders_min_fields {
  __typename?: 'authProviders_min_fields';
  id?: Maybe<ScalarsEnums['String']>;
}

/**
 * response of any mutation on the table "auth.providers"
 */
export interface authProviders_mutation_response {
  __typename?: 'authProviders_mutation_response';
  /**
   * number of rows affected by the mutation
   */
  affected_rows: ScalarsEnums['Int'];
  /**
   * data from the rows affected by the mutation
   */
  returning: Array<authProviders>;
}

/**
 * User refresh tokens. Hasura auth uses them to rotate new access tokens as long as the refresh token is not expired. Don't modify its structure as Hasura Auth relies on it to function properly.
 */
export interface authRefreshTokens {
  __typename?: 'authRefreshTokens';
  createdAt: ScalarsEnums['timestamptz'];
  expiresAt: ScalarsEnums['timestamptz'];
  /**
   * DEPRECATED: auto-generated refresh token id. Will be replaced by a genereric id column that will be used as a primary key, not the refresh token itself. Use refresh_token_hash instead.
   */
  refreshToken: ScalarsEnums['uuid'];
  refreshTokenHash?: Maybe<ScalarsEnums['String']>;
  /**
   * An object relationship
   */
  user: users;
  userId: ScalarsEnums['uuid'];
}

/**
 * aggregated selection of "auth.refresh_tokens"
 */
export interface authRefreshTokens_aggregate {
  __typename?: 'authRefreshTokens_aggregate';
  aggregate?: Maybe<authRefreshTokens_aggregate_fields>;
  nodes: Array<authRefreshTokens>;
}

/**
 * aggregate fields of "auth.refresh_tokens"
 */
export interface authRefreshTokens_aggregate_fields {
  __typename?: 'authRefreshTokens_aggregate_fields';
  count: (args?: {
    columns?: Maybe<Array<authRefreshTokens_select_column>>;
    distinct?: Maybe<Scalars['Boolean']>;
  }) => ScalarsEnums['Int'];
  max?: Maybe<authRefreshTokens_max_fields>;
  min?: Maybe<authRefreshTokens_min_fields>;
}

/**
 * aggregate max on columns
 */
export interface authRefreshTokens_max_fields {
  __typename?: 'authRefreshTokens_max_fields';
  createdAt?: Maybe<ScalarsEnums['timestamptz']>;
  expiresAt?: Maybe<ScalarsEnums['timestamptz']>;
  /**
   * DEPRECATED: auto-generated refresh token id. Will be replaced by a genereric id column that will be used as a primary key, not the refresh token itself. Use refresh_token_hash instead.
   */
  refreshToken?: Maybe<ScalarsEnums['uuid']>;
  refreshTokenHash?: Maybe<ScalarsEnums['String']>;
  userId?: Maybe<ScalarsEnums['uuid']>;
}

/**
 * aggregate min on columns
 */
export interface authRefreshTokens_min_fields {
  __typename?: 'authRefreshTokens_min_fields';
  createdAt?: Maybe<ScalarsEnums['timestamptz']>;
  expiresAt?: Maybe<ScalarsEnums['timestamptz']>;
  /**
   * DEPRECATED: auto-generated refresh token id. Will be replaced by a genereric id column that will be used as a primary key, not the refresh token itself. Use refresh_token_hash instead.
   */
  refreshToken?: Maybe<ScalarsEnums['uuid']>;
  refreshTokenHash?: Maybe<ScalarsEnums['String']>;
  userId?: Maybe<ScalarsEnums['uuid']>;
}

/**
 * response of any mutation on the table "auth.refresh_tokens"
 */
export interface authRefreshTokens_mutation_response {
  __typename?: 'authRefreshTokens_mutation_response';
  /**
   * number of rows affected by the mutation
   */
  affected_rows: ScalarsEnums['Int'];
  /**
   * data from the rows affected by the mutation
   */
  returning: Array<authRefreshTokens>;
}

/**
 * Persistent Hasura roles for users. Don't modify its structure as Hasura Auth relies on it to function properly.
 */
export interface authRoles {
  __typename?: 'authRoles';
  role: ScalarsEnums['String'];
  /**
   * An array relationship
   */
  userRoles: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<authUserRoles_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars['Int']>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars['Int']>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<authUserRoles_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<authUserRoles_bool_exp>;
  }) => Array<authUserRoles>;
  /**
   * An aggregate relationship
   */
  userRoles_aggregate: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<authUserRoles_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars['Int']>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars['Int']>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<authUserRoles_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<authUserRoles_bool_exp>;
  }) => authUserRoles_aggregate;
  /**
   * An array relationship
   */
  usersByDefaultRole: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<users_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars['Int']>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars['Int']>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<users_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<users_bool_exp>;
  }) => Array<users>;
  /**
   * An aggregate relationship
   */
  usersByDefaultRole_aggregate: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<users_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars['Int']>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars['Int']>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<users_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<users_bool_exp>;
  }) => users_aggregate;
}

/**
 * aggregated selection of "auth.roles"
 */
export interface authRoles_aggregate {
  __typename?: 'authRoles_aggregate';
  aggregate?: Maybe<authRoles_aggregate_fields>;
  nodes: Array<authRoles>;
}

/**
 * aggregate fields of "auth.roles"
 */
export interface authRoles_aggregate_fields {
  __typename?: 'authRoles_aggregate_fields';
  count: (args?: {
    columns?: Maybe<Array<authRoles_select_column>>;
    distinct?: Maybe<Scalars['Boolean']>;
  }) => ScalarsEnums['Int'];
  max?: Maybe<authRoles_max_fields>;
  min?: Maybe<authRoles_min_fields>;
}

/**
 * aggregate max on columns
 */
export interface authRoles_max_fields {
  __typename?: 'authRoles_max_fields';
  role?: Maybe<ScalarsEnums['String']>;
}

/**
 * aggregate min on columns
 */
export interface authRoles_min_fields {
  __typename?: 'authRoles_min_fields';
  role?: Maybe<ScalarsEnums['String']>;
}

/**
 * response of any mutation on the table "auth.roles"
 */
export interface authRoles_mutation_response {
  __typename?: 'authRoles_mutation_response';
  /**
   * number of rows affected by the mutation
   */
  affected_rows: ScalarsEnums['Int'];
  /**
   * data from the rows affected by the mutation
   */
  returning: Array<authRoles>;
}

/**
 * Active providers for a given user. Don't modify its structure as Hasura Auth relies on it to function properly.
 */
export interface authUserProviders {
  __typename?: 'authUserProviders';
  accessToken: ScalarsEnums['String'];
  createdAt: ScalarsEnums['timestamptz'];
  id: ScalarsEnums['uuid'];
  /**
   * An object relationship
   */
  provider: authProviders;
  providerId: ScalarsEnums['String'];
  providerUserId: ScalarsEnums['String'];
  refreshToken?: Maybe<ScalarsEnums['String']>;
  updatedAt: ScalarsEnums['timestamptz'];
  /**
   * An object relationship
   */
  user: users;
  userId: ScalarsEnums['uuid'];
}

/**
 * aggregated selection of "auth.user_providers"
 */
export interface authUserProviders_aggregate {
  __typename?: 'authUserProviders_aggregate';
  aggregate?: Maybe<authUserProviders_aggregate_fields>;
  nodes: Array<authUserProviders>;
}

/**
 * aggregate fields of "auth.user_providers"
 */
export interface authUserProviders_aggregate_fields {
  __typename?: 'authUserProviders_aggregate_fields';
  count: (args?: {
    columns?: Maybe<Array<authUserProviders_select_column>>;
    distinct?: Maybe<Scalars['Boolean']>;
  }) => ScalarsEnums['Int'];
  max?: Maybe<authUserProviders_max_fields>;
  min?: Maybe<authUserProviders_min_fields>;
}

/**
 * aggregate max on columns
 */
export interface authUserProviders_max_fields {
  __typename?: 'authUserProviders_max_fields';
  accessToken?: Maybe<ScalarsEnums['String']>;
  createdAt?: Maybe<ScalarsEnums['timestamptz']>;
  id?: Maybe<ScalarsEnums['uuid']>;
  providerId?: Maybe<ScalarsEnums['String']>;
  providerUserId?: Maybe<ScalarsEnums['String']>;
  refreshToken?: Maybe<ScalarsEnums['String']>;
  updatedAt?: Maybe<ScalarsEnums['timestamptz']>;
  userId?: Maybe<ScalarsEnums['uuid']>;
}

/**
 * aggregate min on columns
 */
export interface authUserProviders_min_fields {
  __typename?: 'authUserProviders_min_fields';
  accessToken?: Maybe<ScalarsEnums['String']>;
  createdAt?: Maybe<ScalarsEnums['timestamptz']>;
  id?: Maybe<ScalarsEnums['uuid']>;
  providerId?: Maybe<ScalarsEnums['String']>;
  providerUserId?: Maybe<ScalarsEnums['String']>;
  refreshToken?: Maybe<ScalarsEnums['String']>;
  updatedAt?: Maybe<ScalarsEnums['timestamptz']>;
  userId?: Maybe<ScalarsEnums['uuid']>;
}

/**
 * response of any mutation on the table "auth.user_providers"
 */
export interface authUserProviders_mutation_response {
  __typename?: 'authUserProviders_mutation_response';
  /**
   * number of rows affected by the mutation
   */
  affected_rows: ScalarsEnums['Int'];
  /**
   * data from the rows affected by the mutation
   */
  returning: Array<authUserProviders>;
}

/**
 * Roles of users. Don't modify its structure as Hasura Auth relies on it to function properly.
 */
export interface authUserRoles {
  __typename?: 'authUserRoles';
  createdAt: ScalarsEnums['timestamptz'];
  id: ScalarsEnums['uuid'];
  role: ScalarsEnums['String'];
  /**
   * An object relationship
   */
  roleByRole: authRoles;
  /**
   * An object relationship
   */
  user: users;
  userId: ScalarsEnums['uuid'];
}

/**
 * aggregated selection of "auth.user_roles"
 */
export interface authUserRoles_aggregate {
  __typename?: 'authUserRoles_aggregate';
  aggregate?: Maybe<authUserRoles_aggregate_fields>;
  nodes: Array<authUserRoles>;
}

/**
 * aggregate fields of "auth.user_roles"
 */
export interface authUserRoles_aggregate_fields {
  __typename?: 'authUserRoles_aggregate_fields';
  count: (args?: {
    columns?: Maybe<Array<authUserRoles_select_column>>;
    distinct?: Maybe<Scalars['Boolean']>;
  }) => ScalarsEnums['Int'];
  max?: Maybe<authUserRoles_max_fields>;
  min?: Maybe<authUserRoles_min_fields>;
}

/**
 * aggregate max on columns
 */
export interface authUserRoles_max_fields {
  __typename?: 'authUserRoles_max_fields';
  createdAt?: Maybe<ScalarsEnums['timestamptz']>;
  id?: Maybe<ScalarsEnums['uuid']>;
  role?: Maybe<ScalarsEnums['String']>;
  userId?: Maybe<ScalarsEnums['uuid']>;
}

/**
 * aggregate min on columns
 */
export interface authUserRoles_min_fields {
  __typename?: 'authUserRoles_min_fields';
  createdAt?: Maybe<ScalarsEnums['timestamptz']>;
  id?: Maybe<ScalarsEnums['uuid']>;
  role?: Maybe<ScalarsEnums['String']>;
  userId?: Maybe<ScalarsEnums['uuid']>;
}

/**
 * response of any mutation on the table "auth.user_roles"
 */
export interface authUserRoles_mutation_response {
  __typename?: 'authUserRoles_mutation_response';
  /**
   * number of rows affected by the mutation
   */
  affected_rows: ScalarsEnums['Int'];
  /**
   * data from the rows affected by the mutation
   */
  returning: Array<authUserRoles>;
}

/**
 * User webauthn security keys. Don't modify its structure as Hasura Auth relies on it to function properly.
 */
export interface authUserSecurityKeys {
  __typename?: 'authUserSecurityKeys';
  counter: ScalarsEnums['bigint'];
  credentialId: ScalarsEnums['String'];
  credentialPublicKey?: Maybe<ScalarsEnums['bytea']>;
  id: ScalarsEnums['uuid'];
  nickname?: Maybe<ScalarsEnums['String']>;
  transports: ScalarsEnums['String'];
  /**
   * An object relationship
   */
  user: users;
  userId: ScalarsEnums['uuid'];
}

/**
 * aggregated selection of "auth.user_security_keys"
 */
export interface authUserSecurityKeys_aggregate {
  __typename?: 'authUserSecurityKeys_aggregate';
  aggregate?: Maybe<authUserSecurityKeys_aggregate_fields>;
  nodes: Array<authUserSecurityKeys>;
}

/**
 * aggregate fields of "auth.user_security_keys"
 */
export interface authUserSecurityKeys_aggregate_fields {
  __typename?: 'authUserSecurityKeys_aggregate_fields';
  avg?: Maybe<authUserSecurityKeys_avg_fields>;
  count: (args?: {
    columns?: Maybe<Array<authUserSecurityKeys_select_column>>;
    distinct?: Maybe<Scalars['Boolean']>;
  }) => ScalarsEnums['Int'];
  max?: Maybe<authUserSecurityKeys_max_fields>;
  min?: Maybe<authUserSecurityKeys_min_fields>;
  stddev?: Maybe<authUserSecurityKeys_stddev_fields>;
  stddev_pop?: Maybe<authUserSecurityKeys_stddev_pop_fields>;
  stddev_samp?: Maybe<authUserSecurityKeys_stddev_samp_fields>;
  sum?: Maybe<authUserSecurityKeys_sum_fields>;
  var_pop?: Maybe<authUserSecurityKeys_var_pop_fields>;
  var_samp?: Maybe<authUserSecurityKeys_var_samp_fields>;
  variance?: Maybe<authUserSecurityKeys_variance_fields>;
}

/**
 * aggregate avg on columns
 */
export interface authUserSecurityKeys_avg_fields {
  __typename?: 'authUserSecurityKeys_avg_fields';
  counter?: Maybe<ScalarsEnums['Float']>;
}

/**
 * aggregate max on columns
 */
export interface authUserSecurityKeys_max_fields {
  __typename?: 'authUserSecurityKeys_max_fields';
  counter?: Maybe<ScalarsEnums['bigint']>;
  credentialId?: Maybe<ScalarsEnums['String']>;
  id?: Maybe<ScalarsEnums['uuid']>;
  nickname?: Maybe<ScalarsEnums['String']>;
  transports?: Maybe<ScalarsEnums['String']>;
  userId?: Maybe<ScalarsEnums['uuid']>;
}

/**
 * aggregate min on columns
 */
export interface authUserSecurityKeys_min_fields {
  __typename?: 'authUserSecurityKeys_min_fields';
  counter?: Maybe<ScalarsEnums['bigint']>;
  credentialId?: Maybe<ScalarsEnums['String']>;
  id?: Maybe<ScalarsEnums['uuid']>;
  nickname?: Maybe<ScalarsEnums['String']>;
  transports?: Maybe<ScalarsEnums['String']>;
  userId?: Maybe<ScalarsEnums['uuid']>;
}

/**
 * response of any mutation on the table "auth.user_security_keys"
 */
export interface authUserSecurityKeys_mutation_response {
  __typename?: 'authUserSecurityKeys_mutation_response';
  /**
   * number of rows affected by the mutation
   */
  affected_rows: ScalarsEnums['Int'];
  /**
   * data from the rows affected by the mutation
   */
  returning: Array<authUserSecurityKeys>;
}

/**
 * aggregate stddev on columns
 */
export interface authUserSecurityKeys_stddev_fields {
  __typename?: 'authUserSecurityKeys_stddev_fields';
  counter?: Maybe<ScalarsEnums['Float']>;
}

/**
 * aggregate stddev_pop on columns
 */
export interface authUserSecurityKeys_stddev_pop_fields {
  __typename?: 'authUserSecurityKeys_stddev_pop_fields';
  counter?: Maybe<ScalarsEnums['Float']>;
}

/**
 * aggregate stddev_samp on columns
 */
export interface authUserSecurityKeys_stddev_samp_fields {
  __typename?: 'authUserSecurityKeys_stddev_samp_fields';
  counter?: Maybe<ScalarsEnums['Float']>;
}

/**
 * aggregate sum on columns
 */
export interface authUserSecurityKeys_sum_fields {
  __typename?: 'authUserSecurityKeys_sum_fields';
  counter?: Maybe<ScalarsEnums['bigint']>;
}

/**
 * aggregate var_pop on columns
 */
export interface authUserSecurityKeys_var_pop_fields {
  __typename?: 'authUserSecurityKeys_var_pop_fields';
  counter?: Maybe<ScalarsEnums['Float']>;
}

/**
 * aggregate var_samp on columns
 */
export interface authUserSecurityKeys_var_samp_fields {
  __typename?: 'authUserSecurityKeys_var_samp_fields';
  counter?: Maybe<ScalarsEnums['Float']>;
}

/**
 * aggregate variance on columns
 */
export interface authUserSecurityKeys_variance_fields {
  __typename?: 'authUserSecurityKeys_variance_fields';
  counter?: Maybe<ScalarsEnums['Float']>;
}

/**
 * columns and relationships of "storage.buckets"
 */
export interface buckets {
  __typename?: 'buckets';
  cacheControl?: Maybe<ScalarsEnums['String']>;
  createdAt: ScalarsEnums['timestamptz'];
  downloadExpiration: ScalarsEnums['Int'];
  /**
   * An array relationship
   */
  files: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<files_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars['Int']>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars['Int']>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<files_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<files_bool_exp>;
  }) => Array<files>;
  /**
   * An aggregate relationship
   */
  files_aggregate: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<files_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars['Int']>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars['Int']>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<files_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<files_bool_exp>;
  }) => files_aggregate;
  id: ScalarsEnums['String'];
  maxUploadFileSize: ScalarsEnums['Int'];
  minUploadFileSize: ScalarsEnums['Int'];
  presignedUrlsEnabled: ScalarsEnums['Boolean'];
  updatedAt: ScalarsEnums['timestamptz'];
}

/**
 * aggregated selection of "storage.buckets"
 */
export interface buckets_aggregate {
  __typename?: 'buckets_aggregate';
  aggregate?: Maybe<buckets_aggregate_fields>;
  nodes: Array<buckets>;
}

/**
 * aggregate fields of "storage.buckets"
 */
export interface buckets_aggregate_fields {
  __typename?: 'buckets_aggregate_fields';
  avg?: Maybe<buckets_avg_fields>;
  count: (args?: {
    columns?: Maybe<Array<buckets_select_column>>;
    distinct?: Maybe<Scalars['Boolean']>;
  }) => ScalarsEnums['Int'];
  max?: Maybe<buckets_max_fields>;
  min?: Maybe<buckets_min_fields>;
  stddev?: Maybe<buckets_stddev_fields>;
  stddev_pop?: Maybe<buckets_stddev_pop_fields>;
  stddev_samp?: Maybe<buckets_stddev_samp_fields>;
  sum?: Maybe<buckets_sum_fields>;
  var_pop?: Maybe<buckets_var_pop_fields>;
  var_samp?: Maybe<buckets_var_samp_fields>;
  variance?: Maybe<buckets_variance_fields>;
}

/**
 * aggregate avg on columns
 */
export interface buckets_avg_fields {
  __typename?: 'buckets_avg_fields';
  downloadExpiration?: Maybe<ScalarsEnums['Float']>;
  maxUploadFileSize?: Maybe<ScalarsEnums['Float']>;
  minUploadFileSize?: Maybe<ScalarsEnums['Float']>;
}

/**
 * aggregate max on columns
 */
export interface buckets_max_fields {
  __typename?: 'buckets_max_fields';
  cacheControl?: Maybe<ScalarsEnums['String']>;
  createdAt?: Maybe<ScalarsEnums['timestamptz']>;
  downloadExpiration?: Maybe<ScalarsEnums['Int']>;
  id?: Maybe<ScalarsEnums['String']>;
  maxUploadFileSize?: Maybe<ScalarsEnums['Int']>;
  minUploadFileSize?: Maybe<ScalarsEnums['Int']>;
  updatedAt?: Maybe<ScalarsEnums['timestamptz']>;
}

/**
 * aggregate min on columns
 */
export interface buckets_min_fields {
  __typename?: 'buckets_min_fields';
  cacheControl?: Maybe<ScalarsEnums['String']>;
  createdAt?: Maybe<ScalarsEnums['timestamptz']>;
  downloadExpiration?: Maybe<ScalarsEnums['Int']>;
  id?: Maybe<ScalarsEnums['String']>;
  maxUploadFileSize?: Maybe<ScalarsEnums['Int']>;
  minUploadFileSize?: Maybe<ScalarsEnums['Int']>;
  updatedAt?: Maybe<ScalarsEnums['timestamptz']>;
}

/**
 * response of any mutation on the table "storage.buckets"
 */
export interface buckets_mutation_response {
  __typename?: 'buckets_mutation_response';
  /**
   * number of rows affected by the mutation
   */
  affected_rows: ScalarsEnums['Int'];
  /**
   * data from the rows affected by the mutation
   */
  returning: Array<buckets>;
}

/**
 * aggregate stddev on columns
 */
export interface buckets_stddev_fields {
  __typename?: 'buckets_stddev_fields';
  downloadExpiration?: Maybe<ScalarsEnums['Float']>;
  maxUploadFileSize?: Maybe<ScalarsEnums['Float']>;
  minUploadFileSize?: Maybe<ScalarsEnums['Float']>;
}

/**
 * aggregate stddev_pop on columns
 */
export interface buckets_stddev_pop_fields {
  __typename?: 'buckets_stddev_pop_fields';
  downloadExpiration?: Maybe<ScalarsEnums['Float']>;
  maxUploadFileSize?: Maybe<ScalarsEnums['Float']>;
  minUploadFileSize?: Maybe<ScalarsEnums['Float']>;
}

/**
 * aggregate stddev_samp on columns
 */
export interface buckets_stddev_samp_fields {
  __typename?: 'buckets_stddev_samp_fields';
  downloadExpiration?: Maybe<ScalarsEnums['Float']>;
  maxUploadFileSize?: Maybe<ScalarsEnums['Float']>;
  minUploadFileSize?: Maybe<ScalarsEnums['Float']>;
}

/**
 * aggregate sum on columns
 */
export interface buckets_sum_fields {
  __typename?: 'buckets_sum_fields';
  downloadExpiration?: Maybe<ScalarsEnums['Int']>;
  maxUploadFileSize?: Maybe<ScalarsEnums['Int']>;
  minUploadFileSize?: Maybe<ScalarsEnums['Int']>;
}

/**
 * aggregate var_pop on columns
 */
export interface buckets_var_pop_fields {
  __typename?: 'buckets_var_pop_fields';
  downloadExpiration?: Maybe<ScalarsEnums['Float']>;
  maxUploadFileSize?: Maybe<ScalarsEnums['Float']>;
  minUploadFileSize?: Maybe<ScalarsEnums['Float']>;
}

/**
 * aggregate var_samp on columns
 */
export interface buckets_var_samp_fields {
  __typename?: 'buckets_var_samp_fields';
  downloadExpiration?: Maybe<ScalarsEnums['Float']>;
  maxUploadFileSize?: Maybe<ScalarsEnums['Float']>;
  minUploadFileSize?: Maybe<ScalarsEnums['Float']>;
}

/**
 * aggregate variance on columns
 */
export interface buckets_variance_fields {
  __typename?: 'buckets_variance_fields';
  downloadExpiration?: Maybe<ScalarsEnums['Float']>;
  maxUploadFileSize?: Maybe<ScalarsEnums['Float']>;
  minUploadFileSize?: Maybe<ScalarsEnums['Float']>;
}

/**
 * columns and relationships of "fields"
 */
export interface fields {
  __typename?: 'fields';
  data: (args?: {
    /**
     * JSON select path
     */
    path?: Maybe<Scalars['String']>;
  }) => Maybe<ScalarsEnums['jsonb']>;
  /**
   * A computed field, executes function "data_id"
   */
  dataId?: Maybe<ScalarsEnums['uuid']>;
  id: ScalarsEnums['uuid'];
  mime: ScalarsEnums['String'];
  name: ScalarsEnums['String'];
  /**
   * An object relationship
   */
  parent?: Maybe<nodes>;
  parentId: ScalarsEnums['uuid'];
}

/**
 * aggregated selection of "fields"
 */
export interface fields_aggregate {
  __typename?: 'fields_aggregate';
  aggregate?: Maybe<fields_aggregate_fields>;
  nodes: Array<fields>;
}

/**
 * aggregate fields of "fields"
 */
export interface fields_aggregate_fields {
  __typename?: 'fields_aggregate_fields';
  count: (args?: {
    columns?: Maybe<Array<fields_select_column>>;
    distinct?: Maybe<Scalars['Boolean']>;
  }) => ScalarsEnums['Int'];
  max?: Maybe<fields_max_fields>;
  min?: Maybe<fields_min_fields>;
}

/**
 * aggregate max on columns
 */
export interface fields_max_fields {
  __typename?: 'fields_max_fields';
  id?: Maybe<ScalarsEnums['uuid']>;
  mime?: Maybe<ScalarsEnums['String']>;
  name?: Maybe<ScalarsEnums['String']>;
  parentId?: Maybe<ScalarsEnums['uuid']>;
}

/**
 * aggregate min on columns
 */
export interface fields_min_fields {
  __typename?: 'fields_min_fields';
  id?: Maybe<ScalarsEnums['uuid']>;
  mime?: Maybe<ScalarsEnums['String']>;
  name?: Maybe<ScalarsEnums['String']>;
  parentId?: Maybe<ScalarsEnums['uuid']>;
}

/**
 * response of any mutation on the table "fields"
 */
export interface fields_mutation_response {
  __typename?: 'fields_mutation_response';
  /**
   * number of rows affected by the mutation
   */
  affected_rows: ScalarsEnums['Int'];
  /**
   * data from the rows affected by the mutation
   */
  returning: Array<fields>;
}

/**
 * columns and relationships of "storage.files"
 */
export interface files {
  __typename?: 'files';
  /**
   * An object relationship
   */
  bucket: buckets;
  bucketId: ScalarsEnums['String'];
  createdAt: ScalarsEnums['timestamptz'];
  etag?: Maybe<ScalarsEnums['String']>;
  id: ScalarsEnums['uuid'];
  isUploaded?: Maybe<ScalarsEnums['Boolean']>;
  mimeType?: Maybe<ScalarsEnums['String']>;
  name?: Maybe<ScalarsEnums['String']>;
  size?: Maybe<ScalarsEnums['Int']>;
  updatedAt: ScalarsEnums['timestamptz'];
  uploadedByUserId?: Maybe<ScalarsEnums['uuid']>;
}

/**
 * aggregated selection of "storage.files"
 */
export interface files_aggregate {
  __typename?: 'files_aggregate';
  aggregate?: Maybe<files_aggregate_fields>;
  nodes: Array<files>;
}

/**
 * aggregate fields of "storage.files"
 */
export interface files_aggregate_fields {
  __typename?: 'files_aggregate_fields';
  avg?: Maybe<files_avg_fields>;
  count: (args?: {
    columns?: Maybe<Array<files_select_column>>;
    distinct?: Maybe<Scalars['Boolean']>;
  }) => ScalarsEnums['Int'];
  max?: Maybe<files_max_fields>;
  min?: Maybe<files_min_fields>;
  stddev?: Maybe<files_stddev_fields>;
  stddev_pop?: Maybe<files_stddev_pop_fields>;
  stddev_samp?: Maybe<files_stddev_samp_fields>;
  sum?: Maybe<files_sum_fields>;
  var_pop?: Maybe<files_var_pop_fields>;
  var_samp?: Maybe<files_var_samp_fields>;
  variance?: Maybe<files_variance_fields>;
}

/**
 * aggregate avg on columns
 */
export interface files_avg_fields {
  __typename?: 'files_avg_fields';
  size?: Maybe<ScalarsEnums['Float']>;
}

/**
 * aggregate max on columns
 */
export interface files_max_fields {
  __typename?: 'files_max_fields';
  bucketId?: Maybe<ScalarsEnums['String']>;
  createdAt?: Maybe<ScalarsEnums['timestamptz']>;
  etag?: Maybe<ScalarsEnums['String']>;
  id?: Maybe<ScalarsEnums['uuid']>;
  mimeType?: Maybe<ScalarsEnums['String']>;
  name?: Maybe<ScalarsEnums['String']>;
  size?: Maybe<ScalarsEnums['Int']>;
  updatedAt?: Maybe<ScalarsEnums['timestamptz']>;
  uploadedByUserId?: Maybe<ScalarsEnums['uuid']>;
}

/**
 * aggregate min on columns
 */
export interface files_min_fields {
  __typename?: 'files_min_fields';
  bucketId?: Maybe<ScalarsEnums['String']>;
  createdAt?: Maybe<ScalarsEnums['timestamptz']>;
  etag?: Maybe<ScalarsEnums['String']>;
  id?: Maybe<ScalarsEnums['uuid']>;
  mimeType?: Maybe<ScalarsEnums['String']>;
  name?: Maybe<ScalarsEnums['String']>;
  size?: Maybe<ScalarsEnums['Int']>;
  updatedAt?: Maybe<ScalarsEnums['timestamptz']>;
  uploadedByUserId?: Maybe<ScalarsEnums['uuid']>;
}

/**
 * response of any mutation on the table "storage.files"
 */
export interface files_mutation_response {
  __typename?: 'files_mutation_response';
  /**
   * number of rows affected by the mutation
   */
  affected_rows: ScalarsEnums['Int'];
  /**
   * data from the rows affected by the mutation
   */
  returning: Array<files>;
}

/**
 * aggregate stddev on columns
 */
export interface files_stddev_fields {
  __typename?: 'files_stddev_fields';
  size?: Maybe<ScalarsEnums['Float']>;
}

/**
 * aggregate stddev_pop on columns
 */
export interface files_stddev_pop_fields {
  __typename?: 'files_stddev_pop_fields';
  size?: Maybe<ScalarsEnums['Float']>;
}

/**
 * aggregate stddev_samp on columns
 */
export interface files_stddev_samp_fields {
  __typename?: 'files_stddev_samp_fields';
  size?: Maybe<ScalarsEnums['Float']>;
}

/**
 * aggregate sum on columns
 */
export interface files_sum_fields {
  __typename?: 'files_sum_fields';
  size?: Maybe<ScalarsEnums['Int']>;
}

/**
 * aggregate var_pop on columns
 */
export interface files_var_pop_fields {
  __typename?: 'files_var_pop_fields';
  size?: Maybe<ScalarsEnums['Float']>;
}

/**
 * aggregate var_samp on columns
 */
export interface files_var_samp_fields {
  __typename?: 'files_var_samp_fields';
  size?: Maybe<ScalarsEnums['Float']>;
}

/**
 * aggregate variance on columns
 */
export interface files_variance_fields {
  __typename?: 'files_variance_fields';
  size?: Maybe<ScalarsEnums['Float']>;
}

/**
 * columns and relationships of "members"
 */
export interface members {
  __typename?: 'members';
  accepted: ScalarsEnums['Boolean'];
  active: ScalarsEnums['Boolean'];
  email?: Maybe<ScalarsEnums['String']>;
  /**
   * An object relationship
   */
  emailUser?: Maybe<users>;
  hidden: ScalarsEnums['Boolean'];
  id: ScalarsEnums['uuid'];
  name?: Maybe<ScalarsEnums['String']>;
  /**
   * An object relationship
   */
  node?: Maybe<nodes>;
  nodeId?: Maybe<ScalarsEnums['uuid']>;
  owner: ScalarsEnums['Boolean'];
  /**
   * An object relationship
   */
  parent?: Maybe<nodes>;
  parentId: ScalarsEnums['uuid'];
  /**
   * An object relationship
   */
  user?: Maybe<users>;
}

/**
 * aggregated selection of "members"
 */
export interface members_aggregate {
  __typename?: 'members_aggregate';
  aggregate?: Maybe<members_aggregate_fields>;
  nodes: Array<members>;
}

/**
 * aggregate fields of "members"
 */
export interface members_aggregate_fields {
  __typename?: 'members_aggregate_fields';
  count: (args?: {
    columns?: Maybe<Array<members_select_column>>;
    distinct?: Maybe<Scalars['Boolean']>;
  }) => ScalarsEnums['Int'];
  max?: Maybe<members_max_fields>;
  min?: Maybe<members_min_fields>;
}

/**
 * aggregate max on columns
 */
export interface members_max_fields {
  __typename?: 'members_max_fields';
  email?: Maybe<ScalarsEnums['String']>;
  id?: Maybe<ScalarsEnums['uuid']>;
  name?: Maybe<ScalarsEnums['String']>;
  nodeId?: Maybe<ScalarsEnums['uuid']>;
  parentId?: Maybe<ScalarsEnums['uuid']>;
}

/**
 * aggregate min on columns
 */
export interface members_min_fields {
  __typename?: 'members_min_fields';
  email?: Maybe<ScalarsEnums['String']>;
  id?: Maybe<ScalarsEnums['uuid']>;
  name?: Maybe<ScalarsEnums['String']>;
  nodeId?: Maybe<ScalarsEnums['uuid']>;
  parentId?: Maybe<ScalarsEnums['uuid']>;
}

/**
 * response of any mutation on the table "members"
 */
export interface members_mutation_response {
  __typename?: 'members_mutation_response';
  /**
   * number of rows affected by the mutation
   */
  affected_rows: ScalarsEnums['Int'];
  /**
   * data from the rows affected by the mutation
   */
  returning: Array<members>;
}

/**
 * columns and relationships of "mimes"
 */
export interface mimes {
  __typename?: 'mimes';
  /**
   * A computed field, executes function "children"
   */
  children: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<mimes_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars['Int']>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars['Int']>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<mimes_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<mimes_bool_exp>;
  }) => Maybe<Array<mimes>>;
  context: ScalarsEnums['Boolean'];
  hidden: ScalarsEnums['Boolean'];
  icon: ScalarsEnums['String'];
  id: ScalarsEnums['String'];
  /**
   * A computed field, executes function "parents"
   */
  parents: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<mimes_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars['Int']>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars['Int']>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<mimes_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<mimes_bool_exp>;
  }) => Maybe<Array<mimes>>;
  traits: (args?: {
    /**
     * JSON select path
     */
    path?: Maybe<Scalars['String']>;
  }) => ScalarsEnums['jsonb'];
  unique: ScalarsEnums['Boolean'];
}

/**
 * aggregated selection of "mimes"
 */
export interface mimes_aggregate {
  __typename?: 'mimes_aggregate';
  aggregate?: Maybe<mimes_aggregate_fields>;
  nodes: Array<mimes>;
}

/**
 * aggregate fields of "mimes"
 */
export interface mimes_aggregate_fields {
  __typename?: 'mimes_aggregate_fields';
  count: (args?: {
    columns?: Maybe<Array<mimes_select_column>>;
    distinct?: Maybe<Scalars['Boolean']>;
  }) => ScalarsEnums['Int'];
  max?: Maybe<mimes_max_fields>;
  min?: Maybe<mimes_min_fields>;
}

/**
 * aggregate max on columns
 */
export interface mimes_max_fields {
  __typename?: 'mimes_max_fields';
  icon?: Maybe<ScalarsEnums['String']>;
  id?: Maybe<ScalarsEnums['String']>;
}

/**
 * aggregate min on columns
 */
export interface mimes_min_fields {
  __typename?: 'mimes_min_fields';
  icon?: Maybe<ScalarsEnums['String']>;
  id?: Maybe<ScalarsEnums['String']>;
}

/**
 * response of any mutation on the table "mimes"
 */
export interface mimes_mutation_response {
  __typename?: 'mimes_mutation_response';
  /**
   * number of rows affected by the mutation
   */
  affected_rows: ScalarsEnums['Int'];
  /**
   * data from the rows affected by the mutation
   */
  returning: Array<mimes>;
}

export interface Mutation {
  __typename?: 'Mutation';
  deleteAuthProvider: (args: { id: Scalars['String'] }) => Maybe<authProviders>;
  deleteAuthProviderRequest: (args: {
    id: Scalars['uuid'];
  }) => Maybe<authProviderRequests>;
  deleteAuthProviderRequests: (args: {
    where: authProviderRequests_bool_exp;
  }) => Maybe<authProviderRequests_mutation_response>;
  deleteAuthProviders: (args: {
    where: authProviders_bool_exp;
  }) => Maybe<authProviders_mutation_response>;
  deleteAuthRefreshToken: (args: {
    refreshToken: Scalars['uuid'];
  }) => Maybe<authRefreshTokens>;
  deleteAuthRefreshTokens: (args: {
    where: authRefreshTokens_bool_exp;
  }) => Maybe<authRefreshTokens_mutation_response>;
  deleteAuthRole: (args: { role: Scalars['String'] }) => Maybe<authRoles>;
  deleteAuthRoles: (args: {
    where: authRoles_bool_exp;
  }) => Maybe<authRoles_mutation_response>;
  deleteAuthUserProvider: (args: {
    id: Scalars['uuid'];
  }) => Maybe<authUserProviders>;
  deleteAuthUserProviders: (args: {
    where: authUserProviders_bool_exp;
  }) => Maybe<authUserProviders_mutation_response>;
  deleteAuthUserRole: (args: { id: Scalars['uuid'] }) => Maybe<authUserRoles>;
  deleteAuthUserRoles: (args: {
    where: authUserRoles_bool_exp;
  }) => Maybe<authUserRoles_mutation_response>;
  deleteAuthUserSecurityKey: (args: {
    id: Scalars['uuid'];
  }) => Maybe<authUserSecurityKeys>;
  deleteAuthUserSecurityKeys: (args: {
    where: authUserSecurityKeys_bool_exp;
  }) => Maybe<authUserSecurityKeys_mutation_response>;
  deleteBucket: (args: { id: Scalars['String'] }) => Maybe<buckets>;
  deleteBuckets: (args: {
    where: buckets_bool_exp;
  }) => Maybe<buckets_mutation_response>;
  deleteFile: (args: { id: Scalars['uuid'] }) => Maybe<files>;
  deleteFiles: (args: {
    where: files_bool_exp;
  }) => Maybe<files_mutation_response>;
  deleteMember: (args: { id: Scalars['uuid'] }) => Maybe<members>;
  deleteMembers: (args: {
    where: members_bool_exp;
  }) => Maybe<members_mutation_response>;
  deleteMime: (args: { id: Scalars['String'] }) => Maybe<mimes>;
  deleteMimes: (args: {
    where: mimes_bool_exp;
  }) => Maybe<mimes_mutation_response>;
  deleteNode: (args: { id: Scalars['uuid'] }) => Maybe<nodes>;
  deleteNodes: (args: {
    where: nodes_bool_exp;
  }) => Maybe<nodes_mutation_response>;
  deletePermission: (args: { id: Scalars['uuid'] }) => Maybe<permissions>;
  deletePermissions: (args: {
    where: permissions_bool_exp;
  }) => Maybe<permissions_mutation_response>;
  deleteRelation: (args: { id: Scalars['uuid'] }) => Maybe<relations>;
  deleteRelations: (args: {
    where: relations_bool_exp;
  }) => Maybe<relations_mutation_response>;
  deleteUser: (args: { id: Scalars['uuid'] }) => Maybe<users>;
  deleteUsers: (args: {
    where: users_bool_exp;
  }) => Maybe<users_mutation_response>;
  delete_fields: (args: {
    where: fields_bool_exp;
  }) => Maybe<fields_mutation_response>;
  delete_fields_by_pk: (args: { id: Scalars['uuid'] }) => Maybe<fields>;
  insertAuthProvider: (args: {
    object: authProviders_insert_input;
    on_conflict?: Maybe<authProviders_on_conflict>;
  }) => Maybe<authProviders>;
  insertAuthProviderRequest: (args: {
    object: authProviderRequests_insert_input;
    on_conflict?: Maybe<authProviderRequests_on_conflict>;
  }) => Maybe<authProviderRequests>;
  insertAuthProviderRequests: (args: {
    objects: Array<authProviderRequests_insert_input>;
    on_conflict?: Maybe<authProviderRequests_on_conflict>;
  }) => Maybe<authProviderRequests_mutation_response>;
  insertAuthProviders: (args: {
    objects: Array<authProviders_insert_input>;
    on_conflict?: Maybe<authProviders_on_conflict>;
  }) => Maybe<authProviders_mutation_response>;
  insertAuthRefreshToken: (args: {
    object: authRefreshTokens_insert_input;
    on_conflict?: Maybe<authRefreshTokens_on_conflict>;
  }) => Maybe<authRefreshTokens>;
  insertAuthRefreshTokens: (args: {
    objects: Array<authRefreshTokens_insert_input>;
    on_conflict?: Maybe<authRefreshTokens_on_conflict>;
  }) => Maybe<authRefreshTokens_mutation_response>;
  insertAuthRole: (args: {
    object: authRoles_insert_input;
    on_conflict?: Maybe<authRoles_on_conflict>;
  }) => Maybe<authRoles>;
  insertAuthRoles: (args: {
    objects: Array<authRoles_insert_input>;
    on_conflict?: Maybe<authRoles_on_conflict>;
  }) => Maybe<authRoles_mutation_response>;
  insertAuthUserProvider: (args: {
    object: authUserProviders_insert_input;
    on_conflict?: Maybe<authUserProviders_on_conflict>;
  }) => Maybe<authUserProviders>;
  insertAuthUserProviders: (args: {
    objects: Array<authUserProviders_insert_input>;
    on_conflict?: Maybe<authUserProviders_on_conflict>;
  }) => Maybe<authUserProviders_mutation_response>;
  insertAuthUserRole: (args: {
    object: authUserRoles_insert_input;
    on_conflict?: Maybe<authUserRoles_on_conflict>;
  }) => Maybe<authUserRoles>;
  insertAuthUserRoles: (args: {
    objects: Array<authUserRoles_insert_input>;
    on_conflict?: Maybe<authUserRoles_on_conflict>;
  }) => Maybe<authUserRoles_mutation_response>;
  insertAuthUserSecurityKey: (args: {
    object: authUserSecurityKeys_insert_input;
    on_conflict?: Maybe<authUserSecurityKeys_on_conflict>;
  }) => Maybe<authUserSecurityKeys>;
  insertAuthUserSecurityKeys: (args: {
    objects: Array<authUserSecurityKeys_insert_input>;
    on_conflict?: Maybe<authUserSecurityKeys_on_conflict>;
  }) => Maybe<authUserSecurityKeys_mutation_response>;
  insertBucket: (args: {
    object: buckets_insert_input;
    on_conflict?: Maybe<buckets_on_conflict>;
  }) => Maybe<buckets>;
  insertBuckets: (args: {
    objects: Array<buckets_insert_input>;
    on_conflict?: Maybe<buckets_on_conflict>;
  }) => Maybe<buckets_mutation_response>;
  insertFile: (args: {
    object: files_insert_input;
    on_conflict?: Maybe<files_on_conflict>;
  }) => Maybe<files>;
  insertFiles: (args: {
    objects: Array<files_insert_input>;
    on_conflict?: Maybe<files_on_conflict>;
  }) => Maybe<files_mutation_response>;
  insertMember: (args: {
    object: members_insert_input;
    on_conflict?: Maybe<members_on_conflict>;
  }) => Maybe<members>;
  insertMembers: (args: {
    objects: Array<members_insert_input>;
    on_conflict?: Maybe<members_on_conflict>;
  }) => Maybe<members_mutation_response>;
  insertMime: (args: {
    object: mimes_insert_input;
    on_conflict?: Maybe<mimes_on_conflict>;
  }) => Maybe<mimes>;
  insertMimes: (args: {
    objects: Array<mimes_insert_input>;
    on_conflict?: Maybe<mimes_on_conflict>;
  }) => Maybe<mimes_mutation_response>;
  insertNode: (args: {
    object: nodes_insert_input;
    on_conflict?: Maybe<nodes_on_conflict>;
  }) => Maybe<nodes>;
  insertNodes: (args: {
    objects: Array<nodes_insert_input>;
    on_conflict?: Maybe<nodes_on_conflict>;
  }) => Maybe<nodes_mutation_response>;
  insertPermission: (args: {
    object: permissions_insert_input;
    on_conflict?: Maybe<permissions_on_conflict>;
  }) => Maybe<permissions>;
  insertPermissions: (args: {
    objects: Array<permissions_insert_input>;
    on_conflict?: Maybe<permissions_on_conflict>;
  }) => Maybe<permissions_mutation_response>;
  insertRelation: (args: {
    object: relations_insert_input;
    on_conflict?: Maybe<relations_on_conflict>;
  }) => Maybe<relations>;
  insertRelations: (args: {
    objects: Array<relations_insert_input>;
    on_conflict?: Maybe<relations_on_conflict>;
  }) => Maybe<relations_mutation_response>;
  insertUser: (args: {
    object: users_insert_input;
    on_conflict?: Maybe<users_on_conflict>;
  }) => Maybe<users>;
  insertUsers: (args: {
    objects: Array<users_insert_input>;
    on_conflict?: Maybe<users_on_conflict>;
  }) => Maybe<users_mutation_response>;
  insert_fields: (args: {
    objects: Array<fields_insert_input>;
    on_conflict?: Maybe<fields_on_conflict>;
  }) => Maybe<fields_mutation_response>;
  insert_fields_one: (args: {
    object: fields_insert_input;
    on_conflict?: Maybe<fields_on_conflict>;
  }) => Maybe<fields>;
  updateAuthProvider: (args: {
    _set?: Maybe<authProviders_set_input>;
    pk_columns: authProviders_pk_columns_input;
  }) => Maybe<authProviders>;
  updateAuthProviderRequest: (args: {
    _append?: Maybe<authProviderRequests_append_input>;
    _delete_at_path?: Maybe<authProviderRequests_delete_at_path_input>;
    _delete_elem?: Maybe<authProviderRequests_delete_elem_input>;
    _delete_key?: Maybe<authProviderRequests_delete_key_input>;
    _prepend?: Maybe<authProviderRequests_prepend_input>;
    _set?: Maybe<authProviderRequests_set_input>;
    pk_columns: authProviderRequests_pk_columns_input;
  }) => Maybe<authProviderRequests>;
  updateAuthProviderRequests: (args: {
    _append?: Maybe<authProviderRequests_append_input>;
    _delete_at_path?: Maybe<authProviderRequests_delete_at_path_input>;
    _delete_elem?: Maybe<authProviderRequests_delete_elem_input>;
    _delete_key?: Maybe<authProviderRequests_delete_key_input>;
    _prepend?: Maybe<authProviderRequests_prepend_input>;
    _set?: Maybe<authProviderRequests_set_input>;
    where: authProviderRequests_bool_exp;
  }) => Maybe<authProviderRequests_mutation_response>;
  updateAuthProviders: (args: {
    _set?: Maybe<authProviders_set_input>;
    where: authProviders_bool_exp;
  }) => Maybe<authProviders_mutation_response>;
  updateAuthRefreshToken: (args: {
    _set?: Maybe<authRefreshTokens_set_input>;
    pk_columns: authRefreshTokens_pk_columns_input;
  }) => Maybe<authRefreshTokens>;
  updateAuthRefreshTokens: (args: {
    _set?: Maybe<authRefreshTokens_set_input>;
    where: authRefreshTokens_bool_exp;
  }) => Maybe<authRefreshTokens_mutation_response>;
  updateAuthRole: (args: {
    _set?: Maybe<authRoles_set_input>;
    pk_columns: authRoles_pk_columns_input;
  }) => Maybe<authRoles>;
  updateAuthRoles: (args: {
    _set?: Maybe<authRoles_set_input>;
    where: authRoles_bool_exp;
  }) => Maybe<authRoles_mutation_response>;
  updateAuthUserProvider: (args: {
    _set?: Maybe<authUserProviders_set_input>;
    pk_columns: authUserProviders_pk_columns_input;
  }) => Maybe<authUserProviders>;
  updateAuthUserProviders: (args: {
    _set?: Maybe<authUserProviders_set_input>;
    where: authUserProviders_bool_exp;
  }) => Maybe<authUserProviders_mutation_response>;
  updateAuthUserRole: (args: {
    _set?: Maybe<authUserRoles_set_input>;
    pk_columns: authUserRoles_pk_columns_input;
  }) => Maybe<authUserRoles>;
  updateAuthUserRoles: (args: {
    _set?: Maybe<authUserRoles_set_input>;
    where: authUserRoles_bool_exp;
  }) => Maybe<authUserRoles_mutation_response>;
  updateAuthUserSecurityKey: (args: {
    _inc?: Maybe<authUserSecurityKeys_inc_input>;
    _set?: Maybe<authUserSecurityKeys_set_input>;
    pk_columns: authUserSecurityKeys_pk_columns_input;
  }) => Maybe<authUserSecurityKeys>;
  updateAuthUserSecurityKeys: (args: {
    _inc?: Maybe<authUserSecurityKeys_inc_input>;
    _set?: Maybe<authUserSecurityKeys_set_input>;
    where: authUserSecurityKeys_bool_exp;
  }) => Maybe<authUserSecurityKeys_mutation_response>;
  updateBucket: (args: {
    _inc?: Maybe<buckets_inc_input>;
    _set?: Maybe<buckets_set_input>;
    pk_columns: buckets_pk_columns_input;
  }) => Maybe<buckets>;
  updateBuckets: (args: {
    _inc?: Maybe<buckets_inc_input>;
    _set?: Maybe<buckets_set_input>;
    where: buckets_bool_exp;
  }) => Maybe<buckets_mutation_response>;
  updateFile: (args: {
    _inc?: Maybe<files_inc_input>;
    _set?: Maybe<files_set_input>;
    pk_columns: files_pk_columns_input;
  }) => Maybe<files>;
  updateFiles: (args: {
    _inc?: Maybe<files_inc_input>;
    _set?: Maybe<files_set_input>;
    where: files_bool_exp;
  }) => Maybe<files_mutation_response>;
  updateMember: (args: {
    _set?: Maybe<members_set_input>;
    pk_columns: members_pk_columns_input;
  }) => Maybe<members>;
  updateMembers: (args: {
    _set?: Maybe<members_set_input>;
    where: members_bool_exp;
  }) => Maybe<members_mutation_response>;
  updateMime: (args: {
    _append?: Maybe<mimes_append_input>;
    _delete_at_path?: Maybe<mimes_delete_at_path_input>;
    _delete_elem?: Maybe<mimes_delete_elem_input>;
    _delete_key?: Maybe<mimes_delete_key_input>;
    _prepend?: Maybe<mimes_prepend_input>;
    _set?: Maybe<mimes_set_input>;
    pk_columns: mimes_pk_columns_input;
  }) => Maybe<mimes>;
  updateMimes: (args: {
    _append?: Maybe<mimes_append_input>;
    _delete_at_path?: Maybe<mimes_delete_at_path_input>;
    _delete_elem?: Maybe<mimes_delete_elem_input>;
    _delete_key?: Maybe<mimes_delete_key_input>;
    _prepend?: Maybe<mimes_prepend_input>;
    _set?: Maybe<mimes_set_input>;
    where: mimes_bool_exp;
  }) => Maybe<mimes_mutation_response>;
  updateNode: (args: {
    _append?: Maybe<nodes_append_input>;
    _delete_at_path?: Maybe<nodes_delete_at_path_input>;
    _delete_elem?: Maybe<nodes_delete_elem_input>;
    _delete_key?: Maybe<nodes_delete_key_input>;
    _inc?: Maybe<nodes_inc_input>;
    _prepend?: Maybe<nodes_prepend_input>;
    _set?: Maybe<nodes_set_input>;
    pk_columns: nodes_pk_columns_input;
  }) => Maybe<nodes>;
  updateNodes: (args: {
    _append?: Maybe<nodes_append_input>;
    _delete_at_path?: Maybe<nodes_delete_at_path_input>;
    _delete_elem?: Maybe<nodes_delete_elem_input>;
    _delete_key?: Maybe<nodes_delete_key_input>;
    _inc?: Maybe<nodes_inc_input>;
    _prepend?: Maybe<nodes_prepend_input>;
    _set?: Maybe<nodes_set_input>;
    where: nodes_bool_exp;
  }) => Maybe<nodes_mutation_response>;
  updatePermission: (args: {
    _set?: Maybe<permissions_set_input>;
    pk_columns: permissions_pk_columns_input;
  }) => Maybe<permissions>;
  updatePermissions: (args: {
    _set?: Maybe<permissions_set_input>;
    where: permissions_bool_exp;
  }) => Maybe<permissions_mutation_response>;
  updateRelation: (args: {
    _set?: Maybe<relations_set_input>;
    pk_columns: relations_pk_columns_input;
  }) => Maybe<relations>;
  updateRelations: (args: {
    _set?: Maybe<relations_set_input>;
    where: relations_bool_exp;
  }) => Maybe<relations_mutation_response>;
  updateUser: (args: {
    _append?: Maybe<users_append_input>;
    _delete_at_path?: Maybe<users_delete_at_path_input>;
    _delete_elem?: Maybe<users_delete_elem_input>;
    _delete_key?: Maybe<users_delete_key_input>;
    _prepend?: Maybe<users_prepend_input>;
    _set?: Maybe<users_set_input>;
    pk_columns: users_pk_columns_input;
  }) => Maybe<users>;
  updateUsers: (args: {
    _append?: Maybe<users_append_input>;
    _delete_at_path?: Maybe<users_delete_at_path_input>;
    _delete_elem?: Maybe<users_delete_elem_input>;
    _delete_key?: Maybe<users_delete_key_input>;
    _prepend?: Maybe<users_prepend_input>;
    _set?: Maybe<users_set_input>;
    where: users_bool_exp;
  }) => Maybe<users_mutation_response>;
  update_authProviderRequests_many: (args: {
    updates: Array<authProviderRequests_updates>;
  }) => Maybe<Array<Maybe<authProviderRequests_mutation_response>>>;
  update_authProviders_many: (args: {
    updates: Array<authProviders_updates>;
  }) => Maybe<Array<Maybe<authProviders_mutation_response>>>;
  update_authRefreshTokens_many: (args: {
    updates: Array<authRefreshTokens_updates>;
  }) => Maybe<Array<Maybe<authRefreshTokens_mutation_response>>>;
  update_authRoles_many: (args: {
    updates: Array<authRoles_updates>;
  }) => Maybe<Array<Maybe<authRoles_mutation_response>>>;
  update_authUserProviders_many: (args: {
    updates: Array<authUserProviders_updates>;
  }) => Maybe<Array<Maybe<authUserProviders_mutation_response>>>;
  update_authUserRoles_many: (args: {
    updates: Array<authUserRoles_updates>;
  }) => Maybe<Array<Maybe<authUserRoles_mutation_response>>>;
  update_authUserSecurityKeys_many: (args: {
    updates: Array<authUserSecurityKeys_updates>;
  }) => Maybe<Array<Maybe<authUserSecurityKeys_mutation_response>>>;
  update_buckets_many: (args: {
    updates: Array<buckets_updates>;
  }) => Maybe<Array<Maybe<buckets_mutation_response>>>;
  update_fields: (args: {
    _append?: Maybe<fields_append_input>;
    _delete_at_path?: Maybe<fields_delete_at_path_input>;
    _delete_elem?: Maybe<fields_delete_elem_input>;
    _delete_key?: Maybe<fields_delete_key_input>;
    _prepend?: Maybe<fields_prepend_input>;
    _set?: Maybe<fields_set_input>;
    where: fields_bool_exp;
  }) => Maybe<fields_mutation_response>;
  update_fields_by_pk: (args: {
    _append?: Maybe<fields_append_input>;
    _delete_at_path?: Maybe<fields_delete_at_path_input>;
    _delete_elem?: Maybe<fields_delete_elem_input>;
    _delete_key?: Maybe<fields_delete_key_input>;
    _prepend?: Maybe<fields_prepend_input>;
    _set?: Maybe<fields_set_input>;
    pk_columns: fields_pk_columns_input;
  }) => Maybe<fields>;
  update_fields_many: (args: {
    updates: Array<fields_updates>;
  }) => Maybe<Array<Maybe<fields_mutation_response>>>;
  update_files_many: (args: {
    updates: Array<files_updates>;
  }) => Maybe<Array<Maybe<files_mutation_response>>>;
  update_members_many: (args: {
    updates: Array<members_updates>;
  }) => Maybe<Array<Maybe<members_mutation_response>>>;
  update_mimes_many: (args: {
    updates: Array<mimes_updates>;
  }) => Maybe<Array<Maybe<mimes_mutation_response>>>;
  update_nodes_many: (args: {
    updates: Array<nodes_updates>;
  }) => Maybe<Array<Maybe<nodes_mutation_response>>>;
  update_permissions_many: (args: {
    updates: Array<permissions_updates>;
  }) => Maybe<Array<Maybe<permissions_mutation_response>>>;
  update_relations_many: (args: {
    updates: Array<relations_updates>;
  }) => Maybe<Array<Maybe<relations_mutation_response>>>;
  update_users_many: (args: {
    updates: Array<users_updates>;
  }) => Maybe<Array<Maybe<users_mutation_response>>>;
}

/**
 * columns and relationships of "nodes"
 */
export interface nodes {
  __typename?: 'nodes';
  attachable: ScalarsEnums['Boolean'];
  /**
   * A computed field, executes function "check_unique"
   */
  checkUnique: (args: {
    /**
     * input parameters for computed field "checkUnique" defined on table "nodes"
     */
    args: checkUnique_nodes_args;
  }) => Maybe<ScalarsEnums['Boolean']>;
  /**
   * An array relationship
   */
  children: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<nodes_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars['Int']>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars['Int']>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<nodes_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<nodes_bool_exp>;
  }) => Array<nodes>;
  /**
   * An aggregate relationship
   */
  children_aggregate: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<nodes_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars['Int']>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars['Int']>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<nodes_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<nodes_bool_exp>;
  }) => nodes_aggregate;
  /**
   * An object relationship
   */
  context?: Maybe<nodes>;
  contextId?: Maybe<ScalarsEnums['uuid']>;
  /**
   * A computed field, executes function "context_owners"
   */
  contextOwners: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<users_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars['Int']>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars['Int']>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<users_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<users_bool_exp>;
  }) => Maybe<Array<users>>;
  createdAt?: Maybe<ScalarsEnums['timestamptz']>;
  data: (args?: {
    /**
     * JSON select path
     */
    path?: Maybe<Scalars['String']>;
  }) => Maybe<ScalarsEnums['jsonb']>;
  /**
   * A computed field, executes function "delete"
   */
  delete?: Maybe<ScalarsEnums['Boolean']>;
  /**
   * An array relationship
   */
  fields: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<fields_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars['Int']>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars['Int']>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<fields_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<fields_bool_exp>;
  }) => Array<fields>;
  /**
   * An aggregate relationship
   */
  fields_aggregate: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<fields_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars['Int']>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars['Int']>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<fields_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<fields_bool_exp>;
  }) => fields_aggregate;
  /**
   * A computed field, executes function "get_index"
   */
  getIndex?: Maybe<ScalarsEnums['Int']>;
  id: ScalarsEnums['uuid'];
  index: ScalarsEnums['Int'];
  /**
   * A computed field, executes function "insert"
   */
  insert?: Maybe<ScalarsEnums['Boolean']>;
  /**
   * A computed field, executes function "inserts"
   */
  inserts: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<mimes_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars['Int']>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars['Int']>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<mimes_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<mimes_bool_exp>;
  }) => Maybe<Array<mimes>>;
  /**
   * A computed field, executes function "is_context_owner"
   */
  isContextOwner?: Maybe<ScalarsEnums['Boolean']>;
  /**
   * A computed field, executes function "is_owner"
   */
  isOwner?: Maybe<ScalarsEnums['Boolean']>;
  key: ScalarsEnums['String'];
  /**
   * An array relationship
   */
  members: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<members_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars['Int']>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars['Int']>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<members_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<members_bool_exp>;
  }) => Array<members>;
  /**
   * An aggregate relationship
   */
  members_aggregate: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<members_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars['Int']>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars['Int']>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<members_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<members_bool_exp>;
  }) => members_aggregate;
  /**
   * An object relationship
   */
  mime?: Maybe<mimes>;
  mimeId?: Maybe<ScalarsEnums['String']>;
  mutable: ScalarsEnums['Boolean'];
  name: ScalarsEnums['String'];
  /**
   * An object relationship
   */
  owner?: Maybe<users>;
  ownerId?: Maybe<ScalarsEnums['uuid']>;
  /**
   * A computed field, executes function "owners"
   */
  owners: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<users_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars['Int']>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars['Int']>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<users_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<users_bool_exp>;
  }) => Maybe<Array<users>>;
  /**
   * An object relationship
   */
  parent?: Maybe<nodes>;
  parentId?: Maybe<ScalarsEnums['uuid']>;
  /**
   * An array relationship
   */
  permissions: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<permissions_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars['Int']>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars['Int']>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<permissions_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<permissions_bool_exp>;
  }) => Array<permissions>;
  /**
   * An aggregate relationship
   */
  permissions_aggregate: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<permissions_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars['Int']>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars['Int']>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<permissions_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<permissions_bool_exp>;
  }) => permissions_aggregate;
  /**
   * A computed field, executes function "relation"
   */
  relation: (args: {
    /**
     * input parameters for computed field "relation" defined on table "nodes"
     */
    args: relation_nodes_args;
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<nodes_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars['Int']>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars['Int']>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<nodes_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<nodes_bool_exp>;
  }) => Maybe<Array<nodes>>;
  /**
   * An array relationship
   */
  relations: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<relations_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars['Int']>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars['Int']>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<relations_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<relations_bool_exp>;
  }) => Array<relations>;
  /**
   * An aggregate relationship
   */
  relations_aggregate: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<relations_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars['Int']>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars['Int']>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<relations_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<relations_bool_exp>;
  }) => relations_aggregate;
  /**
   * A computed field, executes function "select"
   */
  select?: Maybe<ScalarsEnums['Boolean']>;
  /**
   * A computed field, executes function "unique"
   */
  unique?: Maybe<ScalarsEnums['String']>;
  /**
   * A computed field, executes function "update"
   */
  update?: Maybe<ScalarsEnums['Boolean']>;
  updatedAt: ScalarsEnums['timestamptz'];
}

/**
 * aggregated selection of "nodes"
 */
export interface nodes_aggregate {
  __typename?: 'nodes_aggregate';
  aggregate?: Maybe<nodes_aggregate_fields>;
  nodes: Array<nodes>;
}

/**
 * aggregate fields of "nodes"
 */
export interface nodes_aggregate_fields {
  __typename?: 'nodes_aggregate_fields';
  avg?: Maybe<nodes_avg_fields>;
  count: (args?: {
    columns?: Maybe<Array<nodes_select_column>>;
    distinct?: Maybe<Scalars['Boolean']>;
  }) => ScalarsEnums['Int'];
  max?: Maybe<nodes_max_fields>;
  min?: Maybe<nodes_min_fields>;
  stddev?: Maybe<nodes_stddev_fields>;
  stddev_pop?: Maybe<nodes_stddev_pop_fields>;
  stddev_samp?: Maybe<nodes_stddev_samp_fields>;
  sum?: Maybe<nodes_sum_fields>;
  var_pop?: Maybe<nodes_var_pop_fields>;
  var_samp?: Maybe<nodes_var_samp_fields>;
  variance?: Maybe<nodes_variance_fields>;
}

/**
 * aggregate avg on columns
 */
export interface nodes_avg_fields {
  __typename?: 'nodes_avg_fields';
  index?: Maybe<ScalarsEnums['Float']>;
}

/**
 * aggregate max on columns
 */
export interface nodes_max_fields {
  __typename?: 'nodes_max_fields';
  contextId?: Maybe<ScalarsEnums['uuid']>;
  createdAt?: Maybe<ScalarsEnums['timestamptz']>;
  id?: Maybe<ScalarsEnums['uuid']>;
  index?: Maybe<ScalarsEnums['Int']>;
  key?: Maybe<ScalarsEnums['String']>;
  mimeId?: Maybe<ScalarsEnums['String']>;
  name?: Maybe<ScalarsEnums['String']>;
  ownerId?: Maybe<ScalarsEnums['uuid']>;
  parentId?: Maybe<ScalarsEnums['uuid']>;
  updatedAt?: Maybe<ScalarsEnums['timestamptz']>;
}

/**
 * aggregate min on columns
 */
export interface nodes_min_fields {
  __typename?: 'nodes_min_fields';
  contextId?: Maybe<ScalarsEnums['uuid']>;
  createdAt?: Maybe<ScalarsEnums['timestamptz']>;
  id?: Maybe<ScalarsEnums['uuid']>;
  index?: Maybe<ScalarsEnums['Int']>;
  key?: Maybe<ScalarsEnums['String']>;
  mimeId?: Maybe<ScalarsEnums['String']>;
  name?: Maybe<ScalarsEnums['String']>;
  ownerId?: Maybe<ScalarsEnums['uuid']>;
  parentId?: Maybe<ScalarsEnums['uuid']>;
  updatedAt?: Maybe<ScalarsEnums['timestamptz']>;
}

/**
 * response of any mutation on the table "nodes"
 */
export interface nodes_mutation_response {
  __typename?: 'nodes_mutation_response';
  /**
   * number of rows affected by the mutation
   */
  affected_rows: ScalarsEnums['Int'];
  /**
   * data from the rows affected by the mutation
   */
  returning: Array<nodes>;
}

/**
 * aggregate stddev on columns
 */
export interface nodes_stddev_fields {
  __typename?: 'nodes_stddev_fields';
  index?: Maybe<ScalarsEnums['Float']>;
}

/**
 * aggregate stddev_pop on columns
 */
export interface nodes_stddev_pop_fields {
  __typename?: 'nodes_stddev_pop_fields';
  index?: Maybe<ScalarsEnums['Float']>;
}

/**
 * aggregate stddev_samp on columns
 */
export interface nodes_stddev_samp_fields {
  __typename?: 'nodes_stddev_samp_fields';
  index?: Maybe<ScalarsEnums['Float']>;
}

/**
 * aggregate sum on columns
 */
export interface nodes_sum_fields {
  __typename?: 'nodes_sum_fields';
  index?: Maybe<ScalarsEnums['Int']>;
}

/**
 * aggregate var_pop on columns
 */
export interface nodes_var_pop_fields {
  __typename?: 'nodes_var_pop_fields';
  index?: Maybe<ScalarsEnums['Float']>;
}

/**
 * aggregate var_samp on columns
 */
export interface nodes_var_samp_fields {
  __typename?: 'nodes_var_samp_fields';
  index?: Maybe<ScalarsEnums['Float']>;
}

/**
 * aggregate variance on columns
 */
export interface nodes_variance_fields {
  __typename?: 'nodes_variance_fields';
  index?: Maybe<ScalarsEnums['Float']>;
}

/**
 * columns and relationships of "permissions"
 */
export interface permissions {
  __typename?: 'permissions';
  active: ScalarsEnums['Boolean'];
  /**
   * An object relationship
   */
  context?: Maybe<nodes>;
  contextId?: Maybe<ScalarsEnums['uuid']>;
  delete: ScalarsEnums['Boolean'];
  id: ScalarsEnums['uuid'];
  insert: ScalarsEnums['Boolean'];
  mimeId?: Maybe<ScalarsEnums['String']>;
  /**
   * An object relationship
   */
  node?: Maybe<nodes>;
  nodeId?: Maybe<ScalarsEnums['uuid']>;
  parents?: Maybe<ScalarsEnums['_text']>;
  role: ScalarsEnums['String'];
  select: ScalarsEnums['Boolean'];
  update: ScalarsEnums['Boolean'];
}

/**
 * aggregated selection of "permissions"
 */
export interface permissions_aggregate {
  __typename?: 'permissions_aggregate';
  aggregate?: Maybe<permissions_aggregate_fields>;
  nodes: Array<permissions>;
}

/**
 * aggregate fields of "permissions"
 */
export interface permissions_aggregate_fields {
  __typename?: 'permissions_aggregate_fields';
  count: (args?: {
    columns?: Maybe<Array<permissions_select_column>>;
    distinct?: Maybe<Scalars['Boolean']>;
  }) => ScalarsEnums['Int'];
  max?: Maybe<permissions_max_fields>;
  min?: Maybe<permissions_min_fields>;
}

/**
 * aggregate max on columns
 */
export interface permissions_max_fields {
  __typename?: 'permissions_max_fields';
  contextId?: Maybe<ScalarsEnums['uuid']>;
  id?: Maybe<ScalarsEnums['uuid']>;
  mimeId?: Maybe<ScalarsEnums['String']>;
  nodeId?: Maybe<ScalarsEnums['uuid']>;
  role?: Maybe<ScalarsEnums['String']>;
}

/**
 * aggregate min on columns
 */
export interface permissions_min_fields {
  __typename?: 'permissions_min_fields';
  contextId?: Maybe<ScalarsEnums['uuid']>;
  id?: Maybe<ScalarsEnums['uuid']>;
  mimeId?: Maybe<ScalarsEnums['String']>;
  nodeId?: Maybe<ScalarsEnums['uuid']>;
  role?: Maybe<ScalarsEnums['String']>;
}

/**
 * response of any mutation on the table "permissions"
 */
export interface permissions_mutation_response {
  __typename?: 'permissions_mutation_response';
  /**
   * number of rows affected by the mutation
   */
  affected_rows: ScalarsEnums['Int'];
  /**
   * data from the rows affected by the mutation
   */
  returning: Array<permissions>;
}

export interface Query {
  __typename?: 'Query';
  authProvider: (args: { id: Scalars['String'] }) => Maybe<authProviders>;
  authProviderRequest: (args: {
    id: Scalars['uuid'];
  }) => Maybe<authProviderRequests>;
  authProviderRequests: (args?: {
    distinct_on?: Maybe<Array<authProviderRequests_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<authProviderRequests_order_by>>;
    where?: Maybe<authProviderRequests_bool_exp>;
  }) => Array<authProviderRequests>;
  authProviderRequestsAggregate: (args?: {
    distinct_on?: Maybe<Array<authProviderRequests_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<authProviderRequests_order_by>>;
    where?: Maybe<authProviderRequests_bool_exp>;
  }) => authProviderRequests_aggregate;
  authProviders: (args?: {
    distinct_on?: Maybe<Array<authProviders_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<authProviders_order_by>>;
    where?: Maybe<authProviders_bool_exp>;
  }) => Array<authProviders>;
  authProvidersAggregate: (args?: {
    distinct_on?: Maybe<Array<authProviders_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<authProviders_order_by>>;
    where?: Maybe<authProviders_bool_exp>;
  }) => authProviders_aggregate;
  authRefreshToken: (args: {
    refreshToken: Scalars['uuid'];
  }) => Maybe<authRefreshTokens>;
  authRefreshTokens: (args?: {
    distinct_on?: Maybe<Array<authRefreshTokens_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<authRefreshTokens_order_by>>;
    where?: Maybe<authRefreshTokens_bool_exp>;
  }) => Array<authRefreshTokens>;
  authRefreshTokensAggregate: (args?: {
    distinct_on?: Maybe<Array<authRefreshTokens_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<authRefreshTokens_order_by>>;
    where?: Maybe<authRefreshTokens_bool_exp>;
  }) => authRefreshTokens_aggregate;
  authRole: (args: { role: Scalars['String'] }) => Maybe<authRoles>;
  authRoles: (args?: {
    distinct_on?: Maybe<Array<authRoles_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<authRoles_order_by>>;
    where?: Maybe<authRoles_bool_exp>;
  }) => Array<authRoles>;
  authRolesAggregate: (args?: {
    distinct_on?: Maybe<Array<authRoles_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<authRoles_order_by>>;
    where?: Maybe<authRoles_bool_exp>;
  }) => authRoles_aggregate;
  authUserProvider: (args: { id: Scalars['uuid'] }) => Maybe<authUserProviders>;
  authUserProviders: (args?: {
    distinct_on?: Maybe<Array<authUserProviders_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<authUserProviders_order_by>>;
    where?: Maybe<authUserProviders_bool_exp>;
  }) => Array<authUserProviders>;
  authUserProvidersAggregate: (args?: {
    distinct_on?: Maybe<Array<authUserProviders_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<authUserProviders_order_by>>;
    where?: Maybe<authUserProviders_bool_exp>;
  }) => authUserProviders_aggregate;
  authUserRole: (args: { id: Scalars['uuid'] }) => Maybe<authUserRoles>;
  authUserRoles: (args?: {
    distinct_on?: Maybe<Array<authUserRoles_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<authUserRoles_order_by>>;
    where?: Maybe<authUserRoles_bool_exp>;
  }) => Array<authUserRoles>;
  authUserRolesAggregate: (args?: {
    distinct_on?: Maybe<Array<authUserRoles_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<authUserRoles_order_by>>;
    where?: Maybe<authUserRoles_bool_exp>;
  }) => authUserRoles_aggregate;
  authUserSecurityKey: (args: {
    id: Scalars['uuid'];
  }) => Maybe<authUserSecurityKeys>;
  authUserSecurityKeys: (args?: {
    distinct_on?: Maybe<Array<authUserSecurityKeys_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<authUserSecurityKeys_order_by>>;
    where?: Maybe<authUserSecurityKeys_bool_exp>;
  }) => Array<authUserSecurityKeys>;
  authUserSecurityKeysAggregate: (args?: {
    distinct_on?: Maybe<Array<authUserSecurityKeys_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<authUserSecurityKeys_order_by>>;
    where?: Maybe<authUserSecurityKeys_bool_exp>;
  }) => authUserSecurityKeys_aggregate;
  bucket: (args: { id: Scalars['String'] }) => Maybe<buckets>;
  buckets: (args?: {
    distinct_on?: Maybe<Array<buckets_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<buckets_order_by>>;
    where?: Maybe<buckets_bool_exp>;
  }) => Array<buckets>;
  bucketsAggregate: (args?: {
    distinct_on?: Maybe<Array<buckets_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<buckets_order_by>>;
    where?: Maybe<buckets_bool_exp>;
  }) => buckets_aggregate;
  fields: (args?: {
    distinct_on?: Maybe<Array<fields_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<fields_order_by>>;
    where?: Maybe<fields_bool_exp>;
  }) => Array<fields>;
  fields_aggregate: (args?: {
    distinct_on?: Maybe<Array<fields_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<fields_order_by>>;
    where?: Maybe<fields_bool_exp>;
  }) => fields_aggregate;
  fields_by_pk: (args: { id: Scalars['uuid'] }) => Maybe<fields>;
  file: (args: { id: Scalars['uuid'] }) => Maybe<files>;
  files: (args?: {
    distinct_on?: Maybe<Array<files_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<files_order_by>>;
    where?: Maybe<files_bool_exp>;
  }) => Array<files>;
  filesAggregate: (args?: {
    distinct_on?: Maybe<Array<files_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<files_order_by>>;
    where?: Maybe<files_bool_exp>;
  }) => files_aggregate;
  member: (args: { id: Scalars['uuid'] }) => Maybe<members>;
  members: (args?: {
    distinct_on?: Maybe<Array<members_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<members_order_by>>;
    where?: Maybe<members_bool_exp>;
  }) => Array<members>;
  membersAggregate: (args?: {
    distinct_on?: Maybe<Array<members_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<members_order_by>>;
    where?: Maybe<members_bool_exp>;
  }) => members_aggregate;
  mime: (args: { id: Scalars['String'] }) => Maybe<mimes>;
  mimes: (args?: {
    distinct_on?: Maybe<Array<mimes_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<mimes_order_by>>;
    where?: Maybe<mimes_bool_exp>;
  }) => Array<mimes>;
  mimesAggregate: (args?: {
    distinct_on?: Maybe<Array<mimes_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<mimes_order_by>>;
    where?: Maybe<mimes_bool_exp>;
  }) => mimes_aggregate;
  node: (args: { id: Scalars['uuid'] }) => Maybe<nodes>;
  nodes: (args?: {
    distinct_on?: Maybe<Array<nodes_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<nodes_order_by>>;
    where?: Maybe<nodes_bool_exp>;
  }) => Array<nodes>;
  nodesAggregate: (args?: {
    distinct_on?: Maybe<Array<nodes_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<nodes_order_by>>;
    where?: Maybe<nodes_bool_exp>;
  }) => nodes_aggregate;
  permission: (args: { id: Scalars['uuid'] }) => Maybe<permissions>;
  permissions: (args?: {
    distinct_on?: Maybe<Array<permissions_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<permissions_order_by>>;
    where?: Maybe<permissions_bool_exp>;
  }) => Array<permissions>;
  permissionsAggregate: (args?: {
    distinct_on?: Maybe<Array<permissions_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<permissions_order_by>>;
    where?: Maybe<permissions_bool_exp>;
  }) => permissions_aggregate;
  relation: (args: { id: Scalars['uuid'] }) => Maybe<relations>;
  relations: (args?: {
    distinct_on?: Maybe<Array<relations_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<relations_order_by>>;
    where?: Maybe<relations_bool_exp>;
  }) => Array<relations>;
  relationsAggregate: (args?: {
    distinct_on?: Maybe<Array<relations_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<relations_order_by>>;
    where?: Maybe<relations_bool_exp>;
  }) => relations_aggregate;
  user: (args: { id: Scalars['uuid'] }) => Maybe<users>;
  users: (args?: {
    distinct_on?: Maybe<Array<users_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<users_order_by>>;
    where?: Maybe<users_bool_exp>;
  }) => Array<users>;
  usersAggregate: (args?: {
    distinct_on?: Maybe<Array<users_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<users_order_by>>;
    where?: Maybe<users_bool_exp>;
  }) => users_aggregate;
}

/**
 * columns and relationships of "relations"
 */
export interface relations {
  __typename?: 'relations';
  id: ScalarsEnums['uuid'];
  name: ScalarsEnums['String'];
  /**
   * An object relationship
   */
  node?: Maybe<nodes>;
  nodeId?: Maybe<ScalarsEnums['uuid']>;
  /**
   * An object relationship
   */
  parent?: Maybe<nodes>;
  parentId: ScalarsEnums['uuid'];
}

/**
 * aggregated selection of "relations"
 */
export interface relations_aggregate {
  __typename?: 'relations_aggregate';
  aggregate?: Maybe<relations_aggregate_fields>;
  nodes: Array<relations>;
}

/**
 * aggregate fields of "relations"
 */
export interface relations_aggregate_fields {
  __typename?: 'relations_aggregate_fields';
  count: (args?: {
    columns?: Maybe<Array<relations_select_column>>;
    distinct?: Maybe<Scalars['Boolean']>;
  }) => ScalarsEnums['Int'];
  max?: Maybe<relations_max_fields>;
  min?: Maybe<relations_min_fields>;
}

/**
 * aggregate max on columns
 */
export interface relations_max_fields {
  __typename?: 'relations_max_fields';
  id?: Maybe<ScalarsEnums['uuid']>;
  name?: Maybe<ScalarsEnums['String']>;
  nodeId?: Maybe<ScalarsEnums['uuid']>;
  parentId?: Maybe<ScalarsEnums['uuid']>;
}

/**
 * aggregate min on columns
 */
export interface relations_min_fields {
  __typename?: 'relations_min_fields';
  id?: Maybe<ScalarsEnums['uuid']>;
  name?: Maybe<ScalarsEnums['String']>;
  nodeId?: Maybe<ScalarsEnums['uuid']>;
  parentId?: Maybe<ScalarsEnums['uuid']>;
}

/**
 * response of any mutation on the table "relations"
 */
export interface relations_mutation_response {
  __typename?: 'relations_mutation_response';
  /**
   * number of rows affected by the mutation
   */
  affected_rows: ScalarsEnums['Int'];
  /**
   * data from the rows affected by the mutation
   */
  returning: Array<relations>;
}

export interface Subscription {
  __typename?: 'Subscription';
  authProvider: (args: { id: Scalars['String'] }) => Maybe<authProviders>;
  authProviderRequest: (args: {
    id: Scalars['uuid'];
  }) => Maybe<authProviderRequests>;
  authProviderRequests: (args?: {
    distinct_on?: Maybe<Array<authProviderRequests_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<authProviderRequests_order_by>>;
    where?: Maybe<authProviderRequests_bool_exp>;
  }) => Array<authProviderRequests>;
  authProviderRequestsAggregate: (args?: {
    distinct_on?: Maybe<Array<authProviderRequests_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<authProviderRequests_order_by>>;
    where?: Maybe<authProviderRequests_bool_exp>;
  }) => authProviderRequests_aggregate;
  authProviderRequests_stream: (args: {
    batch_size: Scalars['Int'];
    cursor: Array<Maybe<authProviderRequests_stream_cursor_input>>;
    where?: Maybe<authProviderRequests_bool_exp>;
  }) => Array<authProviderRequests>;
  authProviders: (args?: {
    distinct_on?: Maybe<Array<authProviders_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<authProviders_order_by>>;
    where?: Maybe<authProviders_bool_exp>;
  }) => Array<authProviders>;
  authProvidersAggregate: (args?: {
    distinct_on?: Maybe<Array<authProviders_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<authProviders_order_by>>;
    where?: Maybe<authProviders_bool_exp>;
  }) => authProviders_aggregate;
  authProviders_stream: (args: {
    batch_size: Scalars['Int'];
    cursor: Array<Maybe<authProviders_stream_cursor_input>>;
    where?: Maybe<authProviders_bool_exp>;
  }) => Array<authProviders>;
  authRefreshToken: (args: {
    refreshToken: Scalars['uuid'];
  }) => Maybe<authRefreshTokens>;
  authRefreshTokens: (args?: {
    distinct_on?: Maybe<Array<authRefreshTokens_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<authRefreshTokens_order_by>>;
    where?: Maybe<authRefreshTokens_bool_exp>;
  }) => Array<authRefreshTokens>;
  authRefreshTokensAggregate: (args?: {
    distinct_on?: Maybe<Array<authRefreshTokens_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<authRefreshTokens_order_by>>;
    where?: Maybe<authRefreshTokens_bool_exp>;
  }) => authRefreshTokens_aggregate;
  authRefreshTokens_stream: (args: {
    batch_size: Scalars['Int'];
    cursor: Array<Maybe<authRefreshTokens_stream_cursor_input>>;
    where?: Maybe<authRefreshTokens_bool_exp>;
  }) => Array<authRefreshTokens>;
  authRole: (args: { role: Scalars['String'] }) => Maybe<authRoles>;
  authRoles: (args?: {
    distinct_on?: Maybe<Array<authRoles_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<authRoles_order_by>>;
    where?: Maybe<authRoles_bool_exp>;
  }) => Array<authRoles>;
  authRolesAggregate: (args?: {
    distinct_on?: Maybe<Array<authRoles_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<authRoles_order_by>>;
    where?: Maybe<authRoles_bool_exp>;
  }) => authRoles_aggregate;
  authRoles_stream: (args: {
    batch_size: Scalars['Int'];
    cursor: Array<Maybe<authRoles_stream_cursor_input>>;
    where?: Maybe<authRoles_bool_exp>;
  }) => Array<authRoles>;
  authUserProvider: (args: { id: Scalars['uuid'] }) => Maybe<authUserProviders>;
  authUserProviders: (args?: {
    distinct_on?: Maybe<Array<authUserProviders_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<authUserProviders_order_by>>;
    where?: Maybe<authUserProviders_bool_exp>;
  }) => Array<authUserProviders>;
  authUserProvidersAggregate: (args?: {
    distinct_on?: Maybe<Array<authUserProviders_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<authUserProviders_order_by>>;
    where?: Maybe<authUserProviders_bool_exp>;
  }) => authUserProviders_aggregate;
  authUserProviders_stream: (args: {
    batch_size: Scalars['Int'];
    cursor: Array<Maybe<authUserProviders_stream_cursor_input>>;
    where?: Maybe<authUserProviders_bool_exp>;
  }) => Array<authUserProviders>;
  authUserRole: (args: { id: Scalars['uuid'] }) => Maybe<authUserRoles>;
  authUserRoles: (args?: {
    distinct_on?: Maybe<Array<authUserRoles_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<authUserRoles_order_by>>;
    where?: Maybe<authUserRoles_bool_exp>;
  }) => Array<authUserRoles>;
  authUserRolesAggregate: (args?: {
    distinct_on?: Maybe<Array<authUserRoles_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<authUserRoles_order_by>>;
    where?: Maybe<authUserRoles_bool_exp>;
  }) => authUserRoles_aggregate;
  authUserRoles_stream: (args: {
    batch_size: Scalars['Int'];
    cursor: Array<Maybe<authUserRoles_stream_cursor_input>>;
    where?: Maybe<authUserRoles_bool_exp>;
  }) => Array<authUserRoles>;
  authUserSecurityKey: (args: {
    id: Scalars['uuid'];
  }) => Maybe<authUserSecurityKeys>;
  authUserSecurityKeys: (args?: {
    distinct_on?: Maybe<Array<authUserSecurityKeys_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<authUserSecurityKeys_order_by>>;
    where?: Maybe<authUserSecurityKeys_bool_exp>;
  }) => Array<authUserSecurityKeys>;
  authUserSecurityKeysAggregate: (args?: {
    distinct_on?: Maybe<Array<authUserSecurityKeys_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<authUserSecurityKeys_order_by>>;
    where?: Maybe<authUserSecurityKeys_bool_exp>;
  }) => authUserSecurityKeys_aggregate;
  authUserSecurityKeys_stream: (args: {
    batch_size: Scalars['Int'];
    cursor: Array<Maybe<authUserSecurityKeys_stream_cursor_input>>;
    where?: Maybe<authUserSecurityKeys_bool_exp>;
  }) => Array<authUserSecurityKeys>;
  bucket: (args: { id: Scalars['String'] }) => Maybe<buckets>;
  buckets: (args?: {
    distinct_on?: Maybe<Array<buckets_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<buckets_order_by>>;
    where?: Maybe<buckets_bool_exp>;
  }) => Array<buckets>;
  bucketsAggregate: (args?: {
    distinct_on?: Maybe<Array<buckets_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<buckets_order_by>>;
    where?: Maybe<buckets_bool_exp>;
  }) => buckets_aggregate;
  buckets_stream: (args: {
    batch_size: Scalars['Int'];
    cursor: Array<Maybe<buckets_stream_cursor_input>>;
    where?: Maybe<buckets_bool_exp>;
  }) => Array<buckets>;
  fields: (args?: {
    distinct_on?: Maybe<Array<fields_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<fields_order_by>>;
    where?: Maybe<fields_bool_exp>;
  }) => Array<fields>;
  fields_aggregate: (args?: {
    distinct_on?: Maybe<Array<fields_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<fields_order_by>>;
    where?: Maybe<fields_bool_exp>;
  }) => fields_aggregate;
  fields_by_pk: (args: { id: Scalars['uuid'] }) => Maybe<fields>;
  fields_stream: (args: {
    batch_size: Scalars['Int'];
    cursor: Array<Maybe<fields_stream_cursor_input>>;
    where?: Maybe<fields_bool_exp>;
  }) => Array<fields>;
  file: (args: { id: Scalars['uuid'] }) => Maybe<files>;
  files: (args?: {
    distinct_on?: Maybe<Array<files_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<files_order_by>>;
    where?: Maybe<files_bool_exp>;
  }) => Array<files>;
  filesAggregate: (args?: {
    distinct_on?: Maybe<Array<files_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<files_order_by>>;
    where?: Maybe<files_bool_exp>;
  }) => files_aggregate;
  files_stream: (args: {
    batch_size: Scalars['Int'];
    cursor: Array<Maybe<files_stream_cursor_input>>;
    where?: Maybe<files_bool_exp>;
  }) => Array<files>;
  member: (args: { id: Scalars['uuid'] }) => Maybe<members>;
  members: (args?: {
    distinct_on?: Maybe<Array<members_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<members_order_by>>;
    where?: Maybe<members_bool_exp>;
  }) => Array<members>;
  membersAggregate: (args?: {
    distinct_on?: Maybe<Array<members_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<members_order_by>>;
    where?: Maybe<members_bool_exp>;
  }) => members_aggregate;
  members_stream: (args: {
    batch_size: Scalars['Int'];
    cursor: Array<Maybe<members_stream_cursor_input>>;
    where?: Maybe<members_bool_exp>;
  }) => Array<members>;
  mime: (args: { id: Scalars['String'] }) => Maybe<mimes>;
  mimes: (args?: {
    distinct_on?: Maybe<Array<mimes_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<mimes_order_by>>;
    where?: Maybe<mimes_bool_exp>;
  }) => Array<mimes>;
  mimesAggregate: (args?: {
    distinct_on?: Maybe<Array<mimes_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<mimes_order_by>>;
    where?: Maybe<mimes_bool_exp>;
  }) => mimes_aggregate;
  mimes_stream: (args: {
    batch_size: Scalars['Int'];
    cursor: Array<Maybe<mimes_stream_cursor_input>>;
    where?: Maybe<mimes_bool_exp>;
  }) => Array<mimes>;
  node: (args: { id: Scalars['uuid'] }) => Maybe<nodes>;
  nodes: (args?: {
    distinct_on?: Maybe<Array<nodes_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<nodes_order_by>>;
    where?: Maybe<nodes_bool_exp>;
  }) => Array<nodes>;
  nodesAggregate: (args?: {
    distinct_on?: Maybe<Array<nodes_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<nodes_order_by>>;
    where?: Maybe<nodes_bool_exp>;
  }) => nodes_aggregate;
  nodes_stream: (args: {
    batch_size: Scalars['Int'];
    cursor: Array<Maybe<nodes_stream_cursor_input>>;
    where?: Maybe<nodes_bool_exp>;
  }) => Array<nodes>;
  permission: (args: { id: Scalars['uuid'] }) => Maybe<permissions>;
  permissions: (args?: {
    distinct_on?: Maybe<Array<permissions_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<permissions_order_by>>;
    where?: Maybe<permissions_bool_exp>;
  }) => Array<permissions>;
  permissionsAggregate: (args?: {
    distinct_on?: Maybe<Array<permissions_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<permissions_order_by>>;
    where?: Maybe<permissions_bool_exp>;
  }) => permissions_aggregate;
  permissions_stream: (args: {
    batch_size: Scalars['Int'];
    cursor: Array<Maybe<permissions_stream_cursor_input>>;
    where?: Maybe<permissions_bool_exp>;
  }) => Array<permissions>;
  relation: (args: { id: Scalars['uuid'] }) => Maybe<relations>;
  relations: (args?: {
    distinct_on?: Maybe<Array<relations_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<relations_order_by>>;
    where?: Maybe<relations_bool_exp>;
  }) => Array<relations>;
  relationsAggregate: (args?: {
    distinct_on?: Maybe<Array<relations_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<relations_order_by>>;
    where?: Maybe<relations_bool_exp>;
  }) => relations_aggregate;
  relations_stream: (args: {
    batch_size: Scalars['Int'];
    cursor: Array<Maybe<relations_stream_cursor_input>>;
    where?: Maybe<relations_bool_exp>;
  }) => Array<relations>;
  user: (args: { id: Scalars['uuid'] }) => Maybe<users>;
  users: (args?: {
    distinct_on?: Maybe<Array<users_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<users_order_by>>;
    where?: Maybe<users_bool_exp>;
  }) => Array<users>;
  usersAggregate: (args?: {
    distinct_on?: Maybe<Array<users_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<users_order_by>>;
    where?: Maybe<users_bool_exp>;
  }) => users_aggregate;
  users_stream: (args: {
    batch_size: Scalars['Int'];
    cursor: Array<Maybe<users_stream_cursor_input>>;
    where?: Maybe<users_bool_exp>;
  }) => Array<users>;
}

/**
 * User account information. Don't modify its structure as Hasura Auth relies on it to function properly.
 */
export interface users {
  __typename?: 'users';
  activeMfaType?: Maybe<ScalarsEnums['String']>;
  avatarUrl: ScalarsEnums['String'];
  createdAt: ScalarsEnums['timestamptz'];
  currentChallenge?: Maybe<ScalarsEnums['String']>;
  defaultRole: ScalarsEnums['String'];
  /**
   * An object relationship
   */
  defaultRoleByRole: authRoles;
  disabled: ScalarsEnums['Boolean'];
  displayName: ScalarsEnums['String'];
  email?: Maybe<ScalarsEnums['citext']>;
  emailVerified: ScalarsEnums['Boolean'];
  id: ScalarsEnums['uuid'];
  isAnonymous: ScalarsEnums['Boolean'];
  lastSeen?: Maybe<ScalarsEnums['timestamptz']>;
  locale: ScalarsEnums['String'];
  /**
   * An array relationship
   */
  memberships: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<members_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars['Int']>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars['Int']>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<members_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<members_bool_exp>;
  }) => Array<members>;
  /**
   * An aggregate relationship
   */
  memberships_aggregate: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<members_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars['Int']>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars['Int']>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<members_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<members_bool_exp>;
  }) => members_aggregate;
  metadata: (args?: {
    /**
     * JSON select path
     */
    path?: Maybe<Scalars['String']>;
  }) => Maybe<ScalarsEnums['jsonb']>;
  newEmail?: Maybe<ScalarsEnums['citext']>;
  otpHash?: Maybe<ScalarsEnums['String']>;
  otpHashExpiresAt: ScalarsEnums['timestamptz'];
  otpMethodLastUsed?: Maybe<ScalarsEnums['String']>;
  passwordHash?: Maybe<ScalarsEnums['String']>;
  phoneNumber?: Maybe<ScalarsEnums['String']>;
  phoneNumberVerified: ScalarsEnums['Boolean'];
  /**
   * An array relationship
   */
  refreshTokens: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<authRefreshTokens_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars['Int']>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars['Int']>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<authRefreshTokens_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<authRefreshTokens_bool_exp>;
  }) => Array<authRefreshTokens>;
  /**
   * An aggregate relationship
   */
  refreshTokens_aggregate: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<authRefreshTokens_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars['Int']>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars['Int']>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<authRefreshTokens_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<authRefreshTokens_bool_exp>;
  }) => authRefreshTokens_aggregate;
  /**
   * An array relationship
   */
  roles: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<authUserRoles_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars['Int']>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars['Int']>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<authUserRoles_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<authUserRoles_bool_exp>;
  }) => Array<authUserRoles>;
  /**
   * An aggregate relationship
   */
  roles_aggregate: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<authUserRoles_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars['Int']>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars['Int']>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<authUserRoles_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<authUserRoles_bool_exp>;
  }) => authUserRoles_aggregate;
  /**
   * An array relationship
   */
  securityKeys: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<authUserSecurityKeys_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars['Int']>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars['Int']>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<authUserSecurityKeys_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<authUserSecurityKeys_bool_exp>;
  }) => Array<authUserSecurityKeys>;
  /**
   * An aggregate relationship
   */
  securityKeys_aggregate: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<authUserSecurityKeys_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars['Int']>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars['Int']>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<authUserSecurityKeys_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<authUserSecurityKeys_bool_exp>;
  }) => authUserSecurityKeys_aggregate;
  ticket?: Maybe<ScalarsEnums['String']>;
  ticketExpiresAt: ScalarsEnums['timestamptz'];
  totpSecret?: Maybe<ScalarsEnums['String']>;
  updatedAt: ScalarsEnums['timestamptz'];
  /**
   * An array relationship
   */
  userProviders: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<authUserProviders_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars['Int']>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars['Int']>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<authUserProviders_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<authUserProviders_bool_exp>;
  }) => Array<authUserProviders>;
  /**
   * An aggregate relationship
   */
  userProviders_aggregate: (args?: {
    /**
     * distinct select on columns
     */
    distinct_on?: Maybe<Array<authUserProviders_select_column>>;
    /**
     * limit the number of rows returned
     */
    limit?: Maybe<Scalars['Int']>;
    /**
     * skip the first n rows. Use only with order_by
     */
    offset?: Maybe<Scalars['Int']>;
    /**
     * sort the rows by one or more columns
     */
    order_by?: Maybe<Array<authUserProviders_order_by>>;
    /**
     * filter the rows returned
     */
    where?: Maybe<authUserProviders_bool_exp>;
  }) => authUserProviders_aggregate;
}

/**
 * aggregated selection of "auth.users"
 */
export interface users_aggregate {
  __typename?: 'users_aggregate';
  aggregate?: Maybe<users_aggregate_fields>;
  nodes: Array<users>;
}

/**
 * aggregate fields of "auth.users"
 */
export interface users_aggregate_fields {
  __typename?: 'users_aggregate_fields';
  count: (args?: {
    columns?: Maybe<Array<users_select_column>>;
    distinct?: Maybe<Scalars['Boolean']>;
  }) => ScalarsEnums['Int'];
  max?: Maybe<users_max_fields>;
  min?: Maybe<users_min_fields>;
}

/**
 * aggregate max on columns
 */
export interface users_max_fields {
  __typename?: 'users_max_fields';
  activeMfaType?: Maybe<ScalarsEnums['String']>;
  avatarUrl?: Maybe<ScalarsEnums['String']>;
  createdAt?: Maybe<ScalarsEnums['timestamptz']>;
  currentChallenge?: Maybe<ScalarsEnums['String']>;
  defaultRole?: Maybe<ScalarsEnums['String']>;
  displayName?: Maybe<ScalarsEnums['String']>;
  email?: Maybe<ScalarsEnums['citext']>;
  id?: Maybe<ScalarsEnums['uuid']>;
  lastSeen?: Maybe<ScalarsEnums['timestamptz']>;
  locale?: Maybe<ScalarsEnums['String']>;
  newEmail?: Maybe<ScalarsEnums['citext']>;
  otpHash?: Maybe<ScalarsEnums['String']>;
  otpHashExpiresAt?: Maybe<ScalarsEnums['timestamptz']>;
  otpMethodLastUsed?: Maybe<ScalarsEnums['String']>;
  passwordHash?: Maybe<ScalarsEnums['String']>;
  phoneNumber?: Maybe<ScalarsEnums['String']>;
  ticket?: Maybe<ScalarsEnums['String']>;
  ticketExpiresAt?: Maybe<ScalarsEnums['timestamptz']>;
  totpSecret?: Maybe<ScalarsEnums['String']>;
  updatedAt?: Maybe<ScalarsEnums['timestamptz']>;
}

/**
 * aggregate min on columns
 */
export interface users_min_fields {
  __typename?: 'users_min_fields';
  activeMfaType?: Maybe<ScalarsEnums['String']>;
  avatarUrl?: Maybe<ScalarsEnums['String']>;
  createdAt?: Maybe<ScalarsEnums['timestamptz']>;
  currentChallenge?: Maybe<ScalarsEnums['String']>;
  defaultRole?: Maybe<ScalarsEnums['String']>;
  displayName?: Maybe<ScalarsEnums['String']>;
  email?: Maybe<ScalarsEnums['citext']>;
  id?: Maybe<ScalarsEnums['uuid']>;
  lastSeen?: Maybe<ScalarsEnums['timestamptz']>;
  locale?: Maybe<ScalarsEnums['String']>;
  newEmail?: Maybe<ScalarsEnums['citext']>;
  otpHash?: Maybe<ScalarsEnums['String']>;
  otpHashExpiresAt?: Maybe<ScalarsEnums['timestamptz']>;
  otpMethodLastUsed?: Maybe<ScalarsEnums['String']>;
  passwordHash?: Maybe<ScalarsEnums['String']>;
  phoneNumber?: Maybe<ScalarsEnums['String']>;
  ticket?: Maybe<ScalarsEnums['String']>;
  ticketExpiresAt?: Maybe<ScalarsEnums['timestamptz']>;
  totpSecret?: Maybe<ScalarsEnums['String']>;
  updatedAt?: Maybe<ScalarsEnums['timestamptz']>;
}

/**
 * response of any mutation on the table "auth.users"
 */
export interface users_mutation_response {
  __typename?: 'users_mutation_response';
  /**
   * number of rows affected by the mutation
   */
  affected_rows: ScalarsEnums['Int'];
  /**
   * data from the rows affected by the mutation
   */
  returning: Array<users>;
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
  authProviderRequests_constraint: authProviderRequests_constraint | undefined;
  authProviderRequests_select_column:
    | authProviderRequests_select_column
    | undefined;
  authProviderRequests_update_column:
    | authProviderRequests_update_column
    | undefined;
  authProviders_constraint: authProviders_constraint | undefined;
  authProviders_select_column: authProviders_select_column | undefined;
  authProviders_update_column: authProviders_update_column | undefined;
  authRefreshTokens_constraint: authRefreshTokens_constraint | undefined;
  authRefreshTokens_select_column: authRefreshTokens_select_column | undefined;
  authRefreshTokens_update_column: authRefreshTokens_update_column | undefined;
  authRoles_constraint: authRoles_constraint | undefined;
  authRoles_select_column: authRoles_select_column | undefined;
  authRoles_update_column: authRoles_update_column | undefined;
  authUserProviders_constraint: authUserProviders_constraint | undefined;
  authUserProviders_select_column: authUserProviders_select_column | undefined;
  authUserProviders_update_column: authUserProviders_update_column | undefined;
  authUserRoles_constraint: authUserRoles_constraint | undefined;
  authUserRoles_select_column: authUserRoles_select_column | undefined;
  authUserRoles_update_column: authUserRoles_update_column | undefined;
  authUserSecurityKeys_constraint: authUserSecurityKeys_constraint | undefined;
  authUserSecurityKeys_select_column:
    | authUserSecurityKeys_select_column
    | undefined;
  authUserSecurityKeys_update_column:
    | authUserSecurityKeys_update_column
    | undefined;
  buckets_constraint: buckets_constraint | undefined;
  buckets_select_column: buckets_select_column | undefined;
  buckets_update_column: buckets_update_column | undefined;
  cursor_ordering: cursor_ordering | undefined;
  fields_constraint: fields_constraint | undefined;
  fields_select_column: fields_select_column | undefined;
  fields_update_column: fields_update_column | undefined;
  files_constraint: files_constraint | undefined;
  files_select_column: files_select_column | undefined;
  files_select_column_files_aggregate_bool_exp_bool_and_arguments_columns:
    | files_select_column_files_aggregate_bool_exp_bool_and_arguments_columns
    | undefined;
  files_select_column_files_aggregate_bool_exp_bool_or_arguments_columns:
    | files_select_column_files_aggregate_bool_exp_bool_or_arguments_columns
    | undefined;
  files_update_column: files_update_column | undefined;
  members_constraint: members_constraint | undefined;
  members_select_column: members_select_column | undefined;
  members_select_column_members_aggregate_bool_exp_bool_and_arguments_columns:
    | members_select_column_members_aggregate_bool_exp_bool_and_arguments_columns
    | undefined;
  members_select_column_members_aggregate_bool_exp_bool_or_arguments_columns:
    | members_select_column_members_aggregate_bool_exp_bool_or_arguments_columns
    | undefined;
  members_update_column: members_update_column | undefined;
  mimes_constraint: mimes_constraint | undefined;
  mimes_select_column: mimes_select_column | undefined;
  mimes_update_column: mimes_update_column | undefined;
  nodes_constraint: nodes_constraint | undefined;
  nodes_select_column: nodes_select_column | undefined;
  nodes_select_column_nodes_aggregate_bool_exp_bool_and_arguments_columns:
    | nodes_select_column_nodes_aggregate_bool_exp_bool_and_arguments_columns
    | undefined;
  nodes_select_column_nodes_aggregate_bool_exp_bool_or_arguments_columns:
    | nodes_select_column_nodes_aggregate_bool_exp_bool_or_arguments_columns
    | undefined;
  nodes_update_column: nodes_update_column | undefined;
  order_by: order_by | undefined;
  permissions_constraint: permissions_constraint | undefined;
  permissions_select_column: permissions_select_column | undefined;
  permissions_select_column_permissions_aggregate_bool_exp_bool_and_arguments_columns:
    | permissions_select_column_permissions_aggregate_bool_exp_bool_and_arguments_columns
    | undefined;
  permissions_select_column_permissions_aggregate_bool_exp_bool_or_arguments_columns:
    | permissions_select_column_permissions_aggregate_bool_exp_bool_or_arguments_columns
    | undefined;
  permissions_update_column: permissions_update_column | undefined;
  relations_constraint: relations_constraint | undefined;
  relations_select_column: relations_select_column | undefined;
  relations_update_column: relations_update_column | undefined;
  users_constraint: users_constraint | undefined;
  users_select_column: users_select_column | undefined;
  users_select_column_users_aggregate_bool_exp_bool_and_arguments_columns:
    | users_select_column_users_aggregate_bool_exp_bool_and_arguments_columns
    | undefined;
  users_select_column_users_aggregate_bool_exp_bool_or_arguments_columns:
    | users_select_column_users_aggregate_bool_exp_bool_or_arguments_columns
    | undefined;
  users_update_column: users_update_column | undefined;
}
