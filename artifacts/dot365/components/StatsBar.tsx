import React from "react";
import { View, Text, StyleSheet } from "react-native";
import COLORS from "@/constants/colors";
import { useProductivity } from "@/context/ProductivityContext";

export default function StatsBar() {
  const { getStats } = useProductivity();
  const stats = getStats();

  const avgFormatted =
    stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "—";

  return (
    <View style={styles.container}>
      <StatItem value={`${stats.daysCompleted}`} label="Completed" />
      <Divider />
      <StatItem value={`${stats.daysRemaining}`} label="Remaining" />
      <Divider />
      <StatItem value={`${stats.percentComplete}%`} label="Of year" />
      <Divider />
      <StatItem value={avgFormatted} label="Avg score" />
    </View>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginHorizontal: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textTertiary,
    fontFamily: "Inter_400Regular",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.border,
  },
});
