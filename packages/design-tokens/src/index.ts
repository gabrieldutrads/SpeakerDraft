export * from './colors';
export * from './typography';
export * from './layout';
export * from './css-variables';

// Legacy compatibility aliases for existing prototype
import { lightTheme } from './colors';
import { fontFamilies, fontSizes } from './typography';
import { spacing as layoutSpacing, radius as layoutRadius, breakpoints as layoutBreakpoints } from './layout';

export const colors = {
  text: lightTheme.textPrimary,
  background: lightTheme.background,
  primary: lightTheme.primary,
  muted: lightTheme.textSecondary,
  border: lightTheme.border,
} as const;

export const spacing = {
  xs: layoutSpacing.xs,
  sm: layoutSpacing.sm,
  md: layoutSpacing.md,
  lg: layoutSpacing.lg,
  xl: layoutSpacing.xl,
} as const;

export const typography = {
  fontFamily: fontFamilies.sans,
  sizes: {
    sm: fontSizes.sm,
    md: fontSizes.base,
    lg: fontSizes.xl,
    xl: fontSizes['3xl'],
  },
} as const;

export const breakpoints = layoutBreakpoints;
export const radius = layoutRadius;
