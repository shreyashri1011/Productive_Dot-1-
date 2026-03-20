import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import COLORS from "@/constants/colors";
import RatingSheet from "@/components/RatingSheet";
import {
  getDayOfYear,
  getTotalDaysInYear,
  getDateFromDayOfYear,
  getDayKey,
  useProductivity,
} from "@/context/ProductivityContext";

type SelectedDay = {
  date: Date;
  dayOfYear: number;
};

const DOT_GAP = 3;
const TOTAL_DOTS = 365;
const H_PADDING = 24;
const TIME_HEIGHT = 120;

function getDotColor(
  dayOfYear: number,
  todayDayOfYear: number,
  rating: number | undefined
): string {
  if (dayOfYear > todayDayOfYear) return COLORS.dotFuture;
  if (dayOfYear === todayDayOfYear) return COLORS.dotToday;
  if (rating === undefined || rating === 0) return "#222222";
  return COLORS.productivityColors[Math.min(10, Math.max(0, rating))];
}

export default function HomeScreen() {
  const { width: screenW, height: screenH } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { productivityMap, isLoaded } = useProductivity();
  const [selectedDay, setSelectedDay] = useState<SelectedDay | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    timerRef.current = setInterval(tick, 60000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const year = now.getFullYear();
  const todayDayOfYear = getDayOfYear(now);
  const totalDays = getTotalDaysInYear(year);

  const hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  const timeString = `${displayHour}:${minutes}`;
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const { dotSize, cols } = useMemo(() => {
    const availW = screenW - H_PADDING * 2;
    const availH = screenH - insets.top - insets.bottom - TIME_HEIGHT - 32;

    let bestDotSize = 0;
    let bestCols = 20;

    for (let c = 10; c <= 30; c++) {
      const rows = Math.ceil(TOTAL_DOTS / c);
      const dotW = (availW - DOT_GAP * (c - 1)) / c;
      const dotH = (availH - DOT_GAP * (rows - 1)) / rows;
      const d = Math.min(dotW, dotH);
      if (d > bestDotSize) {
        bestDotSize = d;
        bestCols = c;
      }
    }

    return { dotSize: Math.floor(bestDotSize), cols: bestCols };
  }, [screenW, screenH, insets]);

  const dots = useMemo(() => {
    if (!isLoaded || dotSize === 0) return [];
    const result = [];
    for (let d = 1; d <= totalDays; d++) {
      const date = getDateFromDayOfYear(year, d);
      const key = getDayKey(date);
      const dayData = productivityMap[key];
      const color = getDotColor(d, todayDayOfYear, dayData?.rating);
      result.push({ dayOfYear: d, date, color, isToday: d === todayDayOfYear });
    }
    return result;
  }, [productivityMap, todayDayOfYear, totalDays, year, isLoaded, dotSize]);

  const handleDotPress = useCallback((date: Date, dayOfYear: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDay({ date, dayOfYear });
    setSheetOpen(true);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setSheetOpen(false);
    setSelectedDay(null);
  }, []);

  const gridWidth = cols * dotSize + (cols - 1) * DOT_GAP;
  const rows = Math.ceil(TOTAL_DOTS / cols);
  const gridHeight = rows * dotSize + (rows - 1) * DOT_GAP;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.timeBlock}>
        <Text style={styles.time}>{timeString}</Text>
        <Text style={styles.date}>{dateStr}</Text>
      </View>

      <View style={[styles.gridContainer, { width: gridWidth, height: gridHeight }]}>
        <View style={styles.grid}>
          {dots.map((dot) => {
            const isSelected = selectedDay?.dayOfYear === dot.dayOfYear;
            return (
              <Pressable
                key={dot.dayOfYear}
                onPress={() => handleDotPress(dot.date, dot.dayOfYear)}
                hitSlop={2}
              >
                <View
                  style={[
                    {
                      width: dotSize,
                      height: dotSize,
                      borderRadius: dotSize / 2,
                      backgroundColor: dot.color,
                    },
                    dot.isToday && styles.todayGlow,
                    isSelected && styles.selectedRing,
                  ]}
                />
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  timeBlock: {
    alignItems: "center",
    gap: 3,
  },
  time: {
    fontSize: 80,
    fontWeight: "200",
    color: COLORS.textPrimary,
    fontFamily: "Inter_400Regular",
    letterSpacing: -3,
    lineHeight: 88,
  },
  date: {
    fontSize: 14,
    color: "rgba(255,255,255,0.38)",
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.1,
  },
  gridContainer: {
    alignItems: "flex-start",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: DOT_GAP,
  },
  todayGlow: {
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: 5,
    elevation: 6,
  },
  selectedRing: {
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.55)",
  },
});
