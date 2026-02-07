'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  createSearchProfile,
  updateSearchProfile,
  type SearchProfileInput,
} from '@/lib/search-profiles/actions';

const SWISS_CITIES = [
  'Zürich', 'Bern', 'Basel', 'Genf', 'Lausanne',
  'Luzern', 'St. Gallen', 'Winterthur', 'Biel/Bienne', 'Thun',
  'Aarau', 'Fribourg', 'Schaffhausen', 'Chur', 'Zug',
  'Solothurn', 'Baden', 'Lugano', 'Bellinzona', 'Neuchâtel',
  'Sion', 'Köniz',
];

const KEYWORD_KEYS = [
  'keywordBalcony', 'keywordParking', 'keywordGarden', 'keywordElevator',
  'keywordDishwasher', 'keywordWasher', 'keywordPets', 'keywordFurnished',
  'keywordNewBuild', 'keywordMinergie',
] as const;

type EditData = {
  id: string;
  name: string;
  cities: string[];
  min_rooms: number | null;
  max_rooms: number | null;
  min_price: number | null;
  max_price: number | null;
  min_area: number | null;
  max_area: number | null;
  keywords: string[];
  notify_email: boolean;
  notify_frequency: string;
};

type ProfileFormProps = {
  editData?: EditData;
};

export function ProfileForm({ editData }: ProfileFormProps) {
  const t = useTranslations('searchProfile');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale;

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(editData?.name ?? '');
  const [cities, setCities] = useState<string[]>(editData?.cities ?? []);
  const [minRooms, setMinRooms] = useState(editData?.min_rooms?.toString() ?? '');
  const [maxRooms, setMaxRooms] = useState(editData?.max_rooms?.toString() ?? '');
  const [minPrice, setMinPrice] = useState(editData?.min_price?.toString() ?? '');
  const [maxPrice, setMaxPrice] = useState(editData?.max_price?.toString() ?? '');
  const [minArea, setMinArea] = useState(editData?.min_area?.toString() ?? '');
  const [maxArea, setMaxArea] = useState(editData?.max_area?.toString() ?? '');
  const [keywords, setKeywords] = useState<string[]>(editData?.keywords ?? []);
  const [notifyEmail, setNotifyEmail] = useState(editData?.notify_email ?? true);
  const [notifyFrequency, setNotifyFrequency] = useState(editData?.notify_frequency ?? 'instant');

  function toggleCity(city: string) {
    setCities((prev) =>
      prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city]
    );
  }

  function toggleKeyword(kw: string) {
    setKeywords((prev) =>
      prev.includes(kw) ? prev.filter((k) => k !== kw) : [...prev, kw]
    );
  }

  function toNumberOrNull(val: string): number | null {
    const n = Number(val);
    return val === '' || isNaN(n) ? null : n;
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    const input: SearchProfileInput = {
      name: name || t('profileNamePlaceholder'),
      cities,
      minRooms: toNumberOrNull(minRooms),
      maxRooms: toNumberOrNull(maxRooms),
      minPrice: toNumberOrNull(minPrice),
      maxPrice: toNumberOrNull(maxPrice),
      minArea: toNumberOrNull(minArea),
      maxArea: toNumberOrNull(maxArea),
      keywords,
      notifyEmail,
      notifyFrequency,
    };

    const result = editData
      ? await updateSearchProfile(editData.id, input)
      : await createSearchProfile(input);

    if ('error' in result && result.error) {
      setError(result.error);
      setSaving(false);
      return;
    }

    router.push(`/${locale as string}/search-profiles`);
    router.refresh();
  }

  const stepLabels = [t('stepWhere'), t('stepWhat'), t('stepExtras')];

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {stepLabels.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => setStep(i + 1)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              step === i + 1
                ? 'bg-primary text-white'
                : 'bg-card text-muted-foreground border border-border'
            }`}
          >
            <span>{i + 1}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Step 1: Where */}
      {step === 1 && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <label className="text-sm font-medium" htmlFor="profile-name">
                {t('profileName')}
              </label>
              <Input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('profileNamePlaceholder')}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">{t('cities')}</label>
              <p className="text-xs text-muted-foreground mb-2">{t('citiesHint')}</p>
              <div className="flex flex-wrap gap-2">
                {SWISS_CITIES.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => toggleCity(city)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      cities.includes(city)
                        ? 'bg-primary text-white'
                        : 'bg-card border border-border text-foreground hover:bg-background'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: What */}
      {step === 2 && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <label className="text-sm font-medium">{t('rooms')}</label>
              <div className="grid grid-cols-2 gap-3 mt-1">
                <Input
                  type="number"
                  placeholder={t('minRooms')}
                  value={minRooms}
                  onChange={(e) => setMinRooms(e.target.value)}
                  min={1}
                  max={10}
                />
                <Input
                  type="number"
                  placeholder={t('maxRooms')}
                  value={maxRooms}
                  onChange={(e) => setMaxRooms(e.target.value)}
                  min={1}
                  max={10}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">{t('price')}</label>
              <div className="grid grid-cols-2 gap-3 mt-1">
                <Input
                  type="number"
                  placeholder={t('minPrice')}
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  min={0}
                  step={100}
                />
                <Input
                  type="number"
                  placeholder={t('maxPrice')}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  min={0}
                  step={100}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">{t('area')}</label>
              <div className="grid grid-cols-2 gap-3 mt-1">
                <Input
                  type="number"
                  placeholder={t('minArea')}
                  value={minArea}
                  onChange={(e) => setMinArea(e.target.value)}
                  min={0}
                  step={10}
                />
                <Input
                  type="number"
                  placeholder={t('maxArea')}
                  value={maxArea}
                  onChange={(e) => setMaxArea(e.target.value)}
                  min={0}
                  step={10}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Extras */}
      {step === 3 && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <label className="text-sm font-medium">{t('keywords')}</label>
              <p className="text-xs text-muted-foreground mb-2">{t('keywordsHint')}</p>
              <div className="flex flex-wrap gap-2">
                {KEYWORD_KEYS.map((key) => {
                  const label = t(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleKeyword(label)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        keywords.includes(label)
                          ? 'bg-primary text-white'
                          : 'bg-card border border-border text-foreground hover:bg-background'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <label className="text-sm font-medium">{t('notifications')}</label>
              <div className="mt-2 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm">{t('notifyEmail')}</span>
                </label>

                {notifyEmail && (
                  <div>
                    <label className="text-xs text-muted-foreground">
                      {t('notifyFrequency')}
                    </label>
                    <div className="flex gap-2 mt-1">
                      {(['instant', 'daily', 'weekly'] as const).map((freq) => (
                        <button
                          key={freq}
                          type="button"
                          onClick={() => setNotifyFrequency(freq)}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                            notifyFrequency === freq
                              ? 'bg-primary text-white'
                              : 'bg-card border border-border text-foreground hover:bg-background'
                          }`}
                        >
                          {t(`frequency${freq.charAt(0).toUpperCase() + freq.slice(1)}` as 'frequencyInstant' | 'frequencyDaily' | 'frequencyWeekly')}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        {step > 1 && (
          <Button
            variant="secondary"
            onClick={() => setStep((s) => s - 1)}
          >
            {t('back')}
          </Button>
        )}
        <div className="flex-1" />
        {step < 3 ? (
          <Button onClick={() => setStep((s) => s + 1)}>
            {t('next')}
          </Button>
        ) : (
          <Button onClick={handleSave} disabled={saving}>
            {saving ? '...' : t('save')}
          </Button>
        )}
      </div>
    </div>
  );
}
