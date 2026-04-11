import { createNavigationContainerRef, CommonActions } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef<any>();

// ─── Ready State ──────────────────────────────────────────────────────────────
let isNavigatorReady = false;

export const setNavigatorReady = () => {
    isNavigatorReady = true;
};

// ─── Wait for Navigator ───────────────────────────────────────────────────────
export const waitForNavigation = (): Promise<void> => {
    return new Promise((resolve) => {
        // ✅ Already ready
        if (isNavigatorReady && navigationRef.isReady()) {
            resolve();
            return;
        }

        // ✅ Poll every 100ms
        const interval = setInterval(() => {
            if (isNavigatorReady && navigationRef.isReady()) {
                clearInterval(interval);
                clearTimeout(timeout);
                resolve();
            }
        }, 100);

        // ✅ Timeout after 5s — avoid infinite wait
        const timeout = setTimeout(() => {
            clearInterval(interval);

            resolve();
        }, 5000);
    });
};

// ─── Safe Reset ───────────────────────────────────────────────────────────────
// Use for logout/force logout — clears back stack
// nestedRoute: if screen is inside a nested navigator
export const safeReset = async (
    routeName: string,
    nestedRoute?: string
) => {
    await waitForNavigation();


    navigationRef.dispatch(
        CommonActions.reset({
            index: 0,
            routes: [
                {
                    name: routeName,
                    // ✅ If screen is nested — set initial route of nested navigator
                    ...(nestedRoute && {
                        state: {
                            routes: [{ name: nestedRoute }],
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
    await waitForNavigation();


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