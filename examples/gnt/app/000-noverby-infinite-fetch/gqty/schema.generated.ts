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
  jsonb: any;
  timestamptz: any;
  uuid: any;
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
export interface String_array_comparison_exp {
  /** is the array contained in the given array value */
  _contained_in?: InputMaybe<Array<Scalars['String']>>;
  /** does the array contain the given value */
  _contains?: InputMaybe<Array<Scalars['String']>>;
  _eq?: InputMaybe<Array<Scalars['String']>>;
  _gt?: InputMaybe<Array<Scalars['String']>>;
  _gte?: InputMaybe<Array<Scalars['String']>>;
  _in?: InputMaybe<Array<Array<Scalars['String']>>>;
  _is_null?: InputMaybe<Scalars['Boolean']>;
  _lt?: InputMaybe<Array<Scalars['String']>>;
  _lte?: InputMaybe<Array<Scalars['String']>>;
  _neq?: InputMaybe<Array<Scalars['String']>>;
  _nin?: InputMaybe<Array<Array<Scalars['String']>>>;
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

export interface checkUnique_nodes_args {
  mime?: InputMaybe<Scalars['String']>;
}

/** ordering argument of a cursor */
export enum cursor_ordering {
  /** ascending ordering of the cursor */
  ASC = 'ASC',
  /** descending ordering of the cursor */
  DESC = 'DESC',
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

/** order by aggregate values of table "members" */
export interface members_aggregate_order_by {
  count?: InputMaybe<order_by>;
  max?: InputMaybe<members_max_order_by>;
  min?: InputMaybe<members_min_order_by>;
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
  id?: InputMaybe<uuid_comparison_exp>;
  name?: InputMaybe<String_comparison_exp>;
  node?: InputMaybe<nodes_bool_exp>;
  nodeId?: InputMaybe<uuid_comparison_exp>;
  owner?: InputMaybe<Boolean_comparison_exp>;
  parent?: InputMaybe<nodes_bool_exp>;
  parentId?: InputMaybe<uuid_comparison_exp>;
  user?: InputMaybe<users_bool_exp>;
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

/** Ordering options when selecting data from "members". */
export interface members_order_by {
  accepted?: InputMaybe<order_by>;
  active?: InputMaybe<order_by>;
  email?: InputMaybe<order_by>;
  emailUser?: InputMaybe<users_order_by>;
  id?: InputMaybe<order_by>;
  name?: InputMaybe<order_by>;
  node?: InputMaybe<nodes_order_by>;
  nodeId?: InputMaybe<order_by>;
  owner?: InputMaybe<order_by>;
  parent?: InputMaybe<nodes_order_by>;
  parentId?: InputMaybe<order_by>;
  user?: InputMaybe<users_order_by>;
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
  id?: InputMaybe<Scalars['uuid']>;
  name?: InputMaybe<Scalars['String']>;
  nodeId?: InputMaybe<Scalars['uuid']>;
  owner?: InputMaybe<Scalars['Boolean']>;
  parentId?: InputMaybe<Scalars['uuid']>;
}

/** order by aggregate values of table "mimes" */
export interface mimes_aggregate_order_by {
  count?: InputMaybe<order_by>;
  max?: InputMaybe<mimes_max_order_by>;
  min?: InputMaybe<mimes_min_order_by>;
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
  getIndex?: InputMaybe<Int_comparison_exp>;
  id?: InputMaybe<uuid_comparison_exp>;
  index?: InputMaybe<Int_comparison_exp>;
  inserts?: InputMaybe<mimes_bool_exp>;
  isContextOwner?: InputMaybe<Boolean_comparison_exp>;
  isOwner?: InputMaybe<Boolean_comparison_exp>;
  key?: InputMaybe<String_comparison_exp>;
  members?: InputMaybe<members_bool_exp>;
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
  relations?: InputMaybe<relations_bool_exp>;
  updatedAt?: InputMaybe<timestamptz_comparison_exp>;
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

/** Ordering options when selecting data from "nodes". */
export interface nodes_order_by {
  attachable?: InputMaybe<order_by>;
  children_aggregate?: InputMaybe<nodes_aggregate_order_by>;
  context?: InputMaybe<nodes_order_by>;
  contextId?: InputMaybe<order_by>;
  contextOwners_aggregate?: InputMaybe<users_aggregate_order_by>;
  createdAt?: InputMaybe<order_by>;
  data?: InputMaybe<order_by>;
  getIndex?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  index?: InputMaybe<order_by>;
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
  updatedAt?: InputMaybe<order_by>;
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

/** order by aggregate values of table "permissions" */
export interface permissions_aggregate_order_by {
  count?: InputMaybe<order_by>;
  max?: InputMaybe<permissions_max_order_by>;
  min?: InputMaybe<permissions_min_order_by>;
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
  parents?: InputMaybe<String_array_comparison_exp>;
  role?: InputMaybe<String_comparison_exp>;
  select?: InputMaybe<Boolean_comparison_exp>;
  update?: InputMaybe<Boolean_comparison_exp>;
}

/** order by max() on columns of table "permissions" */
export interface permissions_max_order_by {
  contextId?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  mimeId?: InputMaybe<order_by>;
  nodeId?: InputMaybe<order_by>;
  parents?: InputMaybe<order_by>;
  role?: InputMaybe<order_by>;
}

/** order by min() on columns of table "permissions" */
export interface permissions_min_order_by {
  contextId?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  mimeId?: InputMaybe<order_by>;
  nodeId?: InputMaybe<order_by>;
  parents?: InputMaybe<order_by>;
  role?: InputMaybe<order_by>;
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
  parents?: InputMaybe<Array<Scalars['String']>>;
  role?: InputMaybe<Scalars['String']>;
  select?: InputMaybe<Scalars['Boolean']>;
  update?: InputMaybe<Scalars['Boolean']>;
}

export interface relation_nodes_args {
  relation_name?: InputMaybe<Scalars['String']>;
}

/** order by aggregate values of table "relations" */
export interface relations_aggregate_order_by {
  count?: InputMaybe<order_by>;
  max?: InputMaybe<relations_max_order_by>;
  min?: InputMaybe<relations_min_order_by>;
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

/** Ordering options when selecting data from "relations". */
export interface relations_order_by {
  id?: InputMaybe<order_by>;
  name?: InputMaybe<order_by>;
  node?: InputMaybe<nodes_order_by>;
  nodeId?: InputMaybe<order_by>;
  parent?: InputMaybe<nodes_order_by>;
  parentId?: InputMaybe<order_by>;
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

/** order by aggregate values of table "auth.users" */
export interface users_aggregate_order_by {
  count?: InputMaybe<order_by>;
  max?: InputMaybe<users_max_order_by>;
  min?: InputMaybe<users_min_order_by>;
}

/** Boolean expression to filter rows from the table "auth.users". All fields are combined with a logical 'AND'. */
export interface users_bool_exp {
  _and?: InputMaybe<Array<users_bool_exp>>;
  _not?: InputMaybe<users_bool_exp>;
  _or?: InputMaybe<Array<users_bool_exp>>;
  displayName?: InputMaybe<String_comparison_exp>;
  id?: InputMaybe<uuid_comparison_exp>;
  memberships?: InputMaybe<members_bool_exp>;
}

/** order by max() on columns of table "auth.users" */
export interface users_max_order_by {
  displayName?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
}

/** order by min() on columns of table "auth.users" */
export interface users_min_order_by {
  displayName?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
}

/** Ordering options when selecting data from "auth.users". */
export interface users_order_by {
  displayName?: InputMaybe<order_by>;
  id?: InputMaybe<order_by>;
  memberships_aggregate?: InputMaybe<members_aggregate_order_by>;
}

/** select columns of table "auth.users" */
export enum users_select_column {
  /** column name */
  displayName = 'displayName',
  /** column name */
  id = 'id',
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
  displayName?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['uuid']>;
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
  cursor_ordering: true,
  jsonb: true,
  members_select_column: true,
  mimes_select_column: true,
  nodes_select_column: true,
  nodes_select_column_nodes_aggregate_bool_exp_bool_and_arguments_columns: true,
  nodes_select_column_nodes_aggregate_bool_exp_bool_or_arguments_columns: true,
  order_by: true,
  permissions_select_column: true,
  relations_select_column: true,
  timestamptz: true,
  users_select_column: true,
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
  String_array_comparison_exp: {
    _contained_in: { __type: '[String!]' },
    _contains: { __type: '[String!]' },
    _eq: { __type: '[String!]' },
    _gt: { __type: '[String!]' },
    _gte: { __type: '[String!]' },
    _in: { __type: '[[String!]!]' },
    _is_null: { __type: 'Boolean' },
    _lt: { __type: '[String!]' },
    _lte: { __type: '[String!]' },
    _neq: { __type: '[String!]' },
    _nin: { __type: '[[String!]!]' },
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
  checkUnique_nodes_args: { mime: { __type: 'String' } },
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
    id: { __type: 'uuid!' },
    name: { __type: 'String' },
    node: { __type: 'nodes' },
    nodeId: { __type: 'uuid' },
    owner: { __type: 'Boolean!' },
    parent: { __type: 'nodes' },
    parentId: { __type: 'uuid!' },
    user: { __type: 'users' },
  },
  members_aggregate_order_by: {
    count: { __type: 'order_by' },
    max: { __type: 'members_max_order_by' },
    min: { __type: 'members_min_order_by' },
  },
  members_bool_exp: {
    _and: { __type: '[members_bool_exp!]' },
    _not: { __type: 'members_bool_exp' },
    _or: { __type: '[members_bool_exp!]' },
    accepted: { __type: 'Boolean_comparison_exp' },
    active: { __type: 'Boolean_comparison_exp' },
    email: { __type: 'String_comparison_exp' },
    emailUser: { __type: 'users_bool_exp' },
    id: { __type: 'uuid_comparison_exp' },
    name: { __type: 'String_comparison_exp' },
    node: { __type: 'nodes_bool_exp' },
    nodeId: { __type: 'uuid_comparison_exp' },
    owner: { __type: 'Boolean_comparison_exp' },
    parent: { __type: 'nodes_bool_exp' },
    parentId: { __type: 'uuid_comparison_exp' },
    user: { __type: 'users_bool_exp' },
  },
  members_max_order_by: {
    email: { __type: 'order_by' },
    id: { __type: 'order_by' },
    name: { __type: 'order_by' },
    nodeId: { __type: 'order_by' },
    parentId: { __type: 'order_by' },
  },
  members_min_order_by: {
    email: { __type: 'order_by' },
    id: { __type: 'order_by' },
    name: { __type: 'order_by' },
    nodeId: { __type: 'order_by' },
    parentId: { __type: 'order_by' },
  },
  members_order_by: {
    accepted: { __type: 'order_by' },
    active: { __type: 'order_by' },
    email: { __type: 'order_by' },
    emailUser: { __type: 'users_order_by' },
    id: { __type: 'order_by' },
    name: { __type: 'order_by' },
    node: { __type: 'nodes_order_by' },
    nodeId: { __type: 'order_by' },
    owner: { __type: 'order_by' },
    parent: { __type: 'nodes_order_by' },
    parentId: { __type: 'order_by' },
    user: { __type: 'users_order_by' },
  },
  members_stream_cursor_input: {
    initial_value: { __type: 'members_stream_cursor_value_input!' },
    ordering: { __type: 'cursor_ordering' },
  },
  members_stream_cursor_value_input: {
    accepted: { __type: 'Boolean' },
    active: { __type: 'Boolean' },
    email: { __type: 'String' },
    id: { __type: 'uuid' },
    name: { __type: 'String' },
    nodeId: { __type: 'uuid' },
    owner: { __type: 'Boolean' },
    parentId: { __type: 'uuid' },
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
  mimes_aggregate_order_by: {
    count: { __type: 'order_by' },
    max: { __type: 'mimes_max_order_by' },
    min: { __type: 'mimes_min_order_by' },
  },
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
  mimes_max_order_by: {
    icon: { __type: 'order_by' },
    id: { __type: 'order_by' },
  },
  mimes_min_order_by: {
    icon: { __type: 'order_by' },
    id: { __type: 'order_by' },
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
  mutation: {},
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
    getIndex: { __type: 'Int' },
    id: { __type: 'uuid!' },
    index: { __type: 'Int!' },
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
  nodes_avg_fields: {
    __typename: { __type: 'String!' },
    getIndex: { __type: 'Int' },
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
    getIndex: { __type: 'Int_comparison_exp' },
    id: { __type: 'uuid_comparison_exp' },
    index: { __type: 'Int_comparison_exp' },
    inserts: { __type: 'mimes_bool_exp' },
    isContextOwner: { __type: 'Boolean_comparison_exp' },
    isOwner: { __type: 'Boolean_comparison_exp' },
    key: { __type: 'String_comparison_exp' },
    members: { __type: 'members_bool_exp' },
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
    relations: { __type: 'relations_bool_exp' },
    updatedAt: { __type: 'timestamptz_comparison_exp' },
  },
  nodes_max_fields: {
    __typename: { __type: 'String!' },
    contextId: { __type: 'uuid' },
    createdAt: { __type: 'timestamptz' },
    getIndex: { __type: 'Int' },
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
    getIndex: { __type: 'Int' },
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
  nodes_order_by: {
    attachable: { __type: 'order_by' },
    children_aggregate: { __type: 'nodes_aggregate_order_by' },
    context: { __type: 'nodes_order_by' },
    contextId: { __type: 'order_by' },
    contextOwners_aggregate: { __type: 'users_aggregate_order_by' },
    createdAt: { __type: 'order_by' },
    data: { __type: 'order_by' },
    getIndex: { __type: 'order_by' },
    id: { __type: 'order_by' },
    index: { __type: 'order_by' },
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
    updatedAt: { __type: 'order_by' },
  },
  nodes_stddev_fields: {
    __typename: { __type: 'String!' },
    getIndex: { __type: 'Int' },
    index: { __type: 'Float' },
  },
  nodes_stddev_order_by: { index: { __type: 'order_by' } },
  nodes_stddev_pop_fields: {
    __typename: { __type: 'String!' },
    getIndex: { __type: 'Int' },
    index: { __type: 'Float' },
  },
  nodes_stddev_pop_order_by: { index: { __type: 'order_by' } },
  nodes_stddev_samp_fields: {
    __typename: { __type: 'String!' },
    getIndex: { __type: 'Int' },
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
    getIndex: { __type: 'Int' },
    index: { __type: 'Int' },
  },
  nodes_sum_order_by: { index: { __type: 'order_by' } },
  nodes_var_pop_fields: {
    __typename: { __type: 'String!' },
    getIndex: { __type: 'Int' },
    index: { __type: 'Float' },
  },
  nodes_var_pop_order_by: { index: { __type: 'order_by' } },
  nodes_var_samp_fields: {
    __typename: { __type: 'String!' },
    getIndex: { __type: 'Int' },
    index: { __type: 'Float' },
  },
  nodes_var_samp_order_by: { index: { __type: 'order_by' } },
  nodes_variance_fields: {
    __typename: { __type: 'String!' },
    getIndex: { __type: 'Int' },
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
    parents: { __type: '[String!]' },
    role: { __type: 'String!' },
    select: { __type: 'Boolean!' },
    update: { __type: 'Boolean!' },
  },
  permissions_aggregate_order_by: {
    count: { __type: 'order_by' },
    max: { __type: 'permissions_max_order_by' },
    min: { __type: 'permissions_min_order_by' },
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
    parents: { __type: 'String_array_comparison_exp' },
    role: { __type: 'String_comparison_exp' },
    select: { __type: 'Boolean_comparison_exp' },
    update: { __type: 'Boolean_comparison_exp' },
  },
  permissions_max_order_by: {
    contextId: { __type: 'order_by' },
    id: { __type: 'order_by' },
    mimeId: { __type: 'order_by' },
    nodeId: { __type: 'order_by' },
    parents: { __type: 'order_by' },
    role: { __type: 'order_by' },
  },
  permissions_min_order_by: {
    contextId: { __type: 'order_by' },
    id: { __type: 'order_by' },
    mimeId: { __type: 'order_by' },
    nodeId: { __type: 'order_by' },
    parents: { __type: 'order_by' },
    role: { __type: 'order_by' },
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
    parents: { __type: '[String!]' },
    role: { __type: 'String' },
    select: { __type: 'Boolean' },
    update: { __type: 'Boolean' },
  },
  query: {
    __typename: { __type: 'String!' },
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
  relations_aggregate_order_by: {
    count: { __type: 'order_by' },
    max: { __type: 'relations_max_order_by' },
    min: { __type: 'relations_min_order_by' },
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
  relations_max_order_by: {
    id: { __type: 'order_by' },
    name: { __type: 'order_by' },
    nodeId: { __type: 'order_by' },
    parentId: { __type: 'order_by' },
  },
  relations_min_order_by: {
    id: { __type: 'order_by' },
    name: { __type: 'order_by' },
    nodeId: { __type: 'order_by' },
    parentId: { __type: 'order_by' },
  },
  relations_order_by: {
    id: { __type: 'order_by' },
    name: { __type: 'order_by' },
    node: { __type: 'nodes_order_by' },
    nodeId: { __type: 'order_by' },
    parent: { __type: 'nodes_order_by' },
    parentId: { __type: 'order_by' },
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
  subscription: {
    __typename: { __type: 'String!' },
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
    displayName: { __type: 'String!' },
    id: { __type: 'uuid!' },
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
  },
  users_aggregate_order_by: {
    count: { __type: 'order_by' },
    max: { __type: 'users_max_order_by' },
    min: { __type: 'users_min_order_by' },
  },
  users_bool_exp: {
    _and: { __type: '[users_bool_exp!]' },
    _not: { __type: 'users_bool_exp' },
    _or: { __type: '[users_bool_exp!]' },
    displayName: { __type: 'String_comparison_exp' },
    id: { __type: 'uuid_comparison_exp' },
    memberships: { __type: 'members_bool_exp' },
  },
  users_max_order_by: {
    displayName: { __type: 'order_by' },
    id: { __type: 'order_by' },
  },
  users_min_order_by: {
    displayName: { __type: 'order_by' },
    id: { __type: 'order_by' },
  },
  users_order_by: {
    displayName: { __type: 'order_by' },
    id: { __type: 'order_by' },
    memberships_aggregate: { __type: 'members_aggregate_order_by' },
  },
  users_stream_cursor_input: {
    initial_value: { __type: 'users_stream_cursor_value_input!' },
    ordering: { __type: 'cursor_ordering' },
  },
  users_stream_cursor_value_input: {
    displayName: { __type: 'String' },
    id: { __type: 'uuid' },
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

export interface Mutation {
  __typename?: 'Mutation';
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
   * A computed field, executes function "get_index"
   */
  getIndex?: Maybe<ScalarsEnums['Int']>;
  id: ScalarsEnums['uuid'];
  index: ScalarsEnums['Int'];
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
  /**
   * A computed field, executes function "get_index"
   */
  getIndex?: Maybe<ScalarsEnums['Int']>;
  index?: Maybe<ScalarsEnums['Float']>;
}

/**
 * aggregate max on columns
 */
export interface nodes_max_fields {
  __typename?: 'nodes_max_fields';
  contextId?: Maybe<ScalarsEnums['uuid']>;
  createdAt?: Maybe<ScalarsEnums['timestamptz']>;
  /**
   * A computed field, executes function "get_index"
   */
  getIndex?: Maybe<ScalarsEnums['Int']>;
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
  /**
   * A computed field, executes function "get_index"
   */
  getIndex?: Maybe<ScalarsEnums['Int']>;
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
 * aggregate stddev on columns
 */
export interface nodes_stddev_fields {
  __typename?: 'nodes_stddev_fields';
  /**
   * A computed field, executes function "get_index"
   */
  getIndex?: Maybe<ScalarsEnums['Int']>;
  index?: Maybe<ScalarsEnums['Float']>;
}

/**
 * aggregate stddev_pop on columns
 */
export interface nodes_stddev_pop_fields {
  __typename?: 'nodes_stddev_pop_fields';
  /**
   * A computed field, executes function "get_index"
   */
  getIndex?: Maybe<ScalarsEnums['Int']>;
  index?: Maybe<ScalarsEnums['Float']>;
}

/**
 * aggregate stddev_samp on columns
 */
export interface nodes_stddev_samp_fields {
  __typename?: 'nodes_stddev_samp_fields';
  /**
   * A computed field, executes function "get_index"
   */
  getIndex?: Maybe<ScalarsEnums['Int']>;
  index?: Maybe<ScalarsEnums['Float']>;
}

/**
 * aggregate sum on columns
 */
export interface nodes_sum_fields {
  __typename?: 'nodes_sum_fields';
  /**
   * A computed field, executes function "get_index"
   */
  getIndex?: Maybe<ScalarsEnums['Int']>;
  index?: Maybe<ScalarsEnums['Int']>;
}

/**
 * aggregate var_pop on columns
 */
export interface nodes_var_pop_fields {
  __typename?: 'nodes_var_pop_fields';
  /**
   * A computed field, executes function "get_index"
   */
  getIndex?: Maybe<ScalarsEnums['Int']>;
  index?: Maybe<ScalarsEnums['Float']>;
}

/**
 * aggregate var_samp on columns
 */
export interface nodes_var_samp_fields {
  __typename?: 'nodes_var_samp_fields';
  /**
   * A computed field, executes function "get_index"
   */
  getIndex?: Maybe<ScalarsEnums['Int']>;
  index?: Maybe<ScalarsEnums['Float']>;
}

/**
 * aggregate variance on columns
 */
export interface nodes_variance_fields {
  __typename?: 'nodes_variance_fields';
  /**
   * A computed field, executes function "get_index"
   */
  getIndex?: Maybe<ScalarsEnums['Int']>;
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
  parents?: Maybe<Array<ScalarsEnums['String']>>;
  role: ScalarsEnums['String'];
  select: ScalarsEnums['Boolean'];
  update: ScalarsEnums['Boolean'];
}

export interface Query {
  __typename?: 'Query';
  member: (args: { id: Scalars['uuid'] }) => Maybe<members>;
  members: (args?: {
    distinct_on?: Maybe<Array<members_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<members_order_by>>;
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
  relation: (args: { id: Scalars['uuid'] }) => Maybe<relations>;
  relations: (args?: {
    distinct_on?: Maybe<Array<relations_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<relations_order_by>>;
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

export interface Subscription {
  __typename?: 'Subscription';
  member: (args: { id: Scalars['uuid'] }) => Maybe<members>;
  members: (args?: {
    distinct_on?: Maybe<Array<members_select_column>>;
    limit?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    order_by?: Maybe<Array<members_order_by>>;
    where?: Maybe<members_bool_exp>;
  }) => Array<members>;
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
  displayName: ScalarsEnums['String'];
  id: ScalarsEnums['uuid'];
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
  cursor_ordering: cursor_ordering | undefined;
  members_select_column: members_select_column | undefined;
  mimes_select_column: mimes_select_column | undefined;
  nodes_select_column: nodes_select_column | undefined;
  nodes_select_column_nodes_aggregate_bool_exp_bool_and_arguments_columns:
    | nodes_select_column_nodes_aggregate_bool_exp_bool_and_arguments_columns
    | undefined;
  nodes_select_column_nodes_aggregate_bool_exp_bool_or_arguments_columns:
    | nodes_select_column_nodes_aggregate_bool_exp_bool_or_arguments_columns
    | undefined;
  order_by: order_by | undefined;
  permissions_select_column: permissions_select_column | undefined;
  relations_select_column: relations_select_column | undefined;
  users_select_column: users_select_column | undefined;
}
