import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

type Lang = 'en' | 'cy';

const getLang = (): Lang => {
  try {
    return (localStorage.getItem('app_language') as Lang) || 'en';
  } catch {
    return 'en';
  }
};

// Module-level cache so we only hit the DB once per language per session.
const cache: Partial<Record<Lang, Record<string, string>>> = {};
const inflight: Partial<Record<Lang, Promise<Record<string, string>>>> = {};

const loadLang = (lang: Lang): Promise<Record<string, string>> => {
  if (cache[lang]) return Promise.resolve(cache[lang]!);
  if (inflight[lang]) return inflight[lang]!;
  inflight[lang] = (async () => {
    const { data, error } = await supabase
      .from('translations')
      .select('translation, english_version')
      .eq('language_code', lang);
    if (error) {
      console.error('Failed to load translations', error);
      return {};
    }
    const dict: Record<string, string> = {};
    for (const row of data ?? []) {
      const key = (row.english_version ?? '').trim();
      if (key) dict[key] = row.translation;
    }
    cache[lang] = dict;
    return dict;
  })();
  return inflight[lang]!;
};

export const useTranslations = () => {
  const [lang] = useState<Lang>(getLang);
  const [dict, setDict] = useState<Record<string, string>>(() => cache[lang] ?? {});

  useEffect(() => {
    if (lang === 'en') return;
    let alive = true;
    loadLang(lang).then((d) => {
      if (alive) setDict(d);
    });
    return () => {
      alive = false;
    };
  }, [lang]);

  const t = useCallback(
    (en: string): string => {
      if (lang === 'en') return en;
      return dict[en.trim()] ?? en;
    },
    [dict, lang]
  );

  return { t, lang };
};
