/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type { ApiFromModules, FilterApi, FunctionReference, } from 'convex/server';
import type * as documents from '../documents.js';
import type * as http from '../http.js';
import type * as marketplace from '../marketplace.js';
import type * as notifications from '../notifications.js';
import type * as permissions from '../permissions.js';
import type * as projects from '../projects.js';
import type * as users from '../users.js';
import type * as verificationMessages from '../verificationMessages.js';
import type * as verifications from '../verifications.js';
import type * as verifier_assignment from '../verifier_assignment.js';
import type * as workflow from '../workflow.js';

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  documents: typeof documents;
  http: typeof http;
  marketplace: typeof marketplace;
  notifications: typeof notifications;
  permissions: typeof permissions;
  projects: typeof projects;
  users: typeof users;
  verificationMessages: typeof verificationMessages;
  verifications: typeof verifications;
  verifier_assignment: typeof verifier_assignment;
  workflow: typeof workflow;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, 'public'>
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, 'internal'>
>;
