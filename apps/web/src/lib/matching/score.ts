/**
 * Smart Matching Engine for Casalino.
 * Scores listings against search profiles (0-100).
 */

type ListingData = {
  city: string | null;
  rooms: string | null;
  price: number | null;
  area: number | null;
  features: string[];
  title: string;
  description: string | null;
};

type ProfileData = {
  cities: string[];
  minRooms: number | null;
  maxRooms: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  minArea: number | null;
  maxArea: number | null;
  keywords: string[];
  excludeKeywords: string[];
};

export type MatchResult = {
  score: number;
  breakdown: {
    city: number;
    rooms: number;
    price: number;
    area: number;
    keywords: number;
  };
  matchReasons: string[];
  dealBreakers: string[];
};

export function calculateMatchScore(
  listing: ListingData,
  profile: ProfileData
): MatchResult {
  const breakdown = { city: 0, rooms: 0, price: 0, area: 0, keywords: 0 };
  const matchReasons: string[] = [];
  const dealBreakers: string[] = [];

  // 1. CITY MATCH (30 points)
  if (profile.cities.length > 0 && listing.city) {
    const cityMatch = profile.cities.some(
      (c) =>
        listing.city!.toLowerCase().includes(c.toLowerCase()) ||
        c.toLowerCase().includes(listing.city!.toLowerCase())
    );
    if (cityMatch) {
      breakdown.city = 30;
      matchReasons.push(`${listing.city} ist in deiner Suche`);
    } else {
      dealBreakers.push(`${listing.city} nicht in deinen Städten`);
    }
  } else {
    breakdown.city = 15;
  }

  // 2. ROOMS MATCH (20 points)
  if (listing.rooms) {
    const rooms = parseFloat(listing.rooms);
    if (!isNaN(rooms)) {
      const minOk = !profile.minRooms || rooms >= profile.minRooms;
      const maxOk = !profile.maxRooms || rooms <= profile.maxRooms;

      if (minOk && maxOk) {
        breakdown.rooms = 20;
        matchReasons.push(`${rooms} Zimmer passt perfekt`);
      } else if (minOk || maxOk) {
        breakdown.rooms = 10;
        if (!minOk)
          dealBreakers.push(
            `${rooms} Zi. unter Minimum (${profile.minRooms})`
          );
        if (!maxOk)
          dealBreakers.push(
            `${rooms} Zi. über Maximum (${profile.maxRooms})`
          );
      } else {
        dealBreakers.push(
          `${rooms} Zimmer passt nicht (${profile.minRooms}-${profile.maxRooms})`
        );
      }
    }
  } else {
    breakdown.rooms = 10;
  }

  // 3. PRICE MATCH (25 points)
  if (listing.price) {
    const minOk = !profile.minPrice || listing.price >= profile.minPrice;
    const maxOk = !profile.maxPrice || listing.price <= profile.maxPrice;

    if (minOk && maxOk) {
      breakdown.price = 25;
      matchReasons.push(
        `CHF ${listing.price.toLocaleString('de-CH')} passt ins Budget`
      );

      if (profile.maxPrice && listing.price < profile.maxPrice * 0.8) {
        matchReasons.push(
          `${Math.round((1 - listing.price / profile.maxPrice) * 100)}% unter Budget`
        );
      }
    } else if (maxOk) {
      breakdown.price = 15;
    } else if (profile.maxPrice) {
      const overPercent = Math.round(
        ((listing.price - profile.maxPrice) / profile.maxPrice) * 100
      );
      if (overPercent <= 10) {
        breakdown.price = 10;
        dealBreakers.push(`${overPercent}% über Budget`);
      } else {
        dealBreakers.push(
          `CHF ${listing.price.toLocaleString('de-CH')} über Budget (max. ${profile.maxPrice.toLocaleString('de-CH')})`
        );
      }
    }
  } else {
    breakdown.price = 12;
  }

  // 4. AREA MATCH (10 points)
  if (listing.area && (profile.minArea || profile.maxArea)) {
    const minOk = !profile.minArea || listing.area >= profile.minArea;
    const maxOk = !profile.maxArea || listing.area <= profile.maxArea;

    if (minOk && maxOk) {
      breakdown.area = 10;
      matchReasons.push(`${listing.area} m² passt`);
    } else {
      breakdown.area = 3;
    }
  } else {
    breakdown.area = 5;
  }

  // 5. KEYWORDS MATCH (15 points)
  if (profile.keywords.length > 0) {
    const searchText = [
      listing.title,
      listing.description,
      ...listing.features,
    ]
      .join(' ')
      .toLowerCase();

    const matched = profile.keywords.filter((kw) =>
      searchText.includes(kw.toLowerCase())
    );

    const matchRatio = matched.length / profile.keywords.length;
    breakdown.keywords = Math.round(matchRatio * 15);

    if (matched.length > 0) {
      matchReasons.push(`Hat: ${matched.join(', ')}`);
    }
  } else {
    breakdown.keywords = 8;
  }

  // CHECK EXCLUDE KEYWORDS (penalty)
  if (profile.excludeKeywords.length > 0) {
    const searchText = [
      listing.title,
      listing.description,
      ...listing.features,
    ]
      .join(' ')
      .toLowerCase();

    const excluded = profile.excludeKeywords.filter((kw) =>
      searchText.includes(kw.toLowerCase())
    );

    if (excluded.length > 0) {
      const penalty = excluded.length * 10;
      breakdown.keywords = Math.max(0, breakdown.keywords - penalty);
      dealBreakers.push(`Enthält: ${excluded.join(', ')}`);
    }
  }

  const score =
    breakdown.city +
    breakdown.rooms +
    breakdown.price +
    breakdown.area +
    breakdown.keywords;

  return {
    score: Math.min(100, Math.max(0, score)),
    breakdown,
    matchReasons,
    dealBreakers,
  };
}

export function getScoreLabel(score: number): {
  label: string;
  color: string;
} {
  if (score >= 85)
    return { label: 'Top Match', color: 'text-green-600 bg-green-50' };
  if (score >= 70)
    return { label: 'Guter Match', color: 'text-blue-600 bg-blue-50' };
  if (score >= 50)
    return { label: 'Möglich', color: 'text-yellow-600 bg-yellow-50' };
  return { label: 'Wenig passend', color: 'text-gray-500 bg-gray-50' };
}
