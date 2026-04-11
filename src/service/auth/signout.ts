import { storage } from "../utils/storage";
import { logout } from "../../redux/userSlice";
import { useDispatch } from "react-redux";
import { CommonActions, useNavigation } from "@react-navigation/native"; // Not strictly needed for navigation.reset but good to keep if used elsewhere
import { useSignOutUserMutation } from "../userApi";
import { Alert, ToastAndroid } from "react-native";
import { getDeviceId } from "../utils/device";

// Define the API response structure to ensure type safety
interface SignOutApiResponse {
    success: boolean;
    message?: string; // Add message property if your API returns one
}

export const useSignOut = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation<any>();
    // Destructure the trigger function and the status object
    const [signOutUser] = useSignOutUserMutation();

    // Define the core sign-out logic
    const signOut = async (id: string) => {

        const device_id = await getDeviceId();


        try {

            // 1. CALL LOGOUT API
            const data = {
                id: id,
                device_id: device_id,
                role: 'customer'
            }
            const response: SignOutApiResponse = await signOutUser(data).unwrap();

            if (response.success) {

                // --- SUCCESSFUL SIGNOUT: Perform Cleanup ---

                // 2. Remove tokens from storage (keychain)
                await storage.removeAccessToken();
                await storage.removeRefreshToken();

                // 3. Clear redux user state
                dispatch(logout());

                // 4. Reset navigation stack (CRITICAL for security)
                navigation.reset({
                    index: 0,
                    routes: [
                        {
                            name: "AuthNavigation",
                            params: { screen: "LoginScreen" }
                        }
                    ],
                });

                // Optional: Show a successful toast/alert if needed
                ToastAndroid.show("Signed out successfully!", ToastAndroid.SHORT);

            } else {
                // API returned 200 OK but with success: false (Business Logic Error)
                Alert.alert(
                    'Signout Failed',
                    response.message || 'Server failed to process signout. Please try again.'
                );
            }

        } catch (apiError) {
            // Catches network errors, timeout, and API errors (4xx, 5xx) thrown by .unwrap()
            // console.error("Signout Process Error:", apiError);
            // await storage.removeAccessToken();
            // dispatch(logout());
            // Show a generic error message to the user
            Alert.alert(
                'Signout Error',
                'Could not complete signout request. Please check your network.'
            );

        }
    };

    return { signOut };
};
