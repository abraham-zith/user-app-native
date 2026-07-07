import { createNavigationContainerRef, CommonActions } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef<any>();

// ─── Ready State ──────────────────────────────────────────────────────────────
let isNavigatorReady = false;

export const setNavigatorReady = () => {
    isNavigatorReady = true;
};

// ─── Wait for Navigator ───────────────────────────────────────────────────────
export const waitForNavigation = (timeoutMs = 5000): Promise<boolean> => {
    return new Promise((resolve) => {
        // ✅ Already ready
        if (isNavigatorReady && navigationRef.isReady()) {
            resolve(true);
            return;
        }

        // ✅ Poll every 100ms
        const interval = setInterval(() => {
            if (isNavigatorReady && navigationRef.isReady()) {
                clearInterval(interval);
                clearTimeout(timeout);
                resolve(true);
            }
        }, 100);

        // ✅ Timeout after timeoutMs — avoid infinite wait
        const timeout = setTimeout(() => {
            clearInterval(interval);
            console.warn(`waitForNavigation: Timeout after ${timeoutMs}ms`);
            resolve(false);
        }, timeoutMs);
    });
};

// ─── Safe Reset ───────────────────────────────────────────────────────────────
// Use for logout/force logout — clears back stack
// nestedRoute: if screen is inside a nested navigator
export const safeReset = async (
    routeName: string,
    nestedRoute?: string,
    params?: any
) => {
    const isReady = await waitForNavigation();

    if (!isReady || !navigationRef.isReady()) {
        console.error("safeReset: Navigation is not ready");
        return;
    }

    navigationRef.dispatch(
        CommonActions.reset({
            index: 0,
            routes: [
                {
                    name: routeName,
                    params,
                    // ✅ If screen is nested — set initial route of nested navigator
                    ...(nestedRoute && {
                        state: {
                            routes: [{ name: nestedRoute, params }],
                        },
                    }),
                },
            ],
        })
    );
};

// ─── Safe Navigate ────────────────────────────────────────────────────────────
// Use for normal navigation — keeps back stack
export const safeNavigate = async (routeName: string, params?: any) => {
    const isReady = await waitForNavigation();

    if (!isReady || !navigationRef.isReady()) {
        console.error("safeNavigate: Navigation is not ready");
        return;
    }

    navigationRef.dispatch(
        CommonActions.navigate({
            name: routeName,
            params: params,
        })
    );
};

// ─── Keep old export for backward compatibility ───────────────────────────────
// ✅ Old safeNavigationReset calls will still work
export const safeNavigationReset = safeReset;