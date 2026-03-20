import React, { useMemo, useCallback } from "react";
import {
  View,
  Pressable,
  StyleSheet,
  Dimensions,
} from "react-native";
import COLORS from "@/constants/colors";
import {
  useProductivity,
  getDayOfYear,
  getTotalDaysInYear,
  getDateFromDayOfYear,
  getDayKey,
} from "@/context/ProductivityContext";

const SCREEN_WIDTH = Dimensions.get("window").width;
const COLS = 25;
const PADDING = 24;
const GAP = 3;
const DOT_SIZE = Math.floor((SCREEN_WIDTH - PADDING * 2 - GAP * (COLS - 1)) / COLS);

type Props = {
  onDotPress: (date: Date, dayOfYear: number) => void;
  selectedDay?: number;
};

function getDotColor(
  dayOfYear: number,
  todayDayOfYear: number,
  rating: number | undefined
): string {
  if (dayOfYear > todayDayOfYear) {
    return COLORS.dotFuture;
  }
  if (dayOfYear === todayDayOfYear) {
    return COLORS.dotToday;
  }
  if (rating === undefined || rating === 0) {
    return "#2A2A2A";
  }
  return COLORS.productivityColors[Math.min(10, Math.max(0, rating))];
}

export default function DotGrid({ onDotPress, selectedDay }: Props) {
  const { productivityMap, isLoaded } = useProductivity();
  const now = useMemo(() => new Date(), []);
  const year = now.getFullYear();
  const todayDayOfYear = getDayOfYear(now);
  const totalDays = getTotalDaysInYear(year);

  const dots = useMemo(() => {
    const result = [];
    for (let d = 1; d <= totalDays; d++) {
      const date = getDateFromDayOfYear(year, d);
      const key = getDayKey(date);
      const dayData = productivityMap[key];
      const rating = dayData?.rating;
      const color = getDotColor(d, todayDayOfYear, rating);
      const isToday = d === todayDayOfYear;
      const isPast = d < todayDayOfYear;
      result.push({ dayOfYear: d, date, color, isToday, isPast, rating });
    }
    return result;
  }, [productivityMap, todayDayOfYear, totalDays, year]);

  const handlePress = useCallback(
    (day: { dayOfYear: number; date: Date }) => {
      onDotPress(day.date, day.dayOfYear);
    },
    [onDotPress]
  );

  if (!isLoaded) {
    return <View style={styles.gridContainer} />;
  }

  return (
    <View style={styles.gridContainer}>
      <View style={styles.grid}>
        {dots.map((dot) => {
          const isSelected = selectedDay === dot.dayOfYear;
          return (
            <Pressable
              key={dot.dayOfYear}
              onPress={() => handlePress(dot)}
              hitSlop={2}
            >
              <View
                style={[
                  styles.dot,
                  { backgroundColor: dot.color },
                  dot.isToday && styles.todayDot,
                  isSelected && styles.selectedDot,
                ]}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    paddingHorizontal: PADDING,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GAP,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
  todayDot: {
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  selectedDot: {
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.6)",
  },
});
