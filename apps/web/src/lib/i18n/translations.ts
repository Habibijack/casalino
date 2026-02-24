export type Locale = 'de' | 'fr' | 'it';

export const DEFAULT_LOCALE: Locale = 'de';

export const SUPPORTED_LOCALES: readonly Locale[] = ['de', 'fr', 'it'] as const;

export const LOCALE_LABELS: Record<Locale, string> = {
  de: 'DE',
  fr: 'FR',
  it: 'IT',
};

type DictionaryNamespace =
  | 'common'
  | 'apply'
  | 'book'
  | 'sign'
  | 'reference'
  | 'marketing';

type TranslationDictionary = Record<string, string>;
type LocaleDictionary = Record<Locale, TranslationDictionary>;

const dictionaries: Record<DictionaryNamespace, LocaleDictionary | null> = {
  common: null,
  apply: null,
  book: null,
  sign: null,
  reference: null,
  marketing: null,
};

async function loadDictionary(
  namespace: DictionaryNamespace,
): Promise<LocaleDictionary> {
  if (dictionaries[namespace]) {
    return dictionaries[namespace];
  }

  let dict: LocaleDictionary;

  switch (namespace) {
    case 'common': {
      const mod = await import('./dictionaries/common');
      dict = mod.commonDictionary;
      break;
    }
    case 'apply': {
      const mod = await import('./dictionaries/apply');
      dict = mod.applyDictionary;
      break;
    }
    case 'book': {
      const mod = await import('./dictionaries/book');
      dict = mod.bookDictionary;
      break;
    }
    case 'sign': {
      const mod = await import('./dictionaries/sign');
      dict = mod.signDictionary;
      break;
    }
    case 'reference': {
      const mod = await import('./dictionaries/reference');
      dict = mod.referenceDictionary;
      break;
    }
    case 'marketing': {
      const mod = await import('./dictionaries/marketing');
      dict = mod.marketingDictionary;
      break;
    }
  }

  dictionaries[namespace] = dict;
  return dict;
}

export async function getTranslations(
  locale: Locale,
  namespace: DictionaryNamespace,
): Promise<(key: string) => string> {
  const dict = await loadDictionary(namespace);
  const localeDict = dict[locale] ?? dict[DEFAULT_LOCALE];

  return (key: string): string => {
    return localeDict[key] ?? dict[DEFAULT_LOCALE][key] ?? key;
  };
}

export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === 'string' &&
    SUPPORTED_LOCALES.includes(value as Locale)
  );
}
