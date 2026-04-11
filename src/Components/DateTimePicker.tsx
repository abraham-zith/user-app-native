import { View, Button, Platform, Alert, ToastAndroid } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import Text from "./Text";
import { Styles } from "../lib/styles";


export type PickerMode = 'date' | 'time' | 'datetime';

interface DateTimePickerProps {
    value: Date;
    onChange: (date: Date) => void;
    mode: PickerMode;
    isVisible: boolean;
    onClose: () => void;
    minimumDate?: Date;
    maximumDate?: Date;
}

const DateTimePickerComponent: React.FC<DateTimePickerProps> = ({
    value,
    onChange,
    mode,
    isVisible,
    onClose,
    minimumDate,
    maximumDate
}) => {


    const handleNativeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {

        let newDate: Date | undefined = undefined;

        if (selectedDate instanceof Date) {
            newDate = selectedDate;
        }
        else if (event.nativeEvent && typeof event.nativeEvent.timestamp === 'number') {
            newDate = new Date(event.nativeEvent.timestamp);
        }

        if (event.type === 'set' && newDate instanceof Date && !isNaN(newDate.getTime())) {
            // // This is the successful path.
            // onChange(newDate);
            const now = new Date();
            const absoluteMinimumTime = new Date(now.getTime());
            absoluteMinimumTime.setMinutes(now.getMinutes() + 30);


            const selectedDateIsToday = newDate!.toDateString() === now.toDateString();
            const isTimeMode = mode === 'time';


            if (selectedDateIsToday && isTimeMode && newDate!.getTime() < absoluteMinimumTime.getTime()) {

                Alert.alert("Invalid Time", "Please select a time at least 30 minutes from now.");

            } else {
                // SUCCESS
                onChange(newDate!); // Call the parent handler
            }

        } else if (event.type === 'dismissed') {
            // Handle cancellation

        } else {
            ToastAndroid.show('Something Went Wrong!!! Try Later.', ToastAndroid.SHORT);
            // console.error("Picker set event failed to provide valid date:", event);
        }

        onClose();
    }

    if (!isVisible) {
        return null;
    }

    return (
        // <View style={[Styles.flex]}>
        //     {isVisible && (
        <DateTimePicker
            testID="dateTimePicker"
            value={value} // 💡 The current date/time value
            mode={mode}  // 💡 The mode to display (date or time)
            is24Hour={false}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleNativeChange} // 💡 Handler for when the user selects a new value
            minimumDate={minimumDate}
            maximumDate={maximumDate}
        />
        // )}
        // </View>

    );
};

export default DateTimePickerComponent;