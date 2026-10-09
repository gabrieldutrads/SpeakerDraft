export const defaultLocale = "pt-BR" as const;
export const supportedLocales = [defaultLocale] as const;
export type Locale = (typeof supportedLocales)[number];
