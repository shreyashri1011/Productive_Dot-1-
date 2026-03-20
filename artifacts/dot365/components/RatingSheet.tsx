import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Animated,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import COLORS from "@/constants/colors";
import { useProductivity } from "@/context/ProductivityContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  date: Date;
  dayOfYear: number;
  onClose: () => void;
  isToday: boolean;
  isPast: boolean;
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

const ratingLabels: Record<number, string> = {
  0: "Unrated",
  1: "Terrible",
  2: "Very Bad",
  3: "Bad",
  4: "Below Average",
  5: "Average",
  6: "Good",
  7: "Very Good",
  8: "Great",
  9: "Excellent",
  10: "Perfect",
};

export default function RatingSheet({ date, dayOfYear, onClose, isToday, isPast }: Props) {
  const { getRating, saveRating } = useProductivity();
  const insets = useSafeAreaInsets();
  const existingData = getRating(date);
  const [selectedRating, setSelectedRating] = useState<number>(existingData?.rating ?? 0);
  const [note, setNote] = useState<string>(existingData?.note ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const slideAnim = useState(new Animated.Value(300))[0];
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 200,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  };

  const handleRatingSelect = (rating: number) => {
    setSelectedRating(rating);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSave = async () => {
    if (!isToday && !isPast) return;
    setIsSaving(true);
    await saveRating(date, selectedRating, note);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsSaving(false);
    handleClose();
  };

  const canEdit = isToday || isPast;
  const monthName = MONTHS[date.getMonth()];
  const dayNum = date.getDate();
  const year = date.getFullYear();

  const dotColor = isToday && selectedRating === 0
    ? COLORS.dotToday
    : selectedRating > 0
    ? COLORS.productivityColors[selectedRating]
    : COLORS.dotFuture;

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <Pressable style={styles.backdrop} onPress={handleClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <Animated.View
          style={[
            styles.sheet,
            { paddingBottom: insets.bottom + 16 },
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.grabber} />

          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.previewDot, { backgroundColor: dotColor }]} />
              <View>
                <Text style={styles.dateLabel}>
                  {monthName} {getOrdinal(dayNum)}
                </Text>
                <Text style={styles.dayLabel}>
                  Day {dayOfYear} of {year}
                </Text>
              </View>
            </View>
            <Pressable onPress={handleClose} style={styles.closeBtn}>
              <Feather name="x" size={20} color={COLORS.textSecondary} />
            </Pressable>
          </View>

          {!canEdit ? (
            <View style={styles.futureContainer}>
              <Feather name="clock" size={32} color={COLORS.textTertiary} />
              <Text style={styles.futureText}>This day hasn't happened yet</Text>
              <Text style={styles.futureSubtext}>Check back on {monthName} {dayNum}!</Text>
            </View>
          ) : (
            <>
              <View style={styles.ratingSection}>
                <Text style={styles.sectionLabel}>Productivity</Text>
                <Text style={styles.ratingLabel}>{ratingLabels[selectedRating]}</Text>

                <View style={styles.dotsRow}>
                  {Array.from({ length: 11 }, (_, i) => i).map((rating) => {
                    const color = rating === 0
                      ? COLORS.dotFuture
                      : COLORS.productivityColors[rating];
                    const isSelected = selectedRating === rating;
                    return (
                      <Pressable
                        key={rating}
                        onPress={() => handleRatingSelect(rating)}
                        style={styles.ratingDotWrapper}
                      >
                        <View
                          style={[
                            styles.ratingDot,
                            { backgroundColor: color },
                            isSelected && styles.ratingDotSelected,
                          ]}
                        />
                      </Pressable>
                    );
                  })}
                </View>

                <View style={styles.ratingScale}>
                  <Text style={styles.scaleLabel}>Skip</Text>
                  <Text style={styles.scaleLabel}>Best day</Text>
                </View>
              </View>

              <View style={styles.noteSection}>
                <Text style={styles.sectionLabel}>Note (optional)</Text>
                <TextInput
                  style={styles.noteInput}
                  placeholder="What made this day memorable?"
                  placeholderTextColor={COLORS.textTertiary}
                  value={note}
                  onChangeText={setNote}
                  multiline
                  numberOfLines={3}
                  maxLength={200}
                />
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.saveButton,
                  pressed && styles.saveButtonPressed,
                  isSaving && styles.saveButtonDisabled,
                ]}
                onPress={handleSave}
                disabled={isSaving}
              >
                <Text style={styles.saveButtonText}>
                  {isSaving ? "Saving..." : existingData ? "Update" : "Save"}
                </Text>
              </Pressable>
            </>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  keyboardView: {
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  grabber: {
    width: 36,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  previewDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  dateLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
    fontFamily: "Inter_700Bold",
  },
  dayLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: "Inter_400Regular",
  },
  closeBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: COLORS.surfaceElevated,
  },
  futureContainer: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 12,
  },
  futureText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontFamily: "Inter_500Medium",
  },
  futureSubtext: {
    fontSize: 13,
    color: COLORS.textTertiary,
    fontFamily: "Inter_400Regular",
  },
  ratingSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 12,
    color: COLORS.textTertiary,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  ratingLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontFamily: "Inter_500Medium",
    marginBottom: 16,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ratingDotWrapper: {
    padding: 6,
  },
  ratingDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  ratingDotSelected: {
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.7)",
    transform: [{ scale: 1.25 }],
  },
  ratingScale: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  scaleLabel: {
    fontSize: 11,
    color: COLORS.textTertiary,
    fontFamily: "Inter_400Regular",
  },
  noteSection: {
    marginBottom: 20,
  },
  noteInput: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 12,
    padding: 14,
    color: COLORS.textPrimary,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  saveButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000000",
    fontFamily: "Inter_700Bold",
  },
});
