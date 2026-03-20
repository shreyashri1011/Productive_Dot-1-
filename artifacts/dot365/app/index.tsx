import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";

import COLORS from "@/constants/colors";
import DotGrid from "@/components/DotGrid";
import RatingSheet from "@/components/RatingSheet";
import StatsBar from "@/components/StatsBar";
import LegendBar from "@/components/LegendBar";
import MonthLabels from "@/components/MonthLabels";
import {
  getDayOfYear,
  getTotalDaysInYear,
  useProductivity,
} from "@/context/ProductivityContext";

type SelectedDay = {
  date: Date;
  dayOfYear: number;
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { getStats } = useProductivity();
  const [selectedDay, setSelectedDay] = useState<SelectedDay | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const now = useMemo(() => new Date(), []);
  const todayDayOfYear = getDayOfYear(now);
  const year = now.getFullYear();
  const totalDays = getTotalDaysInYear(year);

  const handleDotPress = useCallback((date: Date, dayOfYear: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDay({ date, dayOfYear });
    setSheetOpen(true);
  }, []);

  const handleTodayPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedDay({ date: now, dayOfYear: todayDayOfYear });
    setSheetOpen(true);
  }, [now, todayDayOfYear]);

  const handleCloseSheet = useCallback(() => {
    setSheetOpen(false);
    setSelectedDay(null);
  }, []);

  const stats = getStats();

  const daysWord = stats.daysRemaining === 1 ? "day" : "days";

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>dot365</Text>
            <Text style={styles.subtitle}>{year} — {stats.daysRemaining} {daysWord} remaining</Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.todayButton,
              pressed && styles.todayButtonPressed,
            ]}
            onPress={handleTodayPress}
          >
            <Feather name="edit-2" size={14} color="#000" />
            <Text style={styles.todayButtonText}>Today</Text>
          </Pressable>
        </View>

        <StatsBar />

        <View style={styles.gridSection}>
          <MonthLabels />
          <DotGrid
            onDotPress={handleDotPress}
            selectedDay={selectedDay?.dayOfYear}
          />
        </View>

        <View style={styles.legendSection}>
          <LegendBar />
        </View>

        <View style={styles.footer}>
          <View style={styles.dotLegendRow}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.dotToday }]} />
            <Text style={styles.legendText}>Today</Text>
          </View>
          <View style={styles.dotLegendRow}>
            <View style={[styles.legendDot, { backgroundColor: "#2A2A2A" }]} />
            <Text style={styles.legendText}>Unrated past day</Text>
          </View>
          <View style={styles.dotLegendRow}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.dotFuture }]} />
            <Text style={styles.legendText}>Future day</Text>
          </View>
        </View>

        <Text style={styles.tip}>
          Tap any dot to rate your productivity that day
        </Text>
      </ScrollView>

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
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    gap: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.textPrimary,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  todayButton: {
    backgroundColor: COLORS.textPrimary,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  todayButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
  todayButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#000",
    fontFamily: "Inter_600SemiBold",
  },
  gridSection: {
    gap: 6,
  },
  legendSection: {
    paddingTop: 4,
  },
  footer: {
    paddingHorizontal: 24,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  dotLegendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: COLORS.textTertiary,
    fontFamily: "Inter_400Regular",
  },
  tip: {
    fontSize: 12,
    color: COLORS.textTertiary,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingHorizontal: 24,
  },
});
