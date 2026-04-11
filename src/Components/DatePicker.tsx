
import React, { useState } from "react";
import { View, StyleSheet, Text, Modal, Pressable, Platform } from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { useAppTheme } from "../hooks/useAppTheme";
// import DateTimePicker from "@react-native-community/datetimepicker";

type PickerMode = "single" | "range";

interface Props {
    mode: PickerMode;                // "single" | "range"
    visible: boolean;
    onClose?: () => void;
    onSelect?: (date: string) => void;                     // for single mode
    onRangeSelect?: (start: string, end: string) => void;  // for range mode
}

const toDate = (dateStr: string) => new Date(dateStr + "T00:00:00");

const DatePicker: React.FC<Props> = ({
    mode,
    visible,
    onClose,
    onSelect,
    onRangeSelect
}) => {

    const { colors: appColors, isDark } = useAppTheme();
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    // Range state
    const [click1, setClick1] = useState<string | null>(null);
    const [click2, setClick2] = useState<string | null>(null);

    const startDate =
        click1 && click2 ? (click1 < click2 ? click1 : click2) : click1;

    const endDate =
        click1 && click2 ? (click1 < click2 ? click2 : click1) : click2;

    const isRangeComplete = !!(startDate && endDate);

    // const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().split("T")[0]);
    // const [showJumpPicker, setShowJumpPicker] = useState(false);

    // const handleJumpChange = (event: any, selectedDate?: Date) => {
    //     // Close the native picker (Platform-specific logic)
    //     setShowJumpPicker(Platform.OS === 'ios');

    //     if (selectedDate) {
    //         // 💡 CRITICAL: Update the state that controls the Calendar's 'current' prop
    //         setCurrentMonth(selectedDate.toISOString().split("T")[0]);
    //     }
    // };

    // const openJumpPicker = () => {
    //     setShowJumpPicker(true);
    // };

    // --------- HANDLE DATE PRESS ---------
    const onDayPress = (day: DateData) => {
        const d = day.dateString;

        if (mode === "single") {
            setSelectedDate(d);
            onSelect?.(d);
            // onClose?.();
            return;
        }

        // RANGE MODE
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

    // --------- MARKED DATES ---------
    const getMarkedDates = () => {
        let marked: any = {};

        if (mode === "single" && selectedDate) {
            marked[selectedDate] = {
                selected: true,
                color: "#2479dd",
                textColor: "#fff"
            };
        }

        if (mode === "range" && startDate && endDate) {
            let curr = toDate(startDate);
            let last = toDate(endDate);

            while (curr <= last) {
                let d = curr.toISOString().split("T")[0];
                marked[d] = {
                    color: isDark ? 'rgba(36, 121, 221, 0.4)' : "#a7c7f5",
                    textColor: isDark ? "#fff" : "#000",
                    startingDay: false,
                    endingDay: false,
                };
                curr.setDate(curr.getDate() + 1);
            }

            marked[startDate] = {
                startingDay: true,
                color: "#2479dd",
                textColor: "#fff"
            };

            marked[endDate] = {
                endingDay: true,
                color: "#2479dd",
                textColor: "#fff"
            };

            // Handle the single day range case (where start === end)
            if (startDate === endDate) {
                marked[startDate] = {
                    startingDay: true,
                    endingDay: true,
                    color: '#2479dd',
                    textColor: "#fff"
                };
            }
        }
        // If only the start date is selected (in range mode), highlight it
        if (mode === "range" && startDate && !endDate) {
            marked[startDate] = {
                selected: true,
                color: '#2479dd',
                textColor: "#fff"
            };
        }

        return marked;
    };

    return (
        <Modal statusBarTranslucent navigationBarTranslucent visible={visible} animationType="slide" transparent={true}>
            <View style={styles.modalContainer}>
                <View style={[styles.modalBox, { backgroundColor: appColors.card }]}>

                    {/* Header */}
                    {/* <View style={styles.headerContainer}> */}

                    {mode === "single" ? (
                        <Text style={styles.statusText}>Select Date</Text>
                    ) : (
                        <Text style={styles.statusText}>
                            {isRangeComplete
                                ? `Selected: ${startDate} → ${endDate}`
                                : startDate
                                    ? "Select End Date"
                                    : "Select Start Date"}
                        </Text>
                    )}
                    {/* <Pressable style={styles.jumpBtn} onPress={openJumpPicker}>
                            <Text style={styles.jumpBtnTxt}>Jump Year</Text>
                        </Pressable>
                    </View> */}

                    <Calendar
                        markingType={mode === "range" ? "period" : "custom"}
                        markedDates={getMarkedDates()}
                        onDayPress={onDayPress}
                        enableSwipeMonths={true}
                        // onVisibleMonthsChange={(months) => {
                        //     if (months.length > 0) {
                        //         setCurrentMonth(months[0].dateString);
                        //     }
                        // }}
                        style={styles.calendar}
                        theme={{
                            calendarBackground: appColors.card,
                            textSectionTitleColor: appColors.lightTextColor,
                            dayTextColor: appColors.text,
                            todayTextColor: "#2479dd",
                            selectedDayBackgroundColor: "#2479dd",
                            monthTextColor: appColors.text,
                            textDisabledColor: appColors.border,
                            arrowColor: appColors.text,
                        }}
                    // theme={{ todayTextColor: "#2479dd" }}
                    />

                    <Pressable style={styles.closeBtn} onPress={onClose}>
                        <Text style={[styles.closeBtnTxt, { color: '#fff' }]}>Close</Text>
                    </Pressable>

                </View>
            </View>
            {/* {showJumpPicker && (
                <DateTimePicker
                    value={toDate(currentMonth)}
                    mode="date" // Allows year and month selection
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleJumpChange}
                />
            )} */}
        </Modal>
    );
};

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
    calendar: { borderRadius: 8 },
    modalContainer: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center"
    },
    modalBox: {
        backgroundColor: "#fff",
        width: "90%",
        padding: 20,
        borderRadius: 12,
        elevation: 10
    },
    headerContainer: { // New style for the header row
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    statusText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#2479dd",
        marginBottom: 15,
        textAlign: "center"
    },
    closeBtn: {
        marginTop: 20,
        backgroundColor: "#2479dd",
        padding: 12,
        borderRadius: 8
    },
    closeBtnTxt: {
        textAlign: "center",
        fontWeight: "600",
        fontSize: 15
    },
    jumpBtn: { // Style for the new button
        backgroundColor: "#585858",
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 6,
    },
    jumpBtnTxt: {
        color: '#fff',
        fontWeight: '500',
        fontSize: 14
    }
});

export default DatePicker;

