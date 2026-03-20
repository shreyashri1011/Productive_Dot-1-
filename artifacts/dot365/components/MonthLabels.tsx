import React, { useMemo } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import COLORS from "@/constants/colors";
import { getTotalDaysInYear, getDateFromDayOfYear } from "@/context/ProductivityContext";

const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const SCREEN_WIDTH = Dimensions.get("window").width;
const COLS = 25;
const PADDING = 24;
const GAP = 3;
const DOT_SIZE = Math.floor((SCREEN_WIDTH - PADDING * 2 - GAP * (COLS - 1)) / COLS);
const CELL = DOT_SIZE + GAP;

export default function MonthLabels() {
  const now = new Date();
  const year = now.getFullYear();
  const totalDays = getTotalDaysInYear(year);

  const monthPositions = useMemo(() => {
    const positions: { label: string; col: number }[] = [];
    let lastMonth = -1;
    for (let d = 1; d <= totalDays; d++) {
      const date = getDateFromDayOfYear(year, d);
      const month = date.getMonth();
      if (month !== lastMonth) {
        const col = (d - 1) % COLS;
        positions.push({ label: MONTHS_SHORT[month], col });
        lastMonth = month;
      }
    }
    return positions;
  }, [year, totalDays]);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {monthPositions.map((pos, i) => (
          <View
            key={i}
            style={[styles.monthLabel, { left: PADDING + pos.col * CELL }]}
          >
            <Text style={styles.text}>{pos.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 18,
    paddingHorizontal: 0,
  },
  row: {
    position: "relative",
    flex: 1,
  },
  monthLabel: {
    position: "absolute",
  },
  text: {
    fontSize: 9,
    color: COLORS.textTertiary,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.3,
  },
});
