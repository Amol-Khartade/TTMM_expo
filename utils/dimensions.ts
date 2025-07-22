import { Dimensions, ScaledSize } from 'react-native';

// Interface for dimensions
interface DimensionsType {
  width: number;
  height: number;
}

// Reference dimensions (based on a standard design size, e.g., iPhone 11)
const guidelineBaseWidth: number = 375;
const guidelineBaseHeight: number = 812;

// Store current dimensions
let currentDimensions: DimensionsType = Dimensions.get('window');

// Memoization caches
const wpCache: Map<string | number, number> = new Map();
const hpCache: Map<string | number, number> = new Map();
const scaleCache: Map<number, number> = new Map();
const verticalScaleCache: Map<number, number> = new Map();
const moderateScaleCache: Map<string, number> = new Map();

// Subscribe to dimension changes
const subscription = Dimensions.addEventListener(
  'change',
  ({ window }: { window: ScaledSize }) => {
    currentDimensions = { width: window.width, height: window.height };
    // Clear caches on dimension change to ensure accuracy
    wpCache.clear();
    hpCache.clear();
    scaleCache.clear();
    verticalScaleCache.clear();
    moderateScaleCache.clear();
  }
);

// Calculating scale factors
const scale = (size: number, dimensions: DimensionsType): number => {
  const cacheKey = size;
  if (scaleCache.has(cacheKey)) {
    return scaleCache.get(cacheKey)!;
  }
  const scaled = (dimensions.width / guidelineBaseWidth) * size;
  scaleCache.set(cacheKey, Math.round(scaled));
  return scaleCache.get(cacheKey)!;
};

const verticalScale = (size: number, dimensions: DimensionsType): number => {
  const cacheKey = size;
  if (verticalScaleCache.has(cacheKey)) {
    return verticalScaleCache.get(cacheKey)!;
  }
  const scaled = (dimensions.height / guidelineBaseHeight) * size;
  verticalScaleCache.set(cacheKey, Math.round(scaled));
  return verticalScaleCache.get(cacheKey)!;
};

// Parse percentage input (e.g., '4%' or 4)
const parsePercentage = (input: string | number): number => {
  if (typeof input === 'string' && input.endsWith('%')) {
    return parseFloat(input.replace('%', '')) || 0;
  }
  return typeof input === 'number' ? input : 0;
};

// Percentage-based width function
export const wp = (percentage: string | number): number => {
  const parsed = parsePercentage(percentage);
  const cacheKey = percentage;
  if (wpCache.has(cacheKey)) {
    return wpCache.get(cacheKey)!;
  }
  const value = (parsed * currentDimensions.width) / 100;
  wpCache.set(cacheKey, Math.round(value));
  return wpCache.get(cacheKey)!;
};

// Percentage-based height function
export const hp = (percentage: string | number): number => {
  const parsed = parsePercentage(percentage);
  const cacheKey = percentage;
  if (hpCache.has(cacheKey)) {
    return hpCache.get(cacheKey)!;
  }
  const value = (parsed * currentDimensions.height) / 100;
  hpCache.set(cacheKey, Math.round(value));
  return hpCache.get(cacheKey)!;
};

// Scale function for font sizes or other dimensions
export const scaleFont = (size: number): number => {
  return Math.round(scale(size, currentDimensions));
};

// Moderate scale for balanced scaling
export const moderateScale = (size: number, factor: number = 0.5): number => {
  const cacheKey = `${size}_${factor}`;
  if (moderateScaleCache.has(cacheKey)) {
    return moderateScaleCache.get(cacheKey)!;
  }
  const scaled = size + (scale(size, currentDimensions) - size) * factor;
  moderateScaleCache.set(cacheKey, Math.round(scaled));
  return moderateScaleCache.get(cacheKey)!;
};

// Cleanup subscription on module unload (optional, depends on environment)
export const cleanup = () => {
  subscription?.remove();
};
