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
import type * as alert_escalation from '../alert-escalation.js';
import type * as alert_generation from '../alert-generation.js';
import type * as alert_management from '../alert-management.js';
import type * as automated_monitoring from '../automated-monitoring.js';
import type * as crons from '../crons.js';
import type * as http from '../http.js';
import type * as impact_validation from '../impact-validation.js';
import type * as marketplace from '../marketplace.js';
import type * as monitoring_admin from '../monitoring-admin.js';
import type * as monitoring_auth from '../monitoring-auth.js';
import type * as monitoring_config from '../monitoring-config.js';
import type * as monitoring_index from '../monitoring-index.js';
import type * as monitoring_migration from '../monitoring-migration.js';
import type * as monitoring_utils from '../monitoring-utils.js';
import type * as monitoring from '../monitoring.js';
import type * as notifications from '../notifications.js';
import type * as progress_updates from '../progress-updates.js';
import type * as progress_validation from '../progress-validation.js';
import type * as project_validators from '../project-validators.js';
import type * as third_party_validation from '../third-party-validation.js';
import type * as trend_analysis from '../trend-analysis.js';
import type * as users from '../users.js';
import type * as validation_examples from '../validation-examples.js';

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  'alert-escalation': typeof alert_escalation;
  'alert-generation': typeof alert_generation;
  'alert-management': typeof alert_management;
  'automated-monitoring': typeof automated_monitoring;
  crons: typeof crons;
  http: typeof http;
  'impact-validation': typeof impact_validation;
  marketplace: typeof marketplace;
  'monitoring-admin': typeof monitoring_admin;
  'monitoring-auth': typeof monitoring_auth;
  'monitoring-config': typeof monitoring_config;
  'monitoring-index': typeof monitoring_index;
  'monitoring-migration': typeof monitoring_migration;
  'monitoring-utils': typeof monitoring_utils;
  monitoring: typeof monitoring;
  notifications: typeof notifications;
  'progress-updates': typeof progress_updates;
  'progress-validation': typeof progress_validation;
  'project-validators': typeof project_validators;
  'third-party-validation': typeof third_party_validation;
  'trend-analysis': typeof trend_analysis;
  users: typeof users;
  'validation-examples': typeof validation_examples;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, 'public'>
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, 'internal'>
>;
