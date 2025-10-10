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
} from "convex/server";
import type * as alert_escalation from "../alert_escalation.js";
import type * as alert_generation from "../alert_generation.js";
import type * as alert_management from "../alert_management.js";
import type * as analytics from "../analytics.js";
import type * as analytics_dashboard_reports from "../analytics_dashboard_reports.js";
import type * as analytics_engine from "../analytics_engine.js";
import type * as automated_monitoring from "../automated_monitoring.js";
import type * as buyer_dashboard from "../buyer_dashboard.js";
import type * as buyer_impact_reports from "../buyer_impact_reports.js";
import type * as credit_batch_management from "../credit_batch_management.js";
import type * as credit_calculation from "../credit_calculation.js";
import type * as crons from "../crons.js";
import type * as documents from "../documents.js";
import type * as files from "../files.js";
import type * as fixed_pdf_generation from "../fixed_pdf_generation.js";
import type * as forum from "../forum.js";
import type * as http from "../http.js";
import type * as impact_validation from "../impact_validation.js";
import type * as learn from "../learn.js";
import type * as marketplace from "../marketplace.js";
import type * as monitoring from "../monitoring.js";
import type * as monitoring_admin from "../monitoring_admin.js";
import type * as monitoring_auth from "../monitoring_auth.js";
import type * as monitoring_config from "../monitoring_config.js";
import type * as monitoring_crud from "../monitoring_crud.js";
import type * as monitoring_index from "../monitoring_index.js";
import type * as monitoring_migration from "../monitoring_migration.js";
import type * as monitoring_utils from "../monitoring_utils.js";
import type * as notifications from "../notifications.js";
import type * as pdf_reports from "../pdf_reports.js";
import type * as permissions from "../permissions.js";
import type * as progress_updates from "../progress_updates.js";
import type * as progress_validation from "../progress_validation.js";
import type * as project_progress_reports from "../project_progress_reports.js";
import type * as project_validators from "../project_validators.js";
import type * as projects from "../projects.js";
import type * as report_template_engine from "../report_template_engine.js";
import type * as run_seed from "../run_seed.js";
import type * as third_party_validation from "../third_party_validation.js";
import type * as transactions from "../transactions.js";
import type * as trend_analysis from "../trend_analysis.js";
import type * as users from "../users.js";
import type * as validation_examples from "../validation_examples.js";
import type * as verificationMessages from "../verificationMessages.js";
import type * as verifications from "../verifications.js";
import type * as verifier_assignment from "../verifier_assignment.js";
import type * as viva_demo_seed from "../viva_demo_seed.js";
import type * as workflow from "../workflow.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  alert_escalation: typeof alert_escalation;
  alert_generation: typeof alert_generation;
  alert_management: typeof alert_management;
  analytics: typeof analytics;
  analytics_dashboard_reports: typeof analytics_dashboard_reports;
  analytics_engine: typeof analytics_engine;
  automated_monitoring: typeof automated_monitoring;
  buyer_dashboard: typeof buyer_dashboard;
  buyer_impact_reports: typeof buyer_impact_reports;
  credit_batch_management: typeof credit_batch_management;
  credit_calculation: typeof credit_calculation;
  crons: typeof crons;
  documents: typeof documents;
  files: typeof files;
  fixed_pdf_generation: typeof fixed_pdf_generation;
  forum: typeof forum;
  http: typeof http;
  impact_validation: typeof impact_validation;
  learn: typeof learn;
  marketplace: typeof marketplace;
  monitoring: typeof monitoring;
  monitoring_admin: typeof monitoring_admin;
  monitoring_auth: typeof monitoring_auth;
  monitoring_config: typeof monitoring_config;
  monitoring_crud: typeof monitoring_crud;
  monitoring_index: typeof monitoring_index;
  monitoring_migration: typeof monitoring_migration;
  monitoring_utils: typeof monitoring_utils;
  notifications: typeof notifications;
  pdf_reports: typeof pdf_reports;
  permissions: typeof permissions;
  progress_updates: typeof progress_updates;
  progress_validation: typeof progress_validation;
  project_progress_reports: typeof project_progress_reports;
  project_validators: typeof project_validators;
  projects: typeof projects;
  report_template_engine: typeof report_template_engine;
  run_seed: typeof run_seed;
  third_party_validation: typeof third_party_validation;
  transactions: typeof transactions;
  trend_analysis: typeof trend_analysis;
  users: typeof users;
  validation_examples: typeof validation_examples;
  verificationMessages: typeof verificationMessages;
  verifications: typeof verifications;
  verifier_assignment: typeof verifier_assignment;
  viva_demo_seed: typeof viva_demo_seed;
  workflow: typeof workflow;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
