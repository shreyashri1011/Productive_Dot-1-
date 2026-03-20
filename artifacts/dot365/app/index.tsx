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

const COLS = 25;
const DOT_GAP = 3;
const H_PADDING = 20;

function getDotColor(
  dayOfYear: number,
  todayDayOfYear: number,
  rating: number | undefined
): string {
  if (dayOfYear > todayDayOfYear) return "#181818";
  if (dayOfYear === todayDayOfYear) return COLORS.dotToday;
  if (rating === undefined || rating === 0) return "#2C2C2C";
  return COLORS.productivityColors[Math.min(10, Math.max(0, rating))];
}

export default function HomeScreen() {
  const { width: screenW } = useWindowDimensions();
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

  const availW = screenW - H_PADDING * 2;
  const dotSize = Math.floor((availW - DOT_GAP * (COLS - 1)) / COLS);

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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.timeSection}>
        <Text style={styles.time}>{timeString}</Text>
        <Text style={styles.date}>{dateStr}</Text>
      </View>

      <View style={[styles.gridWrap, { paddingHorizontal: H_PADDING }]}>
        <View style={styles.grid}>
          {dots.map((dot) => {
            const isSelected = selectedDay?.dayOfYear === dot.dayOfYear;
            return (
              <Pressable
                key={dot.dayOfYear}
                onPress={() => handleDotPress(dot.date, dot.dayOfYear)}
                hitSlop={3}
              >
                {dot.isToday ? (
                  <View style={{ width: dotSize, height: dotSize, alignItems: "center", justifyContent: "center" }}>
                    <View
                      style={{
                        position: "absolute",
                        width: dotSize + 5,
                        height: dotSize + 5,
                        borderRadius: (dotSize + 5) / 2,
                        borderWidth: 1.5,
                        borderColor: COLORS.dotToday,
                        opacity: 0.45,
                      }}
                    />
                    <View
                      style={{
                        width: dotSize - 1,
                        height: dotSize - 1,
                        borderRadius: (dotSize - 1) / 2,
                        backgroundColor: COLORS.dotToday,
                      }}
                    />
                  </View>
                ) : (
                  <View
                    style={{
                      width: dotSize,
                      height: dotSize,
                      borderRadius: dotSize / 2,
                      backgroundColor: dot.color,
                      borderWidth: isSelected ? 1.5 : 0,
                      borderColor: "rgba(255,255,255,0.4)",
                    }}
                  />
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      {sheetOpen && selectedDay && (
        <RatingSheet
          date={selectedDay.date}
          dayOfYear={selectedDay.dayOfYear}
          onClose={handleCloseSheet}
          isToday={selectedDay.dayOfYear === todayDayOfYear}
          isPast={selectedDay.dayOfYear < todayDayOfYear}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "flex-start",
    gap: 20,
  },
  timeSection: {
    alignItems: "center",
    gap: 4,
    paddingTop: 60,
  },
  time: {
    fontSize: 72,
    fontWeight: "200",
    color: COLORS.textPrimary,
    fontFamily: "Inter_400Regular",
    letterSpacing: -3,
    lineHeight: 80,
  },
  date: {
    fontSize: 13,
    color: "rgba(255,255,255,0.32)",
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.1,
  },
  gridWrap: {
    width: "100%",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: DOT_GAP,
  },
});
