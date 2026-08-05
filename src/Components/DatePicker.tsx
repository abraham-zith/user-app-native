
import React, { useState } from "react";
import { View, StyleSheet, Text, Modal, Pressable, TouchableOpacity } from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import type { Theme } from "react-native-calendars/src/types";
import { useAppTheme } from "../hooks/useAppTheme";


type PickerMode = "single" | "range";

interface Props {
    mode: PickerMode;
    visible: boolean;
    onClose?: () => void;
    onSelect?: (date: string) => void;
    onRangeSelect?: (start: string, end: string) => void;
    minDate?: string;  // YYYY-MM-DD
    maxDate?: string;  // YYYY-MM-DD
}

const toDate = (dateStr: string) => new Date(dateStr + "T00:00:00");

// Returns "YYYY-MM-01" for a given Date
const toMonthKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;

// Formats a YYYY-MM-01 string to "Month YYYY"
const formatMonthLabel = (key: string) => {
    const [year, month] = key.split('-').map(Number);
    const d = new Date(year, month - 1, 1);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

const DatePicker: React.FC<Props> = ({
    mode,
    visible,
    onClose,
    onSelect,
    onRangeSelect,
    minDate,
    maxDate,
}) => {
    const { colors: appColors, isDark } = useAppTheme();
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    // Custom month navigation state
    const [currentMonthKey, setCurrentMonthKey] = useState<string>(toMonthKey(new Date()));

    // Range state
    const [click1, setClick1] = useState<string | null>(null);
    const [click2, setClick2] = useState<string | null>(null);

    const startDate = click1 && click2 ? (click1 < click2 ? click1 : click2) : click1;
    const endDate = click1 && click2 ? (click1 < click2 ? click2 : click1) : click2;
    const isRangeComplete = !!(startDate && endDate);

    // ─── Month navigation ───
    const canGoBack = () => {
        if (!minDate) return true;
        const [y, m] = currentMonthKey.split('-').map(Number);
        const prev = new Date(y, m - 2, 1);
        const minD = new Date(minDate + 'T00:00:00');
        // Allow going back if previous month starts on or before the last day of that month
        return toMonthKey(prev) >= toMonthKey(minD) || prev >= minD;
    };

    const canGoForward = () => {
        if (!maxDate) return true;
        const [y, m] = currentMonthKey.split('-').map(Number);
        const next = new Date(y, m, 1);
        const maxD = new Date(maxDate + 'T00:00:00');
        return next <= maxD;
    };

    const goToPrevMonth = () => {
        if (!canGoBack()) return;
        const [y, m] = currentMonthKey.split('-').map(Number);
        setCurrentMonthKey(toMonthKey(new Date(y, m - 2, 1)));
    };

    const goToNextMonth = () => {
        if (!canGoForward()) return;
        const [y, m] = currentMonthKey.split('-').map(Number);
        setCurrentMonthKey(toMonthKey(new Date(y, m, 1)));
    };

    // ─── Day press ───
    const onDayPress = (day: DateData) => {
        const d = day.dateString;

        if (mode === "single") {
            setSelectedDate(d);
            onSelect?.(d);
            return;
        }

        if (!click1 || isRangeComplete) {
            setClick1(d);
            setClick2(null);
            return;
        }
        setClick2(d);
        const start = click1 < d ? click1 : d;
        const end = click1 < d ? d : click1;
        onRangeSelect?.(start, end);
        onClose?.();
    };

    // ─── Marked dates ───
    const getMarkedDates = () => {
        let marked: any = {};

        if (mode === "single" && selectedDate) {
            marked[selectedDate] = { selected: true, color: "#2479dd", textColor: "#fff" };
        }

        if (mode === "range" && startDate && endDate) {
            let curr = toDate(startDate);
            const last = toDate(endDate);
            while (curr <= last) {
                const d = curr.toISOString().split("T")[0];
                marked[d] = {
                    color: isDark ? 'rgba(36,121,221,0.4)' : "#a7c7f5",
                    textColor: isDark ? "#fff" : "#000",
                    startingDay: false,
                    endingDay: false,
                };
                curr.setDate(curr.getDate() + 1);
            }
            marked[startDate] = { startingDay: true, color: "#2479dd", textColor: "#fff" };
            marked[endDate] = { endingDay: true, color: "#2479dd", textColor: "#fff" };
            if (startDate === endDate) {
                marked[startDate] = { startingDay: true, endingDay: true, color: '#2479dd', textColor: "#fff" };
            }
        }

        if (mode === "range" && startDate && !endDate) {
            marked[startDate] = { selected: true, color: '#2479dd', textColor: "#fff" };
        }

        return marked;
    };

    return (
        <Modal statusBarTranslucent navigationBarTranslucent visible={visible} animationType="slide" transparent>
            <View style={styles.modalContainer}>
                <View style={[styles.modalBox, { backgroundColor: appColors.card }]}>

                    {/* Status label */}
                    {mode === "single" ? (
                        <Text style={styles.statusText}>Select Date</Text>
                    ) : (
                        <Text style={styles.statusText}>
                            {isRangeComplete
                                ? `Selected: ${startDate} → ${endDate}`
                                : startDate ? "Select End Date" : "Select Start Date"}
                        </Text>
                    )}

                    {/* ── Custom month header with always-visible arrows ── */}
                    <View style={styles.navRow}>
                        <TouchableOpacity
                            style={[styles.arrowBtn, !canGoBack() && styles.arrowDisabled]}
                            onPress={goToPrevMonth}
                            disabled={!canGoBack()}
                            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        >
                            <Text style={[styles.arrowText, { color: canGoBack() ? "#2479dd" : appColors.border }]}>
                                ◀
                            </Text>
                        </TouchableOpacity>

                        <Text style={[styles.monthLabel, { color: appColors.text }]}>
                            {formatMonthLabel(currentMonthKey)}
                        </Text>

                        <TouchableOpacity
                            style={[styles.arrowBtn, !canGoForward() && styles.arrowDisabled]}
                            onPress={goToNextMonth}
                            disabled={!canGoForward()}
                            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        >
                            <Text style={[styles.arrowText, { color: canGoForward() ? "#2479dd" : appColors.border }]}>
                                ▶
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Calendar — header hidden since we have our own above */}
                    <Calendar
                        key={currentMonthKey}
                        current={currentMonthKey}
                        markingType={mode === "range" ? "period" : "custom"}
                        markedDates={getMarkedDates()}
                        onDayPress={onDayPress}
                        hideArrows={true}
                        hideExtraDays={false}
                        disableMonthChange={true}
                        maxDate={maxDate}
                        renderHeader={() => null}
                        style={styles.calendar}
                        theme={{
                            calendarBackground: appColors.card,
                            textSectionTitleColor: appColors.lightTextColor,
                            dayTextColor: appColors.text,
                            todayTextColor: "#2479dd",
                            selectedDayBackgroundColor: "#2479dd",
                            monthTextColor: 'transparent',   // hidden — we show our own
                            textDisabledColor: appColors.border,
                            arrowColor: "transparent",
                            'stylesheet.calendar.header': {
                                header: { height: 0, overflow: 'hidden' },
                            },
                        } as Theme}
                    />

                    <Pressable style={styles.closeBtn} onPress={onClose}>
                        <Text style={[styles.closeBtnTxt, { color: '#fff' }]}>Close</Text>
                    </Pressable>

                </View>
            </View>
        </Modal>
    );
};

// ─── STYLES ───
const styles = StyleSheet.create({
    calendar: { borderRadius: 8 },
    modalContainer: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalBox: {
        width: "90%",
        padding: 20,
        borderRadius: 12,
        elevation: 10,
    },
    statusText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#2479dd",
        marginBottom: 12,
        textAlign: "center",
    },
    navRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
        paddingHorizontal: 4,
    },
    arrowBtn: {
        padding: 4,
        minWidth: 32,
        alignItems: 'center',
    },
    arrowText: {
        fontSize: 20,
        fontWeight: '700',
        lineHeight: 28,
        includeFontPadding: false,
    },
    arrowDisabled: {
        opacity: 0.3,
    },
    monthLabel: {
        fontSize: 16,
        fontWeight: '700',
    },
    closeBtn: {
        marginTop: 20,
        backgroundColor: "#2479dd",
        padding: 12,
        borderRadius: 8,
    },
    closeBtnTxt: {
        textAlign: "center",
        fontWeight: "600",
        fontSize: 15,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    jumpBtn: {
        backgroundColor: "#585858",
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 6,
    },
    jumpBtnTxt: {
        color: '#fff',
        fontWeight: '500',
        fontSize: 14,
    },
});

export default DatePicker;
