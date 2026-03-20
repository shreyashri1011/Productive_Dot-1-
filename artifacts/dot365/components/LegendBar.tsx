import React from "react";
import { View, Text, StyleSheet } from "react-native";
import COLORS from "@/constants/colors";

export default function LegendBar() {
  const steps = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Low</Text>
      <View style={styles.dotsRow}>
        {steps.map((s) => (
          <View
            key={s}
            style={[
              styles.dot,
              {
                backgroundColor:
                  s === 0 ? "#2A2A2A" : COLORS.productivityColors[s],
              },
            ]}
          />
        ))}
      </View>
      <Text style={styles.label}>High</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 24,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 3,
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: 10,
    color: COLORS.textTertiary,
    fontFamily: "Inter_400Regular",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
