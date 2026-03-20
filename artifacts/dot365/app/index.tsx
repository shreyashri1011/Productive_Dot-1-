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
  const { isLoaded } = useProductivity();
  const [selectedDay, setSelectedDay] = useState<SelectedDay | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const now = useMemo(() => new Date(), []);
  const todayDayOfYear = getDayOfYear(now);

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

  const hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  const timeString = `${displayHour}:${minutes}`;

  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.timeSection}>
          <Text style={styles.time}>{timeString}</Text>
          <Text style={styles.date}>{dateStr}</Text>
        </View>

        <View style={styles.gridWrapper}>
          <DotGrid
            onDotPress={handleDotPress}
            selectedDay={selectedDay?.dayOfYear}
          />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.rateButton,
            pressed && styles.rateButtonPressed,
          ]}
          onPress={handleTodayPress}
        >
          <Feather name="edit-2" size={13} color="rgba(255,255,255,0.5)" />
          <Text style={styles.rateButtonText}>Rate today</Text>
        </Pressable>
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
    flexGrow: 1,
    paddingBottom: 40,
    justifyContent: "center",
    gap: 28,
  },
  timeSection: {
    alignItems: "center",
    paddingTop: 20,
    gap: 4,
  },
  time: {
    fontSize: 72,
    fontWeight: "200",
    color: COLORS.textPrimary,
    fontFamily: "Inter_400Regular",
    letterSpacing: -2,
  },
  date: {
    fontSize: 14,
    color: "rgba(255,255,255,0.4)",
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.2,
  },
  gridWrapper: {
    paddingVertical: 4,
  },
  rateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  rateButtonPressed: {
    opacity: 0.6,
  },
  rateButtonText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.3,
  },
});
