/**
 * React module with jittered useEffect for stress testing race conditions.
 *
 * This module wraps React's useEffect to add a random delay (0-2000ms) before
 * executing effect callbacks. This is used to expose race conditions in the
 * Para SDK that might not manifest under normal timing conditions.
 *
 * IMPORTANT: This should only be used for stress testing, never in production.
 */

import * as React from 'react';

// Store original useEffect
const originalUseEffect = React.useEffect;

// Create jittered version that adds random delay before executing effects
const useEffectWithJitter: typeof React.useEffect = (effect: React.EffectCallback, deps?: React.DependencyList) => {
  return originalUseEffect(() => {
    // Generate random jitter between 0-2000ms to make timing unpredictable
    const jitterMs = Math.floor(Math.random() * 2000);

    // Log the jitter for debugging
    console.log(`[useEffect Jitter] Delaying effect by ${jitterMs}ms`);

    // Flag and storage for cleanup
    let effectHasRun = false;
    let cleanupFn: ReturnType<React.EffectCallback>;

    // Set up delayed effect execution
    const timeoutId = setTimeout(() => {
      effectHasRun = true;
      console.log(`[useEffect Jitter] Executing effect after ${jitterMs}ms delay`);
      cleanupFn = effect();
    }, jitterMs);

    // Return cleanup function that runs immediately (no delay)
    return () => {
      // Clear timeout if effect hasn't run yet
      if (!effectHasRun) {
        clearTimeout(timeoutId);
      }

      // Call the effect's cleanup function if it exists and has been set
      if (effectHasRun && typeof cleanupFn === 'function') {
        cleanupFn();
      }
    };
  }, deps);
};

// Create a new React object with our jittered useEffect
const PatchedReact = {
  ...React,
  useEffect: useEffectWithJitter,
};

// Export default
export default PatchedReact;

// Export named with patched useEffect
export const useEffect = useEffectWithJitter;

// Re-export everything else from React
export const {
  Children,
  Component,
  Fragment,
  Profiler,
  PureComponent,
  StrictMode,
  Suspense,
  cloneElement,
  createContext,
  createElement,
  createRef,
  forwardRef,
  isValidElement,
  lazy,
  memo,
  startTransition,
  useCallback,
  useContext,
  useDebugValue,
  useDeferredValue,
  useId,
  useImperativeHandle,
  useInsertionEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
  version,
} = React;
