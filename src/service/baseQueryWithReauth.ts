import { fetchBaseQuery, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { BaseQueryApi } from "@reduxjs/toolkit/query";
import { storage } from "./utils/storage";
import { logout } from "../redux/userSlice";
import { getDeviceId } from "./utils/device";
import { navigationRef, safeReset } from "../Navigations/navigationRef";
import { Auth_Nav, WelcomeScreen_Nav } from "../Navigations/navigations";
import { Alert } from "react-native";
import Config from "react-native-config";

// const BASE_URL = "http://192.168.29.104:1234/api";
const BASE_URL = `${Config.DEV_BACKEND_URL}/api`;
// const BASE_URL = "https://noncruciformly-unsupplicated-rosalinda.ngrok-free.dev/api";


interface RefreshResponse {
    accessToken: string;
    refreshToken: string;
}

// ─── Cache Device ID ──────────────────────────────────────────────────────────
let DeviceIdPromise: Promise<string> | null = null;
const getCachedDeviceId = () => {
    if (!DeviceIdPromise) {
        DeviceIdPromise = getDeviceId();
    }
    return DeviceIdPromise;
};

// ─── Raw Base Query ───────────────────────────────────────────────────────────
const rawBaseQuery = fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: async (headers, { endpoint }) => {
        const [token, device_id] = await Promise.all([
            storage.getAccessToken(),
            getCachedDeviceId(),
        ]);



        if (token && endpoint !== 'uploadImageToS3') {
            headers.set('Authorization', `Bearer ${token}`);
        }

        // ✅ Always send device_id for force logout check in authMiddleware
        if (device_id) {
            headers.set('x-device-id', device_id);
        }

        // ✅ Send socket ID so the backend knows who to broadcast to or skip
        const socketId = storage.getSocketId();
        if (socketId) {
            headers.set('x-socket-id', socketId);
        }

        headers.set('ngrok-skip-browser-warning', 'true');
        headers.set('Accept', 'application/json');

        if (!headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json');
        }

        return headers;
    },
});

// ─── Force Logout Handler ─────────────────────────────────────────────────────
const handleForceLogout = async (api: BaseQueryApi) => {
    // ✅ Clear tokens
    await storage.removeAccessToken();
    await storage.removeRefreshToken();

    // ✅ Clear Redux
    api.dispatch(logout());

    // ✅ Reset navigation to WelcomeScreen
    await safeReset(Auth_Nav, WelcomeScreen_Nav);
};

// ─── Base Query With Reauth ───────────────────────────────────────────────────
export const baseQueryWithReauth = async (
    args: string | FetchArgs,
    api: BaseQueryApi,
    extraOptions: any
) => {
    let result = await rawBaseQuery(args, api, extraOptions);

    // ✅ Debug parsing errors
    if (result.error && result.error.status === 'PARSING_ERROR') {
        Alert.alert('Something Went Wrong!!!', 'Try Again Later');
        // console.error('[API] HTML detected instead of JSON:', result.error.data);
    }

    // ✅ Handle 401
    if (result.error && (result.error as FetchBaseQueryError).status === 401) {
        const errorData = result.error.data as any;

        // ✅ FORCE_LOGOUT — another device logged in
        if (errorData?.code === 'FORCE_LOGOUT') {


            Alert.alert(
                'Session Ended',
                'Your account has been accessed from another device. You have been logged out.',
                [
                    {
                        text: 'OK',
                        onPress: () => handleForceLogout(api),
                    },
                ],
                { cancelable: false }
            );

            return result;
        }

        // ✅ Normal 401 — try refresh token


        const [refreshToken, device_id] = await Promise.all([
            storage.getRefreshToken(),
            getCachedDeviceId(),
        ]);

        if (!refreshToken) {

            await handleForceLogout(api);
            return result;
        }

        const refreshResult = await rawBaseQuery(
            {
                url: '/auth/refresh-token',
                method: 'POST',
                body: { refreshToken, device_id },
            },
            api,
            extraOptions
        );

        if (refreshResult.data) {
            // ✅ Save new tokens
            const tokens = (refreshResult as any).data?.data as RefreshResponse;
            await Promise.all([
                storage.setAccessToken(tokens.accessToken),
                storage.setRefreshToken(tokens.refreshToken),
            ]);

            // ✅ Retry original request with new token
            result = await rawBaseQuery(args, api, extraOptions);
        } else {
            // ✅ Refresh failed — logout

            await handleForceLogout(api);
        }
    }

    return result;
};