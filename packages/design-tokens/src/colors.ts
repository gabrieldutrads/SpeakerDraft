/**
 * SpeakerDraft Design Tokens - Colors
 * 
 * Palette:
 * - Primary: #17243A (Deep navy slate - authority, depth)
 * - Light Background: #F7F4ED (Warm parchment / cream - readable, editorial)
 * - Accent Gold: #C9A86A (Sober gold / light - highlights, sacred dignity)
 * - Accent Sage: #527568 (Earthy sage - peaceful, secondary emphasis)
 * - Neutral Dark / Text: #252A32 (Soft charcoal - high readability)
 * - Neutral Medium: #6E7681 (Secondary metadata)
 * - Neutral Light / Border: #E5E0D8 (Light border)
 * - Dark Background: #0F1724 (Deep navy night)
 * - Dark Surface: #17243A (Card and element surface)
 * - Dark Elevated Surface: #1E2B40 (Modals, popovers)
 * - Dark Border: #2C3A50 (Subtle dark border)
 */

export const palette = {
  navy: {
    50: '#F0F4F8',
    100: '#D9E2EC',
    200: '#BCCCDC',
    300: '#9FB3C8',
    400: '#627D98',
    500: '#486581',
    600: '#334E68',
    700: '#243B53',
    800: '#17243A', // Primary Navy
    900: '#0F1724', // Dark Background
    950: '#090D15',
  },
  cream: {
    50: '#FAF9F5',
    100: '#F7F4ED', // Light Background
    200: '#EFECE3',
    300: '#E5E0D8', // Light Border
    400: '#D5CEC3',
    500: '#B8AFA0',
  },
  gold: {
    50: '#FAF6ED',
    100: '#F3E9D2',
    200: '#E7D4AA',
    300: '#DBBE82',
    400: '#C9A86A', // Accent Gold
    500: '#B3914F',
    600: '#93733A',
    700: '#735728',
  },
  sage: {
    50: '#F0F5F2',
    100: '#DCE8E1',
    200: '#BDD4C8',
    300: '#98BCAB',
    400: '#75A18E',
    500: '#527568', // Secondary Sage
    600: '#3E5C50',
    700: '#2E453B',
  },
  charcoal: {
    50: '#F5F6F7',
    100: '#E3E5E8',
    200: '#C8CCD1',
    300: '#A4ABB3',
    400: '#6E7681', // Neutral Medium
    500: '#4B525B',
    600: '#373D45',
    700: '#252A32', // Neutral Dark / Text Primary
    800: '#1A1E24',
    900: '#111418',
  },
  status: {
    success: '#527568',
    successLight: '#EBF4F0',
    warning: '#D99B26',
    warningLight: '#FDF6E9',
    error: '#C0392B',
    errorLight: '#FDEEED',
    info: '#3A6B88',
    infoLight: '#EDF5F9',
  },
} as const;

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceSubtle: string;
  surfaceElevated: string;
  surfaceHover: string;
  border: string;
  borderSubtle: string;
  borderFocus: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  primary: string;
  primaryForeground: string;
  primaryHover: string;
  accent: string;
  accentForeground: string;
  accentSecondary: string;
  success: string;
  successBg: string;
  warning: string;
  warningBg: string;
  error: string;
  errorBg: string;
  info: string;
  infoBg: string;
}

export const lightTheme: ThemeColors = {
  background: palette.cream[100],      // #F7F4ED
  surface: '#FFFFFF',
  surfaceSubtle: palette.cream[50],    // #FAF9F5
  surfaceElevated: '#FFFFFF',
  surfaceHover: palette.cream[200],   // #EFECE3
  border: palette.cream[300],          // #E5E0D8
  borderSubtle: '#ECE7DF',
  borderFocus: palette.navy[800],      // #17243A
  textPrimary: palette.charcoal[700],  // #252A32
  textSecondary: palette.charcoal[400],// #6E7681
  textMuted: '#8C95A0',
  textInverse: palette.cream[100],     // #F7F4ED
  primary: palette.navy[800],          // #17243A
  primaryForeground: palette.cream[100],// #F7F4ED
  primaryHover: palette.navy[700],     // #243B53
  accent: palette.gold[400],           // #C9A86A
  accentForeground: palette.navy[900], // #0F1724
  accentSecondary: palette.sage[500],  // #527568
  success: palette.status.success,
  successBg: palette.status.successLight,
  warning: palette.status.warning,
  warningBg: palette.status.warningLight,
  error: palette.status.error,
  errorBg: palette.status.errorLight,
  info: palette.status.info,
  infoBg: palette.status.infoLight,
};

export const darkTheme: ThemeColors = {
  background: palette.navy[900],       // #0F1724
  surface: palette.navy[800],          // #17243A
  surfaceSubtle: '#141E2E',
  surfaceElevated: '#1E2B40',
  surfaceHover: '#23334D',
  border: '#2C3A50',
  borderSubtle: '#1D2A3D',
  borderFocus: palette.gold[400],      // #C9A86A
  textPrimary: palette.cream[100],     // #F7F4ED
  textSecondary: '#A8B2C1',
  textMuted: '#6C7A8E',
  textInverse: palette.charcoal[700],  // #252A32
  primary: palette.gold[400],          // #C9A86A
  primaryForeground: palette.navy[900],// #0F1724
  primaryHover: palette.gold[300],     // #DBBE82
  accent: palette.gold[400],           // #C9A86A
  accentForeground: palette.navy[900],
  accentSecondary: '#689584',
  success: '#689584',
  successBg: '#132A20',
  warning: '#E2AB40',
  warningBg: '#2D200E',
  error: '#E05344',
  errorBg: '#2D1412',
  info: '#4B88AB',
  infoBg: '#12232E',
};
