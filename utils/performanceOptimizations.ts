import { useMemo, useCallback, useRef, useEffect } from 'react';

/**
 * Debounce hook for performance optimization
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Throttle hook for limiting function calls
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastCall = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      
      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        return callback(...args);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
          lastCall.current = Date.now();
          callback(...args);
        }, delay - (now - lastCall.current));
      }
    },
    [callback, delay]
  ) as T;
};

/**
 * Memoized selector hook for complex calculations
 */
export const useMemoizedSelector = <TState, TResult>(
  selector: (state: TState) => TResult,
  dependencies: any[]
): ((state: TState) => TResult) => {
  return useMemo(() => selector, dependencies);
};

/**
 * Cache hook for expensive operations
 */
export const useCache = <TKey, TValue>(
  maxSize: number = 100
): {
  get: (key: TKey) => TValue | undefined;
  set: (key: TKey, value: TValue) => void;
  has: (key: TKey) => boolean;
  clear: () => void;
  size: number;
} => {
  const cacheRef = useRef(new Map<TKey, TValue>());

  const get = useCallback((key: TKey) => {
    const cache = cacheRef.current;
    if (cache.has(key)) {
      // Move to end (most recently used)
      const value = cache.get(key)!;
      cache.delete(key);
      cache.set(key, value);
      return value;
    }
    return undefined;
  }, []);

  const set = useCallback((key: TKey, value: TValue) => {
    const cache = cacheRef.current;
    
    if (cache.has(key)) {
      // Update existing entry
      cache.delete(key);
    } else if (cache.size >= maxSize) {
      // Remove least recently used (first entry)
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    cache.set(key, value);
  }, [maxSize]);

  const has = useCallback((key: TKey) => {
    return cacheRef.current.has(key);
  }, []);

  const clear = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  return {
    get,
    set,
    has,
    clear,
    get size() {
      return cacheRef.current.size;
    },
  };
};

/**
 * Intersection Observer hook for lazy loading
 */
export const useIntersectionObserver = (
  callback: () => void,
  options?: IntersectionObserverInit
) => {
  const targetRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          callback();
        }
      },
      options
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [callback, options]);

  return targetRef;
};

/**
 * Virtual list utilities for large datasets
 */
export interface VirtualListItem {
  id: string;
  height?: number;
  data: any;
}

export const useVirtualList = <T extends VirtualListItem>(
  items: T[],
  containerHeight: number,
  itemHeight: number = 100,
  overscan: number = 5
) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return { startIndex, endIndex };
  }, [scrollTop, containerHeight, itemHeight, overscan, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1).map((item, index) => ({
      ...item,
      index: visibleRange.startIndex + index,
      offsetTop: (visibleRange.startIndex + index) * itemHeight,
    }));
  }, [items, visibleRange, itemHeight]);

  const totalHeight = items.length * itemHeight;

  return {
    visibleItems,
    totalHeight,
    visibleRange,
    setScrollTop,
  };
};

/**
 * Batch updates hook for multiple state changes
 */
export const useBatchedUpdates = () => {
  const [updates, setUpdates] = useState<(() => void)[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const batchUpdate = useCallback((updateFn: () => void) => {
    setUpdates(prev => [...prev, updateFn]);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setUpdates(currentUpdates => {
        currentUpdates.forEach(fn => fn());
        return [];
      });
    }, 0);
  }, []);

  return batchUpdate;
};

/**
 * Optimized list rendering with memoization
 */
export const createMemoizedListRenderer = <T>(
  renderItem: (item: T, index: number) => React.ReactElement,
  keyExtractor: (item: T, index: number) => string,
  areEqual?: (prevItem: T, nextItem: T) => boolean
) => {
  const MemoizedItem = React.memo<{ item: T; index: number }>(
    ({ item, index }) => renderItem(item, index),
    areEqual ? (prevProps, nextProps) => areEqual(prevProps.item, nextProps.item) : undefined
  );

  return {
    renderItem: ({ item, index }: { item: T; index: number }) => (
      <MemoizedItem key={keyExtractor(item, index)} item={item} index={index} />
    ),
    keyExtractor,
  };
};

/**
 * Memory management utilities
 */
export class MemoryManager {
  private static cache = new Map<string, any>();
  private static maxCacheSize = 1000;

  static set(key: string, value: any): void {
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  static get(key: string): any {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to end (LRU)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  static has(key: string): boolean {
    return this.cache.has(key);
  }

  static clear(): void {
    this.cache.clear();
  }

  static getSize(): number {
    return this.cache.size;
  }

  static cleanup(maxAge: number = 5 * 60 * 1000): void {
    const now = Date.now();
    const entriesToDelete: string[] = [];

    this.cache.forEach((value, key) => {
      if (value.timestamp && now - value.timestamp > maxAge) {
        entriesToDelete.push(key);
      }
    });

    entriesToDelete.forEach(key => this.cache.delete(key));
  }
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private static measurements = new Map<string, number>();

  static startMeasurement(name: string): void {
    this.measurements.set(name, Date.now());
  }

  static endMeasurement(name: string): number {
    const startTime = this.measurements.get(name);
    if (!startTime) {
      console.warn(`No measurement started for: ${name}`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.measurements.delete(name);
    
    if (__DEV__) {
      console.log(`⏱️ ${name}: ${duration}ms`);
    }

    return duration;
  }

  static measureAsync<T>(name: string, asyncFn: () => Promise<T>): Promise<T> {
    this.startMeasurement(name);
    return asyncFn().finally(() => {
      this.endMeasurement(name);
    });
  }

  static measureSync<T>(name: string, syncFn: () => T): T {
    this.startMeasurement(name);
    try {
      return syncFn();
    } finally {
      this.endMeasurement(name);
    }
  }
}

// Add missing import
import { useState } from 'react';