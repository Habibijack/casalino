import { type Locale, DEFAULT_LOCALE, isLocale } from './translations';

export const LOCALE_COOKIE_NAME = 'casalino_lang';

export function getLocaleFromParams(
  searchParams: Record<string, string | string[] | undefined>,
): Locale | null {
  const lang = searchParams['lang'];
  const value = Array.isArray(lang) ? lang[0] : lang;
  if (value && isLocale(value)) {
    return value;
  }
  return null;
}

export function getLocaleFromCookie(
  cookieValue: string | undefined,
): Locale | null {
  if (cookieValue && isLocale(cookieValue)) {
    return cookieValue;
  }
  return null;
}

export function detectLocale(
  searchParams: Record<string, string | string[] | undefined>,
  cookieValue: string | undefined,
): Locale {
  return (
    getLocaleFromParams(searchParams) ??
    getLocaleFromCookie(cookieValue) ??
    DEFAULT_LOCALE
  );
}
