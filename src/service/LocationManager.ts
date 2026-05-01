import Geolocation, { GeoPosition, GeoError } from 'react-native-geolocation-service';

export enum LocationStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  RETRYING = 'retrying',
  PERMISSION_DENIED = 'permission_denied',
}

export enum LocationErrorType {
  PERMISSION_DENIED = 1,
  POSITION_UNAVAILABLE = 2,
  TIMEOUT = 3,
}

export interface LocationUpdate {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface LocationError {
  type: LocationErrorType;
  message: string;
  isRecoverable: boolean;
}

type LocationUpdateCallback = (location: LocationUpdate) => void;
type ErrorCallback = (error: LocationError) => void;
type StatusChangeCallback = (status: LocationStatus) => void;

class LocationManager {
  private static instance: LocationManager;
  private watchId: number | null = null;
  private status: LocationStatus = LocationStatus.DISCONNECTED;
  private lastLocation: LocationUpdate | null = null;
  private retryCount: number = 0;
  private maxRetries: number = 5;
  private staleTimer: ReturnType<typeof setTimeout> | null = null;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly STALE_THRESHOLD = 30000; // 30 seconds
  private readonly ACCURACY_THRESHOLD = 5000; // 5 kilometers

  // Event Listeners
  private onLocationUpdateListeners: LocationUpdateCallback[] = [];
  private onErrorListeners: ErrorCallback[] = [];
  private onStatusChangeListeners: StatusChangeCallback[] = [];

  private constructor() {}

  public static getInstance(): LocationManager {
    if (!LocationManager.instance) {
      LocationManager.instance = new LocationManager();
    }
    return LocationManager.instance;
  }

  /**
   * Start tracking the user's location
   */
  public startTracking(): void {
    if (this.watchId !== null) return;

    this.resetRetry();
    this.initiateWatch();
  }

  /**
   * Stop tracking and cleanup
   */
  public stopTracking(): void {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    this.clearTimers();
    this.updateStatus(LocationStatus.DISCONNECTED);
  }

  /**
   * Get the most recently stored valid location
   */
  public getLastLocation(): LocationUpdate | null {
    return this.lastLocation;
  }

  /**
   * Get current tracking status
   */
  public getStatus(): LocationStatus {
    return this.status;
  }

  // --- Subscriptions ---

  public onLocationUpdate(callback: LocationUpdateCallback): () => void {
    this.onLocationUpdateListeners.push(callback);
    return () => {
      this.onLocationUpdateListeners = this.onLocationUpdateListeners.filter(l => l !== callback);
    };
  }

  public onError(callback: ErrorCallback): () => void {
    this.onErrorListeners.push(callback);
    return () => {
      this.onErrorListeners = this.onErrorListeners.filter(l => l !== callback);
    };
  }

  public onStatusChange(callback: StatusChangeCallback): () => void {
    this.onStatusChangeListeners.push(callback);
    return () => {
      this.onStatusChangeListeners = this.onStatusChangeListeners.filter(l => l !== callback);
    };
  }

  // --- Private Helpers ---

  private initiateWatch(): void {
    this.updateStatus(this.retryCount > 0 ? LocationStatus.RETRYING : LocationStatus.DISCONNECTED);

    this.watchId = Geolocation.watchPosition(
      (position: GeoPosition) => this.handleSuccess(position),
      (error: GeoError) => this.handleError(error),
      {
        enableHighAccuracy: true,
        distanceFilter: 10,
        interval: 5000,
        fastestInterval: 2000,
        showLocationDialog: true,
      }
    );

    this.startStaleTimer();
  }

  private handleSuccess(position: GeoPosition): void {
    const { latitude, longitude, accuracy } = position.coords;

    // Accuracy Validation
    if (accuracy > this.ACCURACY_THRESHOLD) {
      console.warn(`[LocationManager] Rejected location with low accuracy: ${accuracy}m`);
      return;
    }

    const update: LocationUpdate = {
      latitude,
      longitude,
      accuracy,
      timestamp: position.timestamp,
    };

    this.lastLocation = update;
    this.resetRetry();
    this.updateStatus(LocationStatus.CONNECTED);
    this.resetStaleTimer();

    // Notify listeners
    this.onLocationUpdateListeners.forEach(listener => listener(update));
  }

  private handleError(error: GeoError): void {
    const errorCode = error.code as unknown as LocationErrorType;
    const isPermissionDenied = errorCode === LocationErrorType.PERMISSION_DENIED;
    
    const locError: LocationError = {
      type: errorCode,
      message: error.message,
      isRecoverable: !isPermissionDenied && this.retryCount < this.maxRetries,
    };

    this.onErrorListeners.forEach(listener => listener(locError));

    if (isPermissionDenied) {
      this.updateStatus(LocationStatus.PERMISSION_DENIED);
      this.stopTracking();
      return;
    }

    this.handleRetry();
  }

  private handleRetry(): void {
    if (this.retryCount >= this.maxRetries) {
      console.error('[LocationManager] Max retries reached. Stopping tracking.');
      this.stopTracking();
      return;
    }

    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    this.updateStatus(LocationStatus.RETRYING);
    
    const delay = Math.pow(2, this.retryCount) * 1000;
    this.retryCount++;

    console.log(`[LocationManager] Retrying in ${delay}ms (Attempt ${this.retryCount}/${this.maxRetries})`);

    this.retryTimer = setTimeout(() => {
      this.initiateWatch();
    }, delay);
  }

  private resetRetry(): void {
    this.retryCount = 0;
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
  }

  private updateStatus(newStatus: LocationStatus): void {
    if (this.status !== newStatus) {
      this.status = newStatus;
      this.onStatusChangeListeners.forEach(listener => listener(newStatus));
    }
  }

  private startStaleTimer(): void {
    this.resetStaleTimer();
  }

  private resetStaleTimer(): void {
    if (this.staleTimer) clearTimeout(this.staleTimer);
    
    this.staleTimer = setTimeout(() => {
      console.warn('[LocationManager] Stale data detected: No update for 30 seconds.');
      this.onErrorListeners.forEach(listener => listener({
        type: LocationErrorType.TIMEOUT,
        message: 'Stale location data detected',
        isRecoverable: true
      }));
    }, this.STALE_THRESHOLD);
  }

  private clearTimers(): void {
    if (this.staleTimer) {
      clearTimeout(this.staleTimer);
      this.staleTimer = null;
    }
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
  }
}

export default LocationManager.getInstance();
