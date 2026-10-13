import { lightTheme, darkTheme, type ThemeColors } from './colors';
import { fontFamilies, fontSizes, lineHeights } from './typography';
import { spacing, radius, shadows, motion } from './layout';

function themeToCssVars(theme: ThemeColors, prefix = 'sd'): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [key, value] of Object.entries(theme)) {
    const kebab = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    vars[`--${prefix}-${kebab}`] = value;
  }
  return vars;
}

export function generateCssVariablesString(): string {
  const lightVars = themeToCssVars(lightTheme);
  const darkVars = themeToCssVars(darkTheme);

  const formatVars = (vars: Record<string, string>) =>
    Object.entries(vars)
      .map(([k, v]) => `  ${k}: ${v};`)
      .join('\n');

  return `
:root {
  /* Fonts */
  --sd-font-sans: ${fontFamilies.sans};
  --sd-font-serif: ${fontFamilies.serif};
  --sd-font-mono: ${fontFamilies.mono};

  /* Radius */
  --sd-radius-xs: ${radius.xs}px;
  --sd-radius-sm: ${radius.sm}px;
  --sd-radius-md: ${radius.md}px;
  --sd-radius-lg: ${radius.lg}px;
  --sd-radius-xl: ${radius.xl}px;
  --sd-radius-pill: ${radius.pill}px;

  /* Shadows */
  --sd-shadow-sm: ${shadows.sm};
  --sd-shadow-md: ${shadows.md};
  --sd-shadow-lg: ${shadows.lg};
  --sd-shadow-xl: ${shadows.xl};

  /* Motion */
  --sd-duration-fast: ${motion.duration.fast}ms;
  --sd-duration-normal: ${motion.duration.normal}ms;
  --sd-duration-slow: ${motion.duration.slow}ms;
  --sd-ease-default: ${motion.easing.easeInOut};
  --sd-ease-out: ${motion.easing.easeOut};

  /* Light Theme Variables */
${formatVars(lightVars)}
}

.dark, [data-theme="dark"] {
  /* Dark Shadows */
  --sd-shadow-sm: ${shadows.darkSm};
  --sd-shadow-md: ${shadows.darkMd};
  --sd-shadow-lg: ${shadows.darkLg};

  /* Dark Theme Variables */
${formatVars(darkVars)}
}
`;
}
