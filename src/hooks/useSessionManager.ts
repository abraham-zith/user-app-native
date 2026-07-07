import { useEffect, useRef, useState } from 'react';
import { Alert, AppState, AppStateStatus } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { RootState, AppDispatch } from '../redux/store';
import { logout, setUser, setSuspensionData } from '../redux/userSlice';
import { clearActiveTrip, setTrips } from '../redux/tripSlice';
import { useGetActiveTripbyUserIdQuery, useUpdateFcmTokenMutation, userApi } from '../service/userApi';
import { useSocket } from '../Socket/SocketContext';
import { storage } from '../service/utils/storage';
import { validateSession } from '../service/validation';
import { safeReset } from '../Navigations/navigationRef';
import { OnboardingStatus } from '../enums/user.enum';
import {
  Auth_Nav,
  SignUpScreen_Nav,
  TabNavigation_Nav,
  WelcomeScreen_Nav,
  BookedTripScreen_Nav,
} from '../Navigations/navigations';
import { getActiveTripId, clearActiveTrip as clearActiveTripStorage } from '../service/utils/tripstorage';
import {
  requestNotificationPermission,
  syncFcmToken,
  onFcmTokenRefresh,
} from '../notifications';

/**
 * Manages the full session lifecycle:
 * - Token validation on app start
 * - User routing based on onboarding status
 * - Trip syncing via RTK Query + socket invalidation
 * - Force logout detection on foreground resume
 * - FCM token sync and refresh
 */
