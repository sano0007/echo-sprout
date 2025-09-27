'use client';

import { useCallback, useEffect, useRef } from 'react';

import type { AuditCategory, AuditEntry, AuditEventType } from './types';

interface UserActionTrackerProps {
  userId: string;
  userName: string;
  userRole: string;
  verificationId?: string;
  projectId?: string;
  onActionTracked?: (action: AuditEntry) => void;
  enableMouseTracking?: boolean;
  enableKeyboardTracking?: boolean;
  enableFormTracking?: boolean;
  enableNavigationTracking?: boolean;
  enablePerformanceTracking?: boolean;
}

interface ActionContext {
  page: string;
  section?: string;
  component?: string;
  elementId?: string;
  elementType?: string;
  elementText?: string;
}

export function UserActionTracker({
  userId,
  userName,
  userRole,
  verificationId,
  projectId,
  onActionTracked,
  enableMouseTracking = true,
  enableKeyboardTracking = true,
  enableFormTracking = true,
  enableNavigationTracking = true,
  enablePerformanceTracking = true,
}: UserActionTrackerProps) {
  const sessionStartTime = useRef(Date.now());
  const lastActionTime = useRef(Date.now());
  const actionQueue = useRef<AuditEntry[]>([]);
  const performanceObserver = useRef<PerformanceObserver | null>(null);

  const getCurrentContext = useCallback((): ActionContext => {
    const pathname = window.location.pathname;
    const hash = window.location.hash;

    return {
      page: pathname,
      section: hash ? hash.substring(1) : undefined,
      component:
        document.activeElement
          ?.closest('[data-component]')
          ?.getAttribute('data-component') || undefined,
    };
  }, []);

  const createAuditEntry = useCallback(
    (
      action: string,
      description: string,
      type: AuditEventType,
      category: AuditCategory,
      severity: 'low' | 'medium' | 'high' | 'critical' = 'low',
      metadata: any = {},
      duration?: number
    ): AuditEntry => {
      const timestamp = Date.now();
      const context = getCurrentContext();

      return {
        id: `audit_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp,
        type,
        category,
        action,
        description,
        userId,
        userName,
        userRole,
        userIp: undefined, // Would be set by backend
        userAgent: navigator.userAgent,
        entityId: verificationId || projectId || 'unknown',
        entityType: verificationId
          ? 'verification'
          : projectId
            ? 'project'
            : 'user',
        metadata: {
          ...metadata,
          previousValue: undefined,
          newValue: undefined,
          location: context,
          sessionDuration: timestamp - sessionStartTime.current,
          timeSinceLastAction: timestamp - lastActionTime.current,
        },
        severity,
        status: 'success',
        duration,
        location: context,
      };
    },
    [userId, userName, userRole, verificationId, projectId, getCurrentContext]
  );

  const trackAction = useCallback(
    (auditEntry: AuditEntry) => {
      lastActionTime.current = auditEntry.timestamp;
      actionQueue.current.push(auditEntry);
      onActionTracked?.(auditEntry);

      // Batch send actions every 5 seconds or when queue reaches 10 items
      if (actionQueue.current.length >= 10) {
        // In a real implementation, you would send these to your backend
        console.log('Sending batch of audit entries:', actionQueue.current);
        actionQueue.current = [];
      }
    },
    [onActionTracked]
  );

  // Mouse tracking
  useEffect(() => {
    if (!enableMouseTracking) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      const elementText = target.textContent?.substring(0, 50) || '';
      const elementId = target.id || target.className || '';

      let action = 'Click';
      let category: AuditCategory = 'data_access';

      if (tagName === 'button') {
        action = 'Button Click';
        category = 'data_access';
      } else if (tagName === 'a') {
        action = 'Link Click';
        category = 'data_access';
      } else if (['input', 'textarea', 'select'].includes(tagName)) {
        action = 'Form Element Click';
        category = 'data_access';
      }

      const auditEntry = createAuditEntry(
        action,
        `User clicked on ${tagName} element: ${elementText}`,
        'user_action',
        category,
        'low',
        {
          elementType: tagName,
          elementId,
          elementText,
          clickPosition: { x: event.clientX, y: event.clientY },
        }
      );

      trackAction(auditEntry);
    };

    const handleDoubleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      const elementText = target.textContent?.substring(0, 50) || '';

      const auditEntry = createAuditEntry(
        'Double Click',
        `User double-clicked on ${tagName} element: ${elementText}`,
        'user_action',
        'data_access',
        'low',
        {
          elementType: tagName,
          elementText,
        }
      );

      trackAction(auditEntry);
    };

    const handleRightClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();

      const auditEntry = createAuditEntry(
        'Right Click',
        `User right-clicked on ${tagName} element`,
        'user_action',
        'data_access',
        'low',
        {
          elementType: tagName,
        }
      );

      trackAction(auditEntry);
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('dblclick', handleDoubleClick);
    document.addEventListener('contextmenu', handleRightClick);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('dblclick', handleDoubleClick);
      document.removeEventListener('contextmenu', handleRightClick);
    };
  }, [enableMouseTracking, createAuditEntry, trackAction]);

  // Keyboard tracking
  useEffect(() => {
    if (!enableKeyboardTracking) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      const key = event.key;
      const isSpecialKey = [
        'Enter',
        'Escape',
        'Tab',
        'Delete',
        'Backspace',
      ].includes(key);
      const isModifier = event.ctrlKey || event.altKey || event.metaKey;

      if (isSpecialKey || isModifier) {
        let action = 'Key Press';
        let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';

        if (key === 'Delete' || key === 'Backspace') {
          action = 'Delete Action';
          severity = 'medium';
        } else if (isModifier) {
          action = 'Keyboard Shortcut';
          severity = 'medium';
        }

        const auditEntry = createAuditEntry(
          action,
          `User pressed ${key} key${isModifier ? ' with modifiers' : ''} on ${tagName} element`,
          'user_action',
          'data_access',
          severity,
          {
            key,
            elementType: tagName,
            ctrlKey: event.ctrlKey,
            altKey: event.altKey,
            metaKey: event.metaKey,
            shiftKey: event.shiftKey,
          }
        );

        trackAction(auditEntry);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enableKeyboardTracking, createAuditEntry, trackAction]);

  // Form tracking
  useEffect(() => {
    if (!enableFormTracking) return;

    const handleFormSubmit = (event: Event) => {
      const form = event.target as HTMLFormElement;
      const formData = new FormData(form);
      const fields = Array.from(formData.keys());

      const auditEntry = createAuditEntry(
        'Form Submit',
        `User submitted form with ${fields.length} fields`,
        'user_action',
        'data_access',
        'medium',
        {
          formId: form.id,
          formName: form.name,
          fieldCount: fields.length,
          fields: fields,
        }
      );

      trackAction(auditEntry);
    };

    const handleInputChange = (event: Event) => {
      const input = event.target as HTMLInputElement;
      const inputType = input.type;
      const inputName = input.name || input.id;

      // Only track significant changes, not every keystroke
      if (
        ['checkbox', 'radio', 'select'].includes(inputType) ||
        input.type === 'file'
      ) {
        const auditEntry = createAuditEntry(
          'Form Input Change',
          `User changed ${inputType} input: ${inputName}`,
          'data_change',
          'data_access',
          'low',
          {
            inputName,
            inputType,
            newValue:
              input.type === 'file' ? input.files?.[0]?.name : input.value,
          }
        );

        trackAction(auditEntry);
      }
    };

    document.addEventListener('submit', handleFormSubmit);
    document.addEventListener('change', handleInputChange);

    return () => {
      document.removeEventListener('submit', handleFormSubmit);
      document.removeEventListener('change', handleInputChange);
    };
  }, [enableFormTracking, createAuditEntry, trackAction]);

  // Navigation tracking
  useEffect(() => {
    if (!enableNavigationTracking) return;

    const handlePopState = () => {
      const auditEntry = createAuditEntry(
        'Page Navigation',
        `User navigated to ${window.location.pathname}`,
        'user_action',
        'data_access',
        'low',
        {
          url: window.location.href,
          pathname: window.location.pathname,
          search: window.location.search,
          hash: window.location.hash,
        }
      );

      trackAction(auditEntry);
    };

    const handleBeforeUnload = () => {
      const sessionDuration = Date.now() - sessionStartTime.current;
      const auditEntry = createAuditEntry(
        'Page Unload',
        `User left page after ${Math.round(sessionDuration / 1000)} seconds`,
        'user_action',
        'data_access',
        'low',
        {
          sessionDuration,
          totalActions: actionQueue.current.length,
        }
      );

      trackAction(auditEntry);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enableNavigationTracking, createAuditEntry, trackAction]);

  // Performance tracking
  useEffect(() => {
    if (!enablePerformanceTracking || !window.PerformanceObserver) return;

    performanceObserver.current = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          const auditEntry = createAuditEntry(
            'Page Load Performance',
            `Page loaded in ${Math.round(navEntry.loadEventEnd - navEntry.navigationStart)}ms`,
            'system_event',
            'performance',
            'low',
            {
              loadTime: navEntry.loadEventEnd - navEntry.navigationStart,
              domContentLoaded:
                navEntry.domContentLoadedEventEnd - navEntry.navigationStart,
              responseTime: navEntry.responseEnd - navEntry.requestStart,
            }
          );

          trackAction(auditEntry);
        }

        if (entry.entryType === 'largest-contentful-paint') {
          const lcpEntry = entry as PerformanceEntry;
          const auditEntry = createAuditEntry(
            'Largest Contentful Paint',
            `LCP occurred at ${Math.round(lcpEntry.startTime)}ms`,
            'system_event',
            'performance',
            lcpEntry.startTime > 2500
              ? 'high'
              : lcpEntry.startTime > 1000
                ? 'medium'
                : 'low',
            {
              lcp: lcpEntry.startTime,
            }
          );

          trackAction(auditEntry);
        }
      }
    });

    performanceObserver.current.observe({
      entryTypes: ['navigation', 'largest-contentful-paint'],
    });

    return () => {
      performanceObserver.current?.disconnect();
    };
  }, [enablePerformanceTracking, createAuditEntry, trackAction]);

  // Session tracking
  useEffect(() => {
    const auditEntry = createAuditEntry(
      'Session Start',
      'User session started',
      'user_action',
      'authentication',
      'low',
      {
        sessionId: sessionStartTime.current.toString(),
        userAgent: navigator.userAgent,
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }
    );

    trackAction(auditEntry);

    // Periodic heartbeat to track session activity
    const heartbeatInterval = setInterval(() => {
      const auditEntry = createAuditEntry(
        'Session Heartbeat',
        'User session active',
        'user_action',
        'authentication',
        'low',
        {
          sessionDuration: Date.now() - sessionStartTime.current,
          actionsPerformed: actionQueue.current.length,
        }
      );

      trackAction(auditEntry);
    }, 300000); // Every 5 minutes

    return () => {
      clearInterval(heartbeatInterval);

      // Flush remaining actions
      if (actionQueue.current.length > 0) {
        console.log('Flushing remaining audit entries:', actionQueue.current);
        actionQueue.current = [];
      }
    };
  }, [createAuditEntry, trackAction]);

  // Error tracking
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const auditEntry = createAuditEntry(
        'JavaScript Error',
        `Error: ${event.message}`,
        'error',
        'error_handling',
        'high',
        {
          errorMessage: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack,
        }
      );

      trackAction(auditEntry);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const auditEntry = createAuditEntry(
        'Unhandled Promise Rejection',
        `Promise rejection: ${event.reason}`,
        'error',
        'error_handling',
        'high',
        {
          reason: String(event.reason),
        }
      );

      trackAction(auditEntry);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener(
        'unhandledrejection',
        handleUnhandledRejection
      );
    };
  }, [createAuditEntry, trackAction]);

  return null; // This component doesn't render anything
}
