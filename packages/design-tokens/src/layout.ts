export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  // Semantic aliases
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
} as const;

export const radius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
  pill: 9999,
} as const;

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(23, 36, 58, 0.05)',
  md: '0 4px 6px -1px rgba(23, 36, 58, 0.08), 0 2px 4px -1px rgba(23, 36, 58, 0.04)',
  lg: '0 10px 15px -3px rgba(23, 36, 58, 0.10), 0 4px 6px -2px rgba(23, 36, 58, 0.05)',
  xl: '0 20px 25px -5px rgba(23, 36, 58, 0.12), 0 10px 10px -5px rgba(23, 36, 58, 0.04)',
  darkSm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
  darkMd: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
  darkLg: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
} as const;

export const motion = {
  duration: {
    instant: 100,
    fast: 150,
    normal: 250,
    slow: 400,
    gentle: 600,
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
} as const;

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;
