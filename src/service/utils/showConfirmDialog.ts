// utils/showConfirmDialog.ts
import { Alert } from 'react-native';

export const showConfirmDialog = (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
        Alert.alert(
            'Device Conflict',
            message,
            [
                { text: 'Cancel', onPress: () => resolve(false), style: 'cancel' },
                { text: 'Yes, Log Out', onPress: () => resolve(true), style: 'destructive' },
            ],
            { cancelable: false }
        );
    });
};