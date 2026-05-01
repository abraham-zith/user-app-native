import { Alert, ToastAndroid } from 'react-native';
import { jwtDecode } from 'jwt-decode'; // ✅ named import
import { storage } from './utils/storage';
import { getDeviceId } from './utils/device';
import Config from "react-native-config";

// ─── Config ───────────────────────────────────────────────────────────────────
// const BASE_URL = 'http://10.0.2.2:1234/api';        // Android emulator
// export const BASE_URL = 'http://192.168.29.104:1234/api'; // Physical device
export const BASE_URL = `${Config.DEV_BACKEND_URL}/api`;
// export const BASE_URL = "https://noncruciformly-unsupplicated-rosalinda.ngrok-free.dev/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface TokenPayload {
    id: string;
    deviceId: string;
    role: string;
    exp: number;
    iat: number;
}

// ─── Device ID Cache ──────────────────────────────────────────────────────────
let DeviceIdPromise: Promise<string> | null = null;
const getCachedDeviceId = (): Promise<string> => {
    if (!DeviceIdPromise) {
        DeviceIdPromise = getDeviceId();
    }
    return DeviceIdPromise;
};

// ─── Token Helpers ────────────────────────────────────────────────────────────

// ✅ Check token expiry locally — no network call needed
export const isTokenExpired = (token: string): boolean => {
    try {
        const decoded = jwtDecode<TokenPayload>(token);
        return decoded.exp * 1000 < Date.now() + 10000; // 10 second buffer
    } catch {
        return true; // treat decode failure as expired
    }
};

// ✅ Try refresh token — returns new access token or null
export const tryRefreshToken = async (): Promise<string | null> => {
    try {
        const [refreshToken, device_id] = await Promise.all([
            storage.getRefreshToken(),
            getCachedDeviceId(),
        ]);

        if (!refreshToken) {
            return null;
        }

        // ✅ Check refresh token expiry locally first
        if (isTokenExpired(refreshToken)) {
            return null;
        }

        const response = await fetch(`${BASE_URL}/auth/refresh-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken, device_id }),
        });

        if (!response.ok) {
            Alert.alert('Something Went Wrong!!!', 'Try Again Later');
            // console.error(`[Auth] Refresh failed: ${response.status}`);
            return null;
        }

        const data = await response.json();
        const newAccessToken = data?.data?.accessToken;

        if (newAccessToken) {
            await storage.setAccessToken(newAccessToken);

            // ✅ Save new refresh token if returned
            if (data?.data?.refreshToken) {
                await storage.setRefreshToken(data.data.refreshToken);
            }

            return newAccessToken;
        }

        return null;
    } catch (err) {
        Alert.alert('Something Went Wrong!!!', 'Try Again Later');
        // console.error('[Auth] Refresh failed:', err);
        return null;
    }
};

// ─── Session Validation ───────────────────────────────────────────────────────

// ✅ Single call — validates token + device_id + force_logout + user status
export const validateSession = async (): Promise<{
    success: boolean;
    code?: string;
    data?: any;
    message?: string;
    notes?: string;
    status?: string;
    body?: any;
}> => {
    try {
        let accessToken = await storage.getAccessToken();

        // ✅ No token — not logged in
        if (!accessToken) {
            return { success: false, code: 'NO_TOKEN' };
        }

        // ✅ Check expiry locally — avoid unnecessary network call
        if (isTokenExpired(accessToken)) {

            const newToken = await tryRefreshToken();
            if (!newToken) {
                return { success: false, code: 'TOKEN_EXPIRED' };
            }

            accessToken = newToken;
        }

        const device_id = await getCachedDeviceId();

        // ✅ Single network call — validates everything on backend
        const response = await fetch(`${BASE_URL}/auth/validate-session`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'x-device-id': device_id,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return { success: false, code: data?.code, notes: data?.notes, status: data?.status, message: data?.message };
        }

        return { success: true, data: data?.data, notes: data?.notes, status: data?.status, message: data?.message };

    } catch (err) {
        // Alert.alert('Session Invalid!!!', 'Try Again Later');
        ToastAndroid.show('Session Invalid!!!', ToastAndroid.SHORT);
        // console.error('[Auth] validateSession failed:', err);
        return { success: false, code: 'NETWORK_ERROR' };
    }
};

// ─── Legacy getLoggedUser — kept for backward compatibility ───────────────────
// ✅ Now uses validateSession internally
export async function getLoggedUser() {
    const result = await validateSession();

    if (result.success) {
        return { success: true, data: result.data };
    }

    // ✅ Handle specific failure codes
    if (result.code === 'TOKEN_EXPIRED') {
        Alert.alert('Session Expired', 'Please log in again.');
        await storage.removeAccessToken();
        await storage.removeRefreshToken();
        return null;
    }

    if (result.code === 'NO_TOKEN') {
        return null;
    }

    return { success: false, code: result.code };
}
