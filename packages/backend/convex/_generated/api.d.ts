/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from 'convex/server';
import type * as crons from '../crons.js';
import type * as http from '../http.js';
import type * as marketplace from '../marketplace.js';
import type * as monitoring_auth from '../monitoring-auth.js';
import type * as monitoring_config from '../monitoring-config.js';
import type * as monitoring_index from '../monitoring-index.js';
import type * as monitoring_migration from '../monitoring-migration.js';
import type * as monitoring_utils from '../monitoring-utils.js';
import type * as monitoring from '../monitoring.js';
import type * as users from '../users.js';

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  crons: typeof crons;
  http: typeof http;
  marketplace: typeof marketplace;
  'monitoring-auth': typeof monitoring_auth;
  'monitoring-config': typeof monitoring_config;
  'monitoring-index': typeof monitoring_index;
  'monitoring-migration': typeof monitoring_migration;
  'monitoring-utils': typeof monitoring_utils;
  monitoring: typeof monitoring;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, 'public'>
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, 'internal'>
>;
