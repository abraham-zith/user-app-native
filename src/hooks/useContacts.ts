import { PermissionsAndroid, Platform, Alert } from 'react-native';
import { selectContactPhone, selectContact } from 'react-native-select-contact';
import { useRef, useState } from 'react';

export const useContactPicker = () => {
    const [loading, setLoading] = useState(false);
    const isPickerOpen = useRef(false);

    const pickContact = async () => {
        // 1. Prevent double-triggering
        if (isPickerOpen.current) {
            return null;
        }

        try {
            isPickerOpen.current = true;
            setLoading(true);
            // 2. Android Permission Check
            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.READ_CONTACTS
                );

                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    Alert.alert("Permission Denied", "We need contact access to book for others.");
                    isPickerOpen.current = false;
                    return null;
                }
            }

            // 3. Launch Native Picker
            const selection = await selectContact();

            // Release the lock immediately after the native UI closes
            // isPickerOpen.current = false;

            if (!selection) {
                return null;
            }

            // 4. Extract and Clean Data
            const { name, phones } = selection;


            return {
                name: name,
                // Clean the phone number (remove spaces, dashes, etc.)
                phone: phones[0].number.replace(/\s/g, '').replace(/[^0-9+]/g, '')
            };

        } catch (error) {
            isPickerOpen.current = false; // Always release on crash
            setLoading(false);
            Alert.alert('Network Error!!!', 'Try Again Later');
            // console.error("Internal Picker Error:", error);
            return null;
        }
    };

    return { pickContact, loading };
};
