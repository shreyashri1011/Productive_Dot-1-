import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState, useEffect, useCallback, useContext, createContext } from "react";

export type ProductivityRating = number;

export type DayData = {
  rating: ProductivityRating;
  note?: string;
};

export type ProductivityMap = Record<string, DayData>;

const STORAGE_KEY = "@dot365:productivity";

export function getDayKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

export function getTotalDaysInYear(year: number): number {
  return (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) ? 366 : 365;
}

export function getDateFromDayOfYear(year: number, dayOfYear: number): Date {
  const date = new Date(year, 0, dayOfYear);
  return date;
}

type ProductivityContextValue = {
  productivityMap: ProductivityMap;
  isLoaded: boolean;
  saveRating: (date: Date, rating: ProductivityRating, note?: string) => Promise<void>;
  getRating: (date: Date) => DayData | undefined;
  getStats: () => {
    totalDays: number;
    daysCompleted: number;
    daysRemaining: number;
    totalRated: number;
    avgRating: number;
    percentComplete: number;
  };
};

const ProductivityContext = createContext<ProductivityContextValue | null>(null);

export function useProductivity(): ProductivityContextValue {
  const ctx = useContext(ProductivityContext);
  if (!ctx) {
    throw new Error("useProductivity must be used within ProductivityProvider");
  }
  return ctx;
}

export function ProductivityProvider({ children }: { children: React.ReactNode }) {
  const [productivityMap, setProductivityMap] = useState<ProductivityMap>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((data) => {
        if (data) {
          try {
            setProductivityMap(JSON.parse(data));
          } catch {
            setProductivityMap({});
          }
        }
        setIsLoaded(true);
      })
      .catch(() => {
        setIsLoaded(true);
      });
  }, []);

  const saveRating = useCallback(
    async (date: Date, rating: ProductivityRating, note?: string) => {
      const key = getDayKey(date);
      const newMap = {
        ...productivityMap,
        [key]: { rating, note },
      };
      setProductivityMap(newMap);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newMap));
    },
    [productivityMap]
  );

  const getRating = useCallback(
    (date: Date): DayData | undefined => {
      const key = getDayKey(date);
      return productivityMap[key];
    },
    [productivityMap]
  );

  const getStats = useCallback(() => {
    const now = new Date();
    const year = now.getFullYear();
    const todayDayOfYear = getDayOfYear(now);
    const totalDays = getTotalDaysInYear(year);

    let totalRated = 0;
    let ratingSum = 0;

    for (let d = 1; d < todayDayOfYear; d++) {
      const date = getDateFromDayOfYear(year, d);
      const key = getDayKey(date);
      const data = productivityMap[key];
      if (data && data.rating > 0) {
        totalRated++;
        ratingSum += data.rating;
      }
    }

    const avgRating = totalRated > 0 ? ratingSum / totalRated : 0;
    const daysCompleted = todayDayOfYear - 1;
    const daysRemaining = totalDays - daysCompleted;

    return {
      totalDays,
      daysCompleted,
      daysRemaining,
      totalRated,
      avgRating,
      percentComplete: Math.round((daysCompleted / totalDays) * 100),
    };
  }, [productivityMap]);

  const value: ProductivityContextValue = {
    productivityMap,
    isLoaded,
    saveRating,
    getRating,
    getStats,
  };

  return (
    <ProductivityContext.Provider value={value}>
      {children}
    </ProductivityContext.Provider>
  );
}