export const useSessionManager = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [checkingToken, setCheckingToken] = useState(true);

  const [updateFcmToken] = useUpdateFcmTokenMutation();
  const localuser = useSelector((state: RootState) => state.userSlice.user);
  const activeTrips = useSelector((state: RootState) => state.tripSlice.activeTrips);
  const suspensionData = useSelector((state: RootState) => state.userSlice.suspensionData);
  const userId = localuser?.id || '';
  const { onTripStatusChanged } = useSocket();

  const appState = useRef(AppState.currentState);

  // ─── Trip Auto-Sync via RTK Query ───────────────────────────────────────────
  const { data: tripData, isFetching } = useGetActiveTripbyUserIdQuery(userId, {
    skip: !userId,
  });

  // ─── Socket Listener: Invalidate trip cache on real-time updates ────────────
  useEffect(() => {
    const unsub = onTripStatusChanged((_data: any) => {
      dispatch(userApi.util.invalidateTags(['Trip']));
    });
    return () => unsub();
  }, [onTripStatusChanged, dispatch]);

  // ─── Sync trips from RTK Query response to Redux ───────────────────────────
  useEffect(() => {
    if (!isFetching && tripData?.success && tripData?.data) {
      dispatch(setTrips({
        activeTrips: tripData.data.activeTrips || [],
        scheduledTrips: tripData.data.scheduledTrips || [],
      }));
    } else if (!isFetching && tripData && !tripData.success) {
      dispatch(clearActiveTrip());
    }
  }, [tripData, isFetching, dispatch]);

  // ─── Force Logout Handler ──────────────────────────────────────────────────
  const handleForceLogout = async () => {
    await storage.removeAccessToken();
    await storage.removeRefreshToken();
    dispatch(logout());
    setCheckingToken(false);
    await safeReset(Auth_Nav, WelcomeScreen_Nav);
  };

  // ─── Route User Based on Onboarding Status ────────────────────────────────
  const routeUser = async (userData: any) => {
    const onboarding_status = userData?.onboarding_status?.toLowerCase();
    const status = userData?.status?.toLowerCase();
    const phone_verified = userData?.phone_verified;

    if (
      (onboarding_status === OnboardingStatus.COMPLETED || 
      (onboarding_status === OnboardingStatus.PROFILE_COMPLETED && phone_verified === true)) &&
      (status === 'active' || (suspensionData && activeTrips.length > 0))
    ) {
      const savedId = await getActiveTripId();
      if (savedId) {
          try {
              const result = await dispatch(userApi.endpoints.getByTripId.initiate(savedId)).unwrap();
              if (result.success && (
                  result.data.trip_status === 'LIVE' || 
                  result.data.trip_status === 'REQUESTED' ||
                  result.data.trip_status === 'ACCEPTED' ||
                  result.data.trip_status === 'ARRIVING' ||
                  result.data.trip_status === 'ARRIVED' ||
                  result.data.trip_status === 'DESTINATION_REACHED' ||
                  result.data.trip_status === 'COMPLETED'
              )) {
                  safeReset(BookedTripScreen_Nav, undefined, { ...result.data });
                  setCheckingToken(false);
                  return;
              } else {
                  await clearActiveTripStorage();
              }
          } catch (err) {
              console.error("Session Resume Error:", err);
          }
      }
      
      safeReset(TabNavigation_Nav);
      setCheckingToken(false);
      return;
    }

    setCheckingToken(false);
    if (onboarding_status === OnboardingStatus.PHONE_VERIFIED) {
      safeReset(SignUpScreen_Nav);
      return;
    }

    safeReset(Auth_Nav, WelcomeScreen_Nav);
  };

  // ─── Validate and Initialize Session ──────────────────────────────────────
  const validateAndInitSession = async () => {
    try {
      const result = await validateSession();
      console.log(JSON.stringify(result, null, 2));
      console.log("result.notes", result.notes);
      console.log("result.status", result.status);
      console.log("result.message", result.message);

      switch (result.code) {
        case 'NO_TOKEN':
          dispatch(logout());
          setCheckingToken(false);
          return;

        case 'TOKEN_EXPIRED':
          dispatch(logout());
          setCheckingToken(false);
          return;

        case 'FORCE_LOGOUT':
          await handleForceLogout();
          return;

        case 'SESSION_EXPIRED':
          dispatch(logout());
          setCheckingToken(false);
          return;

        case 'ACCOUNT_DISABLED':
        case 'ACCOUNT_SUSPENDED':
        case 'ACCOUNT_BLOCKED':
          console.log("result.notes", result.notes);

          dispatch(setSuspensionData({
            status: result.code === 'ACCOUNT_SUSPENDED' ? 'suspended' : 'blocked',
            reason: result.notes || result?.message || 'No reason provided by admin'
          }));

          // If no active trips, log out immediately
          if (activeTrips.length === 0) {
            dispatch(logout());
            setCheckingToken(false);
          } else {
            // If active trips, let them finish. Route them to TabNav
            if (result.data) {
              dispatch(setUser(result.data));
              routeUser(result.data);
            }
          }
          return;

        case 'NETWORK_ERROR':
          if (localuser) {
            routeUser(localuser);
          } else {
            setCheckingToken(false);
          }
          return;
      }

      if (result.success && result.data) {
        dispatch(setUser(result.data));
        await syncFcmToken(result.data.id, updateFcmToken);
        routeUser(result.data);
      } else {
        dispatch(logout());
        setCheckingToken(false);
      }

    } catch {
      Alert.alert('Network Error!!!', 'Try Again Later');
      dispatch(logout());
      setCheckingToken(false);
    }
  };

  // ─── Check Force Logout on Foreground Resume ──────────────────────────────
  const checkForceLogoutStatus = async () => {
    const token = await storage.getAccessToken();
    if (!token) return;

    const result = await validateSession();

    if (!result.success) {
      switch (result.code) {
        case 'FORCE_LOGOUT':
          Alert.alert(
            'Session Ended',
            'Your account was accessed from another device.',
            [{ text: 'OK', onPress: handleForceLogout }],
            { cancelable: false }
          );
          break;

        case 'SESSION_EXPIRED':
        case 'TOKEN_EXPIRED':
          await handleForceLogout();
          break;

        case 'ACCOUNT_DISABLED':
        case 'ACCOUNT_SUSPENDED':
        case 'ACCOUNT_BLOCKED':
          dispatch(setSuspensionData({
            status: result.code === 'ACCOUNT_SUSPENDED' ? 'suspended' : 'blocked',
            reason: result.data?.notes || result.data?.reason || 'No reason provided by admin'
          }));
          if (activeTrips.length === 0) {
            await handleForceLogout();
          }
          break;

        case 'NETWORK_ERROR':
          break;
      }
    } else if (result.data) {
      dispatch(setUser(result.data));
    }
  };

  // ─── AppState Listener — detect background → foreground ───────────────────
  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      async (nextState: AppStateStatus) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextState === 'active'
        ) {
          await checkForceLogoutStatus();
        }
        appState.current = nextState;
      }
    );
    return () => subscription.remove();
  }, []);

  // ─── FCM Token Refresh Listener ───────────────────────────────────────────
  useEffect(() => {
    if (!userId) return;
    const unsubscribe = onFcmTokenRefresh(userId, updateFcmToken);
    return unsubscribe;
  }, [userId]);

  // ─── Deferred Suspension Logout Listener ──────────────────────────────────
  useEffect(() => {
    if (suspensionData && activeTrips.length === 0 && localuser) {
      handleForceLogout();
    }
  }, [suspensionData, activeTrips.length, localuser]);

  // ─── App Init ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      await requestNotificationPermission();
      await validateAndInitSession();
    };
    init();
  }, []);

  return { checkingToken };
};
