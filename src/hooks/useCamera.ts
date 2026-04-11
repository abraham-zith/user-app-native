import { Platform, Alert } from 'react-native';
import { check, request, PERMISSIONS, RESULTS, openSettings, PermissionStatus } from 'react-native-permissions';

export const useCameraPermission = () => {
    const permission = Platform.OS === 'android'
        ? PERMISSIONS.ANDROID.CAMERA
        : PERMISSIONS.IOS.CAMERA;

    const requestCameraPermission = async (): Promise<boolean> => {
        try {
            const status: PermissionStatus = await check(permission);

            if (status === RESULTS.GRANTED) {
                return true;
            }

            if (status === RESULTS.DENIED) {
                const result = await request(permission);
                return result === RESULTS.GRANTED;
            }

            if (status === RESULTS.BLOCKED) {
                Alert.alert(
                    "Camera Permission",
                    "Camera access is blocked in your settings. Would you like to open settings to enable it?",
                    [
                        { text: "Cancel", style: "cancel" },
                        { text: "Open Settings", onPress: () => openSettings() }
                    ]
                );
                return false;
            }

            return false;
        } catch (error) {
            Alert.alert('Network Error!!!', 'Try Again Later');
            // console.error("Permission Hook Error:", error);
            return false;
        }
    };

    return { requestCameraPermission };
};