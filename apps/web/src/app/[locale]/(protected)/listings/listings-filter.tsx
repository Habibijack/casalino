'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type ListingsFilterProps = {
  locale: string;
  currentFilters: { [key: string]: string | undefined };
};

export function ListingsFilter({ locale, currentFilters }: ListingsFilterProps) {
  const router = useRouter();
  const [city, setCity] = useState(currentFilters.city ?? '');
  const [maxPrice, setMaxPrice] = useState(currentFilters.maxPrice ?? '');

  function applyFilters() {
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (maxPrice) params.set('maxPrice', maxPrice);
    const qs = params.toString();
    router.push(`/${locale}/listings${qs ? `?${qs}` : ''}`);
  }

  function clearFilters() {
    setCity('');
    setMaxPrice('');
    router.push(`/${locale}/listings`);
  }

  const hasFilters = city || maxPrice;

  return (
    <div className="flex gap-2 items-end">
      <div className="flex-1">
        <Input
          placeholder="Stadt..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
          className="h-9 text-sm"
        />
      </div>
      <div className="w-28">
        <Input
          type="number"
          placeholder="Max. CHF"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
          className="h-9 text-sm"
          min={0}
          step={100}
        />
      </div>
      <Button size="sm" onClick={applyFilters} className="h-9">
        Filtern
      </Button>
      {hasFilters && (
        <Button size="sm" variant="ghost" onClick={clearFilters} className="h-9">
          ✕
        </Button>
      )}
    </div>
  );
}
